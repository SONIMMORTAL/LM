"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScratchMixer } from "@/lib/scratch-engine";
import { claimAudio, onAudioClaim } from "@/lib/audio-bus";
import type { PlatterTelemetry } from "@/components/three/VinylCanvas3D";

export type ScratchStatus = "idle" | "arming" | "live" | "unsupported" | "error";

interface UseScratchDecksOptions {
    /** Stream URL cued on each deck. Null means that deck has nothing on it. */
    sources: [string | null, string | null];
}

function supportsAudioWorklet() {
    return typeof window !== "undefined" && typeof AudioWorkletNode !== "undefined";
}

/**
 * Binds the two 3D platters to the audio mixer.
 *
 * Nothing loads until the listener actually grabs a platter — arming decodes a
 * whole track, so it waits for intent. Once armed the global page player steps
 * aside and the decks own the sound.
 */
export function useScratchDecks({ sources }: UseScratchDecksOptions) {
    const leftPlatter = useRef<PlatterTelemetry | null>(null);
    const rightPlatter = useRef<PlatterTelemetry | null>(null);
    // Stable tuple: a fresh array each render would restart the sampling loop.
    const platterRefs = useMemo(() => [leftPlatter, rightPlatter] as const, []);

    const mixerRef = useRef<ScratchMixer | null>(null);
    const frameRef = useRef<number | null>(null);
    const armedDecksRef = useRef<Set<number>>(new Set());

    const [status, setStatus] = useState<ScratchStatus>("idle");
    const [crossfade, setCrossfade] = useState(0.5);
    const [isCut, setIsCut] = useState(false);

    const isLive = status === "live";

    // ── Sample the platters and drive the playheads ──────────────────
    useEffect(() => {
        if (!isLive) return;

        const tick = () => {
            frameRef.current = requestAnimationFrame(tick);
            const mixer = mixerRef.current;
            if (!mixer) return;

            for (let i = 0; i < 2; i++) {
                if (!armedDecksRef.current.has(i)) continue;
                const telemetry = platterRefs[i].current;
                if (telemetry) mixer.decks[i].setAngularVelocity(telemetry.angularVelocity);
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => {
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        };
    }, [isLive, platterRefs]);

    /** Called the moment a platter is grabbed. Safe to call repeatedly. */
    const armDeck = useCallback(
        async (deckIndex: 0 | 1) => {
            const source = sources[deckIndex];
            if (!source) return;
            if (armedDecksRef.current.has(deckIndex)) return;

            if (!supportsAudioWorklet()) {
                setStatus("unsupported");
                return;
            }

            try {
                if (!mixerRef.current) {
                    setStatus("arming");
                    // Take the room: two sources playing at once is not a mix,
                    // it's a mistake.
                    claimAudio("decks");
                    mixerRef.current = await ScratchMixer.create();
                }

                const mixer = mixerRef.current;
                armedDecksRef.current.add(deckIndex);

                await mixer.decks[deckIndex].load(source);

                if (mixer.decks[deckIndex].state === "ready") {
                    // Cue a little way in rather than at 0:00, so the first
                    // backspin has record to run back through instead of
                    // hitting the start of the track and going silent.
                    const deck = mixer.decks[deckIndex];
                    deck.seekSeconds(Math.min(15, deck.durationSeconds * 0.25));
                    deck.play();
                    setStatus("live");
                } else {
                    armedDecksRef.current.delete(deckIndex);
                    setStatus("error");
                }
            } catch (error) {
                console.error("Failed to arm deck:", error);
                setStatus("error");
            }
        },
        [sources]
    );

    const handleCrossfade = useCallback((position: number) => {
        setCrossfade(position);
        mixerRef.current?.setCrossfade(position);
    }, []);

    const handleCut = useCallback((engaged: boolean) => {
        setIsCut(engaged);
        mixerRef.current?.setCut(engaged);
    }, []);

    /** Stop the decks and hand the room back to the page player. */
    const stopDecks = useCallback(() => {
        const mixer = mixerRef.current;
        mixerRef.current = null;
        armedDecksRef.current.clear();
        setStatus("idle");
        setIsCut(false);
        void mixer?.dispose();
    }, []);

    // Swap the record on a deck that's already spinning. Without this, loading
    // from the crate only took effect on decks that hadn't been armed yet.
    const [leftSource, rightSource] = sources;
    useEffect(() => {
        const mixer = mixerRef.current;
        if (!mixer) return;

        ([leftSource, rightSource] as const).forEach((source, index) => {
            if (!source || !armedDecksRef.current.has(index)) return;

            const deck = mixer.decks[index];
            if (deck.loadedUrl === source) return;

            void (async () => {
                await deck.load(source);
                if (deck.state !== "ready") return;
                deck.seekSeconds(Math.min(15, deck.durationSeconds * 0.25));
                deck.play();
            })();
        });
    }, [leftSource, rightSource]);

    // Hand the room back when the mini player or a video embed takes over.
    useEffect(() => onAudioClaim("decks", stopDecks), [stopDecks]);

    useEffect(() => {
        return () => {
            const mixer = mixerRef.current;
            mixerRef.current = null;
            void mixer?.dispose();
        };
    }, []);

    return {
        platterRefs,
        status,
        isLive,
        crossfade,
        isCut,
        armDeck,
        setCrossfade: handleCrossfade,
        setCut: handleCut,
        stopDecks,
    };
}
