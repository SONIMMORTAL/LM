"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { claimAudio, getMasterVolume, onAudioClaim } from "@/lib/audio-bus";
import { cn } from "@/lib/utils";

// The VHS colour grade is baked into these encodes (H.264 Main, streamable), so phones only
// decode and draw them — no filter runs on the video while it plays. Both carry the song
// (from God Is Good), lined up with the picture from the first frame; it starts muted.
const TAPE_SRC = "/crunch-time-tape.mp4"; // 640x360, ~360 kbps + 128 kbps AAC
const TAPE_LITE_SRC = "/crunch-time-tape-lite.mp4"; // 426x240, ~155 kbps + 64 kbps AAC, for slow connections
// The whole video again as an animated image (AV1, 384x216, 12 fps, 1.3 MB). Phones that refuse
// to autoplay video still play moving images, so this is what plays when the video can't.
const TAPE_FILM_SRC = "/crunch-time-tape-loop.avif";

// Phones only: wide screens swap to the room after hydration, and shouldn't start downloading it.
// Set on the <source>, so the browser decides before any script runs.
const PHONE_MEDIA = "(max-width: 1023px), (pointer: coarse)";

type NetworkHints = Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };

/** What the VCR readout in the corner shows; nothing until the tape is rolling */
type Deck = "loading" | "playing" | "paused";

/** Loaded but still not moving after this long means the phone is quietly refusing to play it */
const SILENT_REFUSAL_MS = 2500;

/** Set when the viewer mutes the song with the button: their next tap won't bring it back this visit */
const MUTED_KEY = "heroSoundOff";

type ActivationHints = Navigator & {
    userActivation?: { isActive: boolean; hasBeenActive: boolean };
    getAutoplayPolicy?: (type: "mediaelement") => "allowed" | "allowed-muted" | "disallowed";
};

/**
 * Crunch Time ("Crunch Time - Oso Dope , Shadow The Great | Prod by Ruggz") running muted behind
 * the mobile hero, like a tape left playing in the deck, with VHS scanlines, grain and a rolling
 * tracking band over it.
 *
 * It's in the server HTML, so it starts as the page appears. The video itself is never
 * hidden — some phones won't autoplay a video they can't see — instead the Dungeon Crew
 * mural sits over it and fades away once frames are moving.
 *
 * Some phones won't autoplay video at all: iPhones in Low Power Mode, in-app browsers like
 * Instagram's. There the tape switches to the same footage as a moving image, which no phone
 * holds back: iPhones play the lite MP4 as an image, everything else the animated AVIF.
 * Either way nobody has to tap. The readout doubles as the pause button.
 *
 * The song comes on with the tape wherever the browser lets it (someone who tapped their way
 * here from another page). Everywhere else no browser allows sound before the visitor has
 * touched the page, so the tape rolls muted and the song starts on their first tap anywhere,
 * skipping the intro included. The Sound button turns it off and on; turning it off sticks for
 * the visit. Sound takes the room from anything else playing (and gives it back, muted, when
 * something else starts).
 */
