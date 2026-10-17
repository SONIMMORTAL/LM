"use client";

/**
 * Zero-dependency procedural Web Audio foley synthesizer.
 * Generates tactile studio sounds (crate sleeve flip, VHS cassette clunk,
 * vinyl stylus needle drop) in <2 KB with zero network requests.
 * Automatically respects `prefers-reduced-motion` and silent/locked contexts.
 */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        return null;
    }
    if (!sharedCtx) {
        const Ctx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext;
        if (!Ctx) return null;
        try {
            sharedCtx = new Ctx();
        } catch {
            return null;
        }
    }
    if (sharedCtx.state === "suspended") {
        sharedCtx.resume().catch(() => {});
    }
    return sharedCtx;
}

/**
 * Soft cardboard sleeve brush + low wooden crate thump when flipping records.
 */
export function playCrateFlipSfx(): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;

        // 1. Filtered noise burst (paper sleeve friction)
        const duration = 0.055;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const env = Math.sin((i / bufferSize) * Math.PI);
            data[i] = (Math.random() * 2 - 1) * env;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.exponentialRampToValueAtTime(650, now + duration);
        filter.Q.value = 1.8;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);

        // 2. Subtle low thump (sleeve settling against wood crate)
        const osc = ctx.createOscillator();
        const thumpGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.045);

        thumpGain.gain.setValueAtTime(0.05, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(thumpGain);
        thumpGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    } catch {
        // Ignore audio errors on restricted devices
    }
}

/**
 * Mechanical VHS cassette deck load clunk + brief CRT static burst.
 */
export function playVhsClunkSfx(): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;

        // 1. Mechanical transport latch clunk (two-stage low transient)
        const osc = ctx.createOscillator();
        const clunkGain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.065);

        clunkGain.gain.setValueAtTime(0.08, now);
        clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(clunkGain);
        clunkGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.075);

        // 2. Brief CRT static / degauss hiss
        const duration = 0.14;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const fade = 1 - i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * fade * fade;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(2400, now + 0.02);
        bandpass.Q.value = 0.9;

        const hissGain = ctx.createGain();
        hissGain.gain.setValueAtTime(0.035, now + 0.02);
        hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02 + duration);

        noise.connect(bandpass);
        bandpass.connect(hissGain);
        hissGain.connect(ctx.destination);
        noise.start(now + 0.02);
    } catch {
        // Ignore audio errors
    }
}

/**
 * Vinyl stylus needle drop thump + warm micro-crackle when cueing a deck.
 */
export function playNeedleDropSfx(): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;

        // Stylus contact thump
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.06);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);

        // Tiny vinyl static pop
        const bufferSize = Math.floor(ctx.sampleRate * 0.04);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() > 0.92 ? (Math.random() * 2 - 1) * 0.8 : 0;
        }

        const pop = ctx.createBufferSource();
        pop.buffer = noiseBuffer;

        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.04, now + 0.015);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        pop.connect(popGain);
        popGain.connect(ctx.destination);
        pop.start(now + 0.015);
    } catch {
        // Ignore audio errors
    }
}
