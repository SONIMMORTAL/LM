import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Exercises the turntable playhead outside the browser by standing in for the
 * AudioWorklet globals. These are the behaviours that were actually broken
 * during development: a held record kept playing, and reverse didn't exist.
 */

const SAMPLE_RATE = 48000;
const BLOCK = 128;

type ParamMap = { rate: Float32Array; gain: Float32Array };

interface Playhead {
    position: number;
    port: {
        postMessage(message: unknown): void;
        onmessage: ((event: { data: unknown }) => void) | null;
    };
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: ParamMap): boolean;
}

type PlayheadConstructor = new () => Playhead;

let ProcessorClass: PlayheadConstructor;

/** The worklet globals the processor expects to find. */
const globals = globalThis as unknown as Record<string, unknown>;

function send(p: Playhead, data: unknown) {
    if (!p.port.onmessage) throw new Error('processor never registered a port handler');
    p.port.onmessage({ data });
}

before(async () => {
    globals.sampleRate = SAMPLE_RATE;
    globals.AudioWorkletProcessor = class {
        port = { postMessage() {}, onmessage: null };
    };
    globals.registerProcessor = (_name: string, cls: PlayheadConstructor) => {
        ProcessorClass = cls;
    };

    // Indirect specifier: the worklet is a side-effect script that calls
    // registerProcessor, not a module, so it isn't tsc's business.
    const workletPath = '../public/worklets/scratch-processor.js';
    await import(workletPath);
});

/** A 1-second ramp from 0..1 — position is readable straight off the value. */
function rampBuffer(frames = SAMPLE_RATE) {
    const data = new Float32Array(frames);
    for (let i = 0; i < frames; i++) data[i] = i / frames;
    return data;
}

function makeProcessor(startFrame = SAMPLE_RATE / 2): Playhead {
    const p = new ProcessorClass();
    send(p, { type: 'load', channels: [rampBuffer()] });
    send(p, { type: 'play' });
    send(p, { type: 'seek', frame: startFrame });
    return p;
}

/** Run `blocks` render quanta at a fixed rate; return the last block. */
function render(p: Playhead, rate: number, blocks: number) {
    const out = [new Float32Array(BLOCK)];
    for (let b = 0; b < blocks; b++) {
        out[0] = new Float32Array(BLOCK);
        p.process([], [out], { rate: new Float32Array([rate]), gain: new Float32Array([1]) });
    }
    return out[0];
}

describe('scratch playhead', () => {
    test('plays forward at rate 1', () => {
        const p = makeProcessor();
        const before = p.position;
        render(p, 1, 10);
        assert.equal(Math.round(p.position - before), BLOCK * 10);
    });

    test('plays backwards at rate -1 — the reason this is not an AudioBufferSourceNode', () => {
        const p = makeProcessor();
        const before = p.position;
        render(p, -1, 10);
        assert.equal(Math.round(p.position - before), -BLOCK * 10);
    });

    test('pitch bends: rate 2 covers twice the ground', () => {
        const p = makeProcessor();
        const before = p.position;
        render(p, 2, 10);
        assert.equal(Math.round(p.position - before), BLOCK * 20);
    });

    test('a held record does not move and falls silent', () => {
        const p = makeProcessor();
        const before = p.position;
        const block = render(p, 0, 200); // long enough for the stall glide

        assert.equal(p.position, before, 'playhead must not drift while held');
        const peak = block.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
        assert.ok(peak < 1e-3, `held record should be silent, got peak ${peak}`);
    });

    test('a moving record is audible', () => {
        // Start near the front so 100 blocks stay well inside the record.
        const p = makeProcessor(1000);
        const block = render(p, 1, 100);
        const peak = block.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
        assert.ok(peak > 0.1, `moving record should be audible, got peak ${peak}`);
    });

    test('stops at the start of the record instead of running off the front', () => {
        const p = makeProcessor(200);
        render(p, -1, 20); // would reach -2360 if unclamped
        assert.ok(p.position >= 0, `playhead ran off the front to ${p.position}`);
    });

    test('recovers when pushed forward again off the start', () => {
        const p = makeProcessor(10);
        render(p, -1, 20);       // pin it at the start
        assert.ok(p.position <= 1);
        render(p, 1, 10);        // push forward
        assert.ok(p.position > 100, `expected the groove to pick back up, at ${p.position}`);
    });

    test('stops at the end of the record', () => {
        const p = makeProcessor(SAMPLE_RATE - 300);
        render(p, 1, 20);
        assert.ok(p.position <= SAMPLE_RATE - 1, `ran past the end to ${p.position}`);
    });

    test('gain of 0 mutes — the crossfader and cut depend on it', () => {
        const p = makeProcessor();
        const out = [new Float32Array(BLOCK)];
        p.process([], [out], { rate: new Float32Array([1]), gain: new Float32Array([0]) });
        assert.ok(out[0].every((v) => v === 0));
    });

    test('outputs silence before anything is loaded', () => {
        const p = new ProcessorClass();
        const out = [new Float32Array(BLOCK).fill(0.5)];
        p.process([], [out], { rate: new Float32Array([1]), gain: new Float32Array([1]) });
        assert.ok(out[0].every((v) => v === 0));
    });
});
