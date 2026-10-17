"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// The VHS colour grade is baked into these encodes (H.264 Main, streamable), so phones only
// decode and draw them — no filter runs on the video while it plays.
const TAPE_SRC = "/lost-city-tape.mp4"; // 640x360, ~370 kbps
const TAPE_LITE_SRC = "/lost-city-tape-lite.mp4"; // 426x240, ~160 kbps, for slow connections

// Phones only: wide screens swap to the room after hydration, and shouldn't start downloading it.
// Set on the <source>, so the browser decides before any script runs.
const PHONE_MEDIA = "(max-width: 1023px), (pointer: coarse)";

type NetworkHints = Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };

/** What the VCR readout in the corner shows; nothing while the tape is still loading */
type Deck = "loading" | "stopped" | "playing" | "paused";

/** How long to wait for frames before offering the tap-to-play readout */
const AUTOPLAY_GRACE_MS = 2000;

/**
 * The whole Lost City video running muted behind the mobile hero, like a tape left playing
 * in the deck, with VHS scanlines, grain and a rolling tracking band over it.
 *
 * It's in the server HTML, so it starts as the page appears. The video itself is never
 * hidden — some phones won't autoplay a video they can't see — instead the Dungeon Crew
 * mural sits over it and fades away once frames are moving.
 *
 * Phones that hold autoplay back (iPhone Low Power Mode, in-app browsers like Instagram's)
 * keep the mural and a blinking PLAY readout; the first tap anywhere on the page starts the
 * tape. The readout doubles as the pause button.
 */
export function LostCityHeroTape() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const pausedByViewer = useRef(false);
    const [deck, setDeck] = useState<Deck>("loading");

    useEffect(() => {
        const wrap = wrapRef.current;
        const video = videoRef.current;
        if (!wrap || !video) return;

        // iOS only autoplays a video it knows is muted, and React can leave `muted` out of the server HTML
        video.muted = true;
        video.defaultMuted = true;

        // A refusal (iPhone Low Power Mode, in-app browsers) shows the tap-to-play readout
        const play = () =>
            video.play().catch(() => {
                if (video.paused) setDeck((current) => (current === "loading" ? "stopped" : current));
            });

        // Set on the DOM rather than in state so the CSS can lift the mural even if the tape
        // was already rolling from the server HTML before React hydrated.
        const onPlaying = () => {
            wrap.setAttribute("data-playing", "");
            setDeck("playing");
        };
        const onPause = () => setDeck(wrap.hasAttribute("data-playing") ? "paused" : "stopped");
        video.addEventListener("playing", onPlaying);
        video.addEventListener("pause", onPause);

        // Autoplay held back? The first tap anywhere — except on the readout, which has its own
        // job — counts as permission on every phone.
        const unlock = (event: Event) => {
            if (wrap.contains(event.target as Node)) return;
            if (video.paused && !pausedByViewer.current) void play();
        };
        const gestures = ["touchend", "click", "keydown"] as const;
        gestures.forEach((type) => document.addEventListener(type, unlock, { passive: true }));
        const stopListening = () => gestures.forEach((type) => document.removeEventListener(type, unlock));
        video.addEventListener("playing", stopListening, { once: true });

        // No point decoding video nobody can see; pick the tape back up when it's on screen again
        let onScreen = true;
        const resume = () => {
            if (onScreen && !document.hidden && !pausedByViewer.current) void play();
        };
        const observer = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            if (onScreen) resume();
            else video.pause();
        });
        observer.observe(wrap);
        document.addEventListener("visibilitychange", resume);

        // One frame in — so a desktop that swaps straight to the room never gets here — pick
        // the encode: the light one on a slow connection or Data Saver, and the full one loaded
        // directly if the phone-only <source> didn't match (a desktop that chose this view).
        // Then either it's already rolling from the server HTML, or ask it to start.
        const first = requestAnimationFrame(() => {
            const network = (navigator as NetworkHints).connection;
            const slow = network?.saveData || ["slow-2g", "2g", "3g"].includes(network?.effectiveType ?? "");
            if (slow && !video.currentSrc.endsWith(TAPE_LITE_SRC)) video.src = TAPE_LITE_SRC;
            else if (!video.currentSrc) video.src = TAPE_SRC;

            if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onPlaying();
            else resume();
        });
        // Nothing moving after a couple of seconds (a stalled start, or a refusal that never said so)
        const grace = window.setTimeout(() => {
            if (video.paused) setDeck((current) => (current === "loading" ? "stopped" : current));
        }, AUTOPLAY_GRACE_MS);

        return () => {
            cancelAnimationFrame(first);
            window.clearTimeout(grace);
            video.removeEventListener("playing", onPlaying);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("playing", stopListening);
            stopListening();
            document.removeEventListener("visibilitychange", resume);
            observer.disconnect();
        };
    }, []);

    const toggle = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            pausedByViewer.current = false;
            void video.play().catch(() => {});
        } else {
            pausedByViewer.current = true;
            video.pause();
        }
    };

    return (
        <div ref={wrapRef} className="group pointer-events-none absolute inset-0 overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                tabIndex={-1}
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
            >
                <source src={TAPE_SRC} type="video/mp4" media={PHONE_MEDIA} />
            </video>

            {/* VHS layers, only once the tape is rolling */}
            <div aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-500 group-data-[playing]:opacity-100">
                <div className="vhs-noise" />
                <div className="vhs-tracking" />
                <div className="crt-scanlines absolute inset-0 opacity-70" />
            </div>

            {/* The mural, until frames are moving */}
            <div className="absolute inset-0 transition-opacity duration-500 group-data-[playing]:opacity-0">
                <Image
                    src="/brand/dungeon-crew.png"
                    alt="Loaf Records Crew in The Dungeon — Shadow The Great, King illa, Ruggz, Rah Tha Ruler, Oso Dope"
                    fill
                    priority
                    sizes="(max-width: 768px) 96vw, 680px"
                    className="object-cover object-center scale-[1.02]"
                />
            </div>

            {/* The tape catching as it starts */}
            <div aria-hidden className="crt-static-burst absolute inset-0 hidden group-data-[playing]:block" />

            {/* VCR readout, and the play/pause button */}
            {deck !== "loading" && (
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={deck === "playing" ? "Pause the Lost City video" : "Play the Lost City video"}
                    className="vhs-osd pointer-events-auto absolute right-1.5 top-1.5 z-[1] min-h-11 min-w-11 px-2 py-2 text-right font-mono font-bold uppercase leading-tight text-white"
                >
                    {deck === "playing" && (
                        <>
                            <span className="block text-[13px] tracking-[0.14em]">Play ►</span>
                            <span className="block text-[10px] tracking-[0.2em] opacity-85">SP</span>
                        </>
                    )}
                    {deck === "paused" && <span className="block text-[13px] tracking-[0.14em]">Pause ❚❚</span>}
                    {deck === "stopped" && (
                        <>
                            <span className="block text-[13px] tracking-[0.14em] motion-safe:animate-pulse">► Play</span>
                            <span className="block text-[10px] tracking-[0.2em] opacity-85">Tap</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
