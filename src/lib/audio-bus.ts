/**
 * One sound source at a time.
 *
 * The site has three things that can make noise — the mini player, the
 * turntable decks, and the YouTube embeds — and until now they arbitrated in
 * ad-hoc pairs (or not at all), so it was easy to end up with two playing over
 * each other. Everything that can produce audio claims the room before it
 * starts; everyone else hears the claim and stops.
 */

export type AudioOwner = "player" | "decks" | "video";

const CLAIM_EVENT = "loaf:audio-claim";

/**
 * Announce that `owner` is about to make sound. Every other source yields.
 * Safe to call repeatedly — re-claiming by the current owner is a no-op for
 * everyone else.
 */
export function claimAudio(owner: AudioOwner) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(CLAIM_EVENT, { detail: { owner } }));
}

/**
 * Yield the room when someone else claims it. Returns an unsubscribe function.
 * `self` is the caller's own identity, so its own claims don't stop it.
 */
export function onAudioClaim(self: AudioOwner, yieldControl: () => void): () => void {
    if (typeof window === "undefined") return () => {};

    const handler = (event: Event) => {
        const owner = (event as CustomEvent<{ owner?: AudioOwner }>).detail?.owner;
        if (owner && owner !== self) yieldControl();
    };

    window.addEventListener(CLAIM_EVENT, handler);
    return () => window.removeEventListener(CLAIM_EVENT, handler);
}

/* ── Master volume ──────────────────────────────────────────────────
 * The decks used to run at a fixed level while the mini player had its own
 * slider, so turning the music down did nothing to a record you were
 * scratching. One value now governs both.
 */

const VOLUME_EVENT = "loaf:audio-volume";

let masterVolume = 0.8;

export function getMasterVolume() {
    return masterVolume;
}

export function setMasterVolume(value: number) {
    masterVolume = Math.max(0, Math.min(1, value));
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(VOLUME_EVENT, { detail: { volume: masterVolume } }));
}

/** Subscribe to master volume changes. Returns an unsubscribe function. */
export function onMasterVolume(handler: (volume: number) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const listener = (event: Event) => {
        const volume = (event as CustomEvent<{ volume?: number }>).detail?.volume;
        if (typeof volume === "number") handler(volume);
    };

    window.addEventListener(VOLUME_EVENT, listener);
    return () => window.removeEventListener(VOLUME_EVENT, listener);
}