export function LostCityHeroTape() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const pausedByViewer = useRef(false);
    /** Stops waiting for the first tap to start the song */
    const stopTapListener = useRef<() => void>(() => {});
    const [deck, setDeck] = useState<Deck>("loading");
    /** Playing the moving-image version because this phone won't autoplay video */
    const [film, setFilm] = useState(false);
    /** The song's on: the viewer tapped Sound */
    const [sound, setSound] = useState(false);

    // Something else started playing: the tape goes quiet but keeps rolling
    useEffect(
        () =>
            onAudioClaim("hero", () => {
                if (videoRef.current) videoRef.current.muted = true;
                setSound(false);
            }),
        []
    );

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

        // The song: on now if the browser allows it, otherwise on the visitor's first tap
        const hints = navigator as ActivationHints;
        const soundOn = () => {
            if (refused) return Promise.resolve(false);
            claimAudio("hero");
            video.volume = getMasterVolume();
            video.muted = false;
            return video
                .play()
                .then(() => {
                    setSound(true);
                    return true;
                })
                .catch(() => {
                    // Not allowed yet: back to a muted tape, and wait for a tap
                    video.muted = true;
                    if (onScreen && !pausedByViewer.current) void play();
                    return false;
                });
        };
        const firstTap = (event: Event) => {
            // A scroll ends in a touch too, but it isn't a tap: only a real tap lets sound start
            if (hints.userActivation && !hints.userActivation.isActive) return;
            if ((event.target as Element | null)?.closest?.("[data-hero-sound]")) return;
            void soundOn().then((on) => on && stopListening());
        };
        const taps = ["pointerup", "touchend", "click", "keydown"] as const;
        const stopListening = () => taps.forEach((type) => document.removeEventListener(type, firstTap, true));
        stopTapListener.current = stopListening;

        let mutedThisVisit = false;
        try {
            mutedThisVisit = sessionStorage.getItem(MUTED_KEY) === "1";
        } catch {
            // Private browsing: no memory of it, so the song comes on as for anyone
        }
        if (!mutedThisVisit) {
            const allowedNow =
                hints.getAutoplayPolicy?.("mediaelement") === "allowed" || hints.userActivation?.hasBeenActive === true;
            const startSound = () => void soundOn().then((on) => !on && taps.forEach((type) => document.addEventListener(type, firstTap, true)));
            if (allowedNow) {
                // Once the tape is rolling, so the song and the picture start together
                if (!video.paused) startSound();
                else video.addEventListener("playing", startSound, { once: true });
            } else {
                taps.forEach((type) => document.addEventListener(type, firstTap, true));
            }
        }

        return () => {
            cancelAnimationFrame(first);
            window.clearTimeout(silent);
            video.removeEventListener("playing", onPlaying);
            video.removeEventListener("pause", onPause);
            document.removeEventListener("visibilitychange", resume);
            observer.disconnect();
            stopListening();
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

    const toggleSound = () => {
        const video = videoRef.current;
        if (!video) return;
        stopTapListener.current();
        if (sound) {
            video.muted = true;
            setSound(false);
            try {
                sessionStorage.setItem(MUTED_KEY, "1");
            } catch {
                // Private browsing: muted for now, not remembered
            }
            return;
        }
        try {
            sessionStorage.removeItem(MUTED_KEY);
        } catch {
            // Private browsing
        }
        claimAudio("hero");
        video.volume = getMasterVolume();
        video.muted = false;
        setSound(true);
        if (video.paused) {
            pausedByViewer.current = false;
            void video.play().catch(() => {});
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

            {/* The studio mural, until frames are moving */}
            <div className="absolute inset-0 transition-opacity duration-500 group-data-[playing]:opacity-0">
                <Image
                    src="/brand/dungeon-studio-4k.webp"
                    alt="Loaf Records crew inside The Dungeon studio — writing, recording, and producing under the LOAF wall piece"
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 768px) 96vw, 680px"
                    className="object-cover object-center"
                />
            </div>

            {/* The tape catching as it starts */}
            <div aria-hidden className="crt-static-burst absolute inset-0 hidden group-data-[playing]:block" />

            {/* The song: a tap away, since no browser starts a video with its sound on */}
            {deck !== "loading" && !film && (
                <button
                    type="button"
                    data-hero-sound
                    onClick={toggleSound}
                    aria-pressed={sound}
                    aria-label={sound ? "Mute Crunch Time" : "Play Crunch Time with sound"}
                    className="vhs-osd pointer-events-auto absolute left-1.5 top-1.5 z-[1] flex min-h-11 items-center gap-1.5 px-2 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-white"
                >
                    <span aria-hidden>{sound ? "♪ Sound on" : "♪ Tap for sound"}</span>
                    {!sound && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] motion-safe:animate-pulse" />}
                </button>
            )}

            {/* VCR readout, and the play/pause button */}
            {deck !== "loading" && (
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={deck === "playing" ? "Pause the Crunch Time header video" : "Play the Crunch Time header video"}
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
