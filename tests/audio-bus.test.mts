import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// The bus talks to `window`; an EventTarget is exactly the surface it uses.
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = new EventTarget();

const { claimAudio, onAudioClaim } = await import('../src/lib/audio-bus.ts');

describe('audio bus', () => {
    let yielded: string[] = [];
    let unsubscribes: Array<() => void> = [];

    beforeEach(() => {
        unsubscribes.forEach((off) => off());
        unsubscribes = [];
        yielded = [];
    });

    function listen(owner: 'player' | 'decks' | 'video') {
        unsubscribes.push(onAudioClaim(owner, () => yielded.push(owner)));
    }

    test('a claim stops every other source', () => {
        listen('player');
        listen('decks');
        listen('video');

        claimAudio('decks');

        assert.deepEqual(yielded.sort(), ['player', 'video']);
    });

    test('a claim never stops the claimant itself', () => {
        listen('decks');
        claimAudio('decks');
        assert.deepEqual(yielded, [], 'the decks must not stop themselves when they take the room');
    });

    test('re-claiming is safe to repeat', () => {
        listen('player');
        claimAudio('decks');
        claimAudio('decks');
        claimAudio('decks');
        assert.deepEqual(yielded, ['player', 'player', 'player']);
    });

    test('handing back and forth settles on one owner', () => {
        listen('player');
        listen('decks');

        claimAudio('decks');
        assert.deepEqual(yielded, ['player']);

        claimAudio('player');
        assert.deepEqual(yielded, ['player', 'decks']);
    });

    test('unsubscribing stops delivery', () => {
        const off = onAudioClaim('player', () => yielded.push('player'));
        off();
        claimAudio('decks');
        assert.deepEqual(yielded, []);
    });

    test('ignores events with no owner', () => {
        listen('player');
        (globals.window as EventTarget).dispatchEvent(
            new CustomEvent('loaf:audio-claim', { detail: {} })
        );
        assert.deepEqual(yielded, []);
    });
});
