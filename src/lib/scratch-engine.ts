"use client";

import { getMasterVolume, onMasterVolume } from "@/lib/audio-bus";

/**
 * The audio half of the DJ booth. Each platter in the scene drives a deck here;
 * the deck's playhead runs at whatever rate the platter is turning, so a
 * backspin plays the record backwards and a stalled hand stops the music dead.
 *
 * Everything is lazy. Nothing is fetched, decoded or even constructed until the
 * listener actually grabs a platter — decoding a track means downloading all of
 * it, and we are not spending that on visitors who never touch the decks.
 */

/** Angular velocity of a platter at 33 1/3 RPM, in rad/s. Rate 1.0. */
export const NOMINAL_ANGULAR_VELOCITY = 3.49;

const WORKLET_URL = "/worklets/scratch-processor.js";

/** Beyond this the pitch is unlistenable and it just sounds like noise. */
const MAX_RATE = 8;

export type DeckState = "idle" | "loading" | "ready" | "error";

export class ScratchDeck {
    private node: AudioWorkletNode | null = null;
    private gainNode: GainNode;
    private context: AudioContext;

    state: DeckState = "idle";
    /** Source currently loaded, so we don't decode the same track twice. */
    loadedUrl: string | null = null;
    durationSeconds = 0;

    constructor(context: AudioContext, destination: AudioNode) {
        this.context = context;
        this.gainNode = context.createGain();
        this.gainNode.gain.value = 1;
        this.gainNode.connect(destination);
    }

    async load(url: string): Promise<void> {
        if (this.loadedUrl === url && this.state === "ready") return;

        this.state = "loading";
        this.loadedUrl = url;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Stream request failed: ${response.status}`);

            const encoded = await response.arrayBuffer();
            const buffer = await this.context.decodeAudioData(encoded);

            if (!this.node) {
                this.node = new AudioWorkletNode(this.context, "scratch-playhead", {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [Math.min(2, buffer.numberOfChannels)],
                });
                this.node.connect(this.gainNode);
            }

            // Hand the samples to the worklet thread. Transferring the buffers
            // rather than copying keeps a five-minute track off the main thread.
            const channels: Float32Array[] = [];
            for (let c = 0; c < Math.min(2, buffer.numberOfChannels); c++) {
                channels.push(new Float32Array(buffer.getChannelData(c)));
            }

            this.node.port.postMessage(
                { type: "load", channels },
                channels.map((c) => c.buffer)
            );

            this.durationSeconds = buffer.duration;
            this.state = "ready";
        } catch (error) {
            console.error("Deck load failed:", error);
            this.state = "error";
            this.loadedUrl = null;
        }
    }

    private param(name: "rate" | "gain") {
        return this.node?.parameters.get(name) ?? null;
    }

    /**
     * Drive the playhead from the platter. `angularVelocity` is rad/s straight
     * out of the 3D deck, so the visual and the audio can never disagree.
     */
    setAngularVelocity(angularVelocity: number) {
        const rate = Math.max(
            -MAX_RATE,
            Math.min(MAX_RATE, angularVelocity / NOMINAL_ANGULAR_VELOCITY)
        );
        const param = this.param("rate");
        if (!param) return;
        // Short ramp rather than a step: instant jumps in a playback rate click.
        param.setTargetAtTime(rate, this.context.currentTime, 0.008);
    }

    setGain(value: number) {
        const param = this.param("gain");
        if (!param) return;
        param.setTargetAtTime(Math.max(0, Math.min(1, value)), this.context.currentTime, 0.005);
    }

    play() {
        this.node?.port.postMessage({ type: "play" });
    }

    stop() {
        this.node?.port.postMessage({ type: "stop" });
    }

    seekSeconds(seconds: number) {
        this.node?.port.postMessage({
            type: "seek",
            frame: Math.round(seconds * this.context.sampleRate),
        });
    }

    dispose() {
        this.stop();
        this.node?.disconnect();
        this.gainNode.disconnect();
        this.node = null;
    }
}

export class ScratchMixer {
    readonly context: AudioContext;
    readonly decks: [ScratchDeck, ScratchDeck];

    private deckGains: [GainNode, GainNode];
    private master: GainNode;
    private crossfadePosition = 0.5;
    private cutEngaged = false;
    /** The listener's level, shared with the page player. */
    private volume = getMasterVolume();
    private unsubscribeVolume: () => void = () => {};

    private constructor(context: AudioContext) {
        this.context = context;

        this.master = context.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(context.destination);

        // Follow the mini player's slider while the decks are live.
        this.unsubscribeVolume = onMasterVolume((volume) => {
            this.volume = volume;
            if (!this.cutEngaged) {
                this.master.gain.setTargetAtTime(volume, this.context.currentTime, 0.02);
            }
        });

        this.deckGains = [context.createGain(), context.createGain()];
        this.deckGains.forEach((g) => g.connect(this.master));

        this.decks = [
            new ScratchDeck(context, this.deckGains[0]),
            new ScratchDeck(context, this.deckGains[1]),
        ];

        this.applyCrossfade();
    }

    /**
     * Must be called from a user gesture — browsers won't start an AudioContext
     * any other way, and addModule needs the context alive.
     */
    static async create(): Promise<ScratchMixer> {
        const context = new AudioContext({ latencyHint: "interactive" });
        await context.audioWorklet.addModule(WORKLET_URL);
        if (context.state === "suspended") await context.resume();
        return new ScratchMixer(context);
    }

    /** 0 = hard left deck, 1 = hard right, 0.5 = both. */
    setCrossfade(position: number) {
        this.crossfadePosition = Math.max(0, Math.min(1, position));
        this.applyCrossfade();
    }

    get crossfade() {
        return this.crossfadePosition;
    }

    /** The kill switch — a hard, fast mute for chopping the beat in and out. */
    setCut(engaged: boolean) {
        this.cutEngaged = engaged;
        this.master.gain.setTargetAtTime(
            engaged ? 0 : this.volume,
            this.context.currentTime,
            0.004
        );
    }

    get isCut() {
        return this.cutEngaged;
    }

    private applyCrossfade() {
        // Equal-power law, so the middle of the fader isn't a volume dip.
        const angle = this.crossfadePosition * (Math.PI / 2);
        const now = this.context.currentTime;
        this.deckGains[0].gain.setTargetAtTime(Math.cos(angle), now, 0.01);
        this.deckGains[1].gain.setTargetAtTime(Math.sin(angle), now, 0.01);
    }

    async dispose() {
        this.unsubscribeVolume();
        this.decks.forEach((d) => d.dispose());
        this.deckGains.forEach((g) => g.disconnect());
        this.master.disconnect();
        await this.context.close();
    }
}
