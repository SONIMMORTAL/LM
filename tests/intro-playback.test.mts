import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { canAttemptIntro, supportsSmoothIntro, isIntroDroppingFrames } from '../src/lib/intro-playback.ts';

const capablePhone = { mobile: true, reducedMotion: false, seenIntro: false, hardwareConcurrency: 8, deviceMemory: 8 };

describe('optional intro playback', () => {
    test('resource-limited phones skip before downloading video', () => {
        for (const deviceMemory of [0.5, 1, 2, 4]) {
            assert.equal(canAttemptIntro({ ...capablePhone, deviceMemory }), false);
        }
        for (const hardwareConcurrency of [1, 2, 4, undefined]) {
            assert.equal(canAttemptIntro({ ...capablePhone, hardwareConcurrency }), false);
        }
    });
    test('capable phones still need a separate decoder check', () => {
        assert.equal(canAttemptIntro(capablePhone), true);
        // Safari does not expose deviceMemory; don't mistake that for zero RAM.
        assert.equal(canAttemptIntro({ ...capablePhone, deviceMemory: undefined, hardwareConcurrency: 6 }), true);
    });
    test('motion preference, repeat visits, and data saver always skip', () => {
        for (const preference of [{ reducedMotion: true }, { seenIntro: true }, { saveData: true }]) {
            assert.equal(canAttemptIntro({ ...capablePhone, ...preference }), false);
        }
    });
    test('slow network hints skip even on powerful phones', () => {
        for (const effectiveType of ['slow-2g', '2g', '3g']) {
            assert.equal(canAttemptIntro({ ...capablePhone, effectiveType }), false);
        }
        assert.equal(canAttemptIntro({ ...capablePhone, effectiveType: '4g' }), true);
    });
    test('desktop has a separate resource threshold', () => {
        assert.equal(canAttemptIntro({ ...capablePhone, mobile: false, hardwareConcurrency: 4, deviceMemory: 4 }), true);
        assert.equal(canAttemptIntro({ ...capablePhone, mobile: false, deviceMemory: 2 }), false);
    });
    test('requires supported, smooth AND power-efficient decoding', () => {
        for (const supported of [false, true]) for (const smooth of [false, true]) for (const powerEfficient of [false, true]) {
            assert.equal(supportsSmoothIntro({ supported, smooth, powerEfficient }), supported && smooth && powerEfficient);
        }
    });
    test('dismisses sustained dropped frames but ignores startup and isolated drops', () => {
        assert.equal(isIntroDroppingFrames(0, 0), false);
        assert.equal(isIntroDroppingFrames(4, 2), false);
        assert.equal(isIntroDroppingFrames(24, 1), false);
        assert.equal(isIntroDroppingFrames(24, 5), true);
        assert.equal(isIntroDroppingFrames(120, 13), true);
    });
});
