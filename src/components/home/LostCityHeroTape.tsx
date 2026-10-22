"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// The VHS colour grade is baked into these encodes (H.264 Main, streamable), so phones only
// decode and draw them — no filter runs on the video while it plays.
const TAPE_SRC = "/lost-city-tape.mp4"; // 640x360, ~370 kbps
const TAPE_LITE_SRC = "/lost-city-tape-lite.mp4"; // 426x240, ~160 kbps, for slow connections
// The whole video again as an animated image (AV1, 384x216, 12 fps, 2.5 MB). Phones that refuse
// to autoplay video still play moving images, so this is what plays when the video can't.
const TAPE_FILM_SRC = "/lost-city-tape-loop.avif";

// Phones only: wide screens swap to the room after hydration, and shouldn't start downloading it.
// Set on the <source>, so the browser decides before any script runs.
const PHONE_MEDIA = "(max-width: 1023px), (pointer: coarse)";

type NetworkHints = Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };

/** What the VCR readout in the corner shows; nothing until the tape is rolling */
type Deck = "loading" | "playing" | "paused";

/** Loaded but still not moving after this long means the phone is quietly refusing to play it */
const SILENT_REFUSAL_MS = 2500;

/**
 * The whole Lost City video running muted behind the mobile hero, like a tape left playing
 * in the deck, with VHS scanlines, grain and a rolling tracking band over it.
 *
 * It's in the server HTML, so it starts as the page appears. The video itself is never
 * hidden — some phones won't autoplay a video they can't see — instead the Dungeon Crew
 * mural sits over it and fades away once frames are moving.
 *
 * Some phones won't autoplay video at all: iPhones in Low Power Mode, in-app browsers like
 * Instagram's. There the tape switches to the same footage as a moving image, which no phone
 * holds back: iPhones play the lite MP4 as an image, everything else the animated AVIF.
 * Either way nobody has to tap. The readout doubles as the pause button.
 */
export function LostCityHeroTape() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const pausedByViewer = useRef(false);
    const [deck, setDeck] = useState<Deck>("loading");
    /** Playing the moving-image version because this phone won't autoplay video */
    const [film, setFilm] = useState(false);

    useEffect(() => {
        const wrap = wrapRef.current;
        const video = videoRef.current;
        if (!wrap || !video) return;

        // iOS only autoplays a video it knows is muted, and React can leave `muted` out of the server HTML
        video.muted = true;
        video.defaultMuted = true;

        let refused = false;
        const switchToFilm = () => {
            if (refused) return;
            refused = true;
            video.pause();
            video.removeAttribute("src");
            setFilm(true);
        };

        const play = () =>
            video.play().catch((error: unknown) => {
                if (error instanceof DOMException && error.name === "NotAllowedError") switchToFilm();
            });

        // Set on the DOM rather than in state so the CSS can lift the mural even if the tape
        // was already rolling from the server HTML before React hydrated.
        const onPlaying = () => {
            wrap.setAttribute("data-playing", "");
            setDeck("playing");
        };
        const onPause = () => {
            if (!refused) setDeck(wrap.hasAttribute("data-playing") ? "paused" : "loading");
        };
        video.addEventListener("playing", onPlaying);
        video.addEventListener("pause", onPause);

        // No point decoding video nobody can see; pick the tape back up when it's on screen again
        let onScreen = true;
        const resume = () => {
            if (!refused && onScreen && !document.hidden && !pausedByViewer.current) void play();
        };
        const observer = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            if (refused) return;
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

        // Some browsers hold autoplay back without ever saying so: the video has loaded,
        // nobody paused it, it's on screen, and it still isn't moving
        const silent = window.setTimeout(() => {
            if (
                video.paused &&
                !pausedByViewer.current &&
                onScreen &&
                !document.hidden &&
                video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
            ) {
                switchToFilm();
            }
        }, SILENT_REFUSAL_MS);

        return () => {
            cancelAnimationFrame(first);
            window.clearTimeout(silent);
            video.removeEventListener("playing", onPlaying);
            video.removeEventListener("pause", onPause);
            document.removeEventListener("visibilitychange", resume);
            observer.disconnect();
        };
    }, []);

    // Once React has taken the video's <source> out, reloading it stops the download
    useEffect(() => {
        if (film) videoRef.current?.load();
    }, [film]);

    // The moving image is showing: lift the mural, start the readout
    const onFilmLoad = () => {
        wrapRef.current?.setAttribute("data-playing", "");
        setDeck("playing");
    };

    const toggle = () => {
        const wrap = wrapRef.current;
        if (film) {
            // A moving image can't pause, so pausing puts the mural back over it
            const pausing = deck === "playing";
            pausedByViewer.current = pausing;
            if (pausing) wrap?.removeAttribute("data-playing");
            else wrap?.setAttribute("data-playing", "");
            setDeck(pausing ? "paused" : "playing");
            return;
        }
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
                className={cn("absolute inset-0 h-full w-full object-cover", film && "hidden")}
            >
                {!film && <source src={TAPE_SRC} type="video/mp4" media={PHONE_MEDIA} />}
            </video>

            {film && (
                <picture>
                    {/* iPhones play an MP4 as an image, even where video autoplay is off */}
                    <source type="video/mp4" srcSet={TAPE_LITE_SRC} />
                    <source type="image/avif" srcSet={TAPE_FILM_SRC} />
                    {/* A plain <img> (alt="" keeps it decorative): next/image can't carry a video source */}
                    <img
                        src={TAPE_FILM_SRC}
                        alt=""
                        decoding="async"
                        onLoad={onFilmLoad}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </picture>
            )}

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
                    {deck === "playing" ? (
                        <>
                            <span className="block text-[13px] tracking-[0.14em]">Play ►</span>
                            <span className="block text-[10px] tracking-[0.2em] opacity-85">SP</span>
                        </>
                    ) : (
                        <span className="block text-[13px] tracking-[0.14em]">Pause ❚❚</span>
                    )}
                </button>
            )}
        </div>
    );
}
