"use client";

import { useEffect, useRef } from "react";

// Phones only (wide screens swap to the room after hydration), and never for reduced motion.
// Set on the <source>, so the browser decides before any script runs and nothing downloads otherwise.
const TAPE_MEDIA =
    "(prefers-reduced-motion: no-preference) and (max-width: 1023px), (prefers-reduced-motion: no-preference) and (pointer: coarse)";

type DataSaverNavigator = Navigator & { connection?: { saveData?: boolean } };

/**
 * The whole Lost City video running muted behind the mobile hero, like a tape left playing
 * in the deck, with VHS scanlines, grain and a rolling tracking band over it.
 *
 * It's a small self-hosted encode (public/lost-city-hero.mp4, 360p, streamable) in the server
 * HTML, so it starts as the page appears rather than after a player loads. The picture fades
 * in once frames are actually moving; until then, or if a phone refuses autoplay (Low Power
 * Mode, Data Saver), the mural underneath stays.
 */
export function LostCityHeroTape() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        const video = videoRef.current;
        if (!wrap || !video) return;

        if ((navigator as DataSaverNavigator).connection?.saveData) {
            video.querySelector("source")?.remove();
            video.load();
            return;
        }

        // Set on the DOM rather than in state: it may already be playing from the server
        // HTML before React hydrates, in which case the "playing" event has come and gone.
        const reveal = () => wrap.setAttribute("data-playing", "");
        if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) reveal();
        video.addEventListener("playing", reveal);

        // iOS only autoplays a video it knows is muted, and React can leave `muted` out of the server HTML
        video.muted = true;
        const play = () => video.play().catch(() => {});

        // No point decoding video nobody can see; pick the tape back up when it's on screen again
        let onScreen = true;
        const resume = () => {
            if (onScreen && !document.hidden) void play();
        };
        const observer = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            if (onScreen) resume();
            else video.pause();
        });
        observer.observe(wrap);
        document.addEventListener("visibilitychange", resume);

        return () => {
            video.removeEventListener("playing", reveal);
            document.removeEventListener("visibilitychange", resume);
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={wrapRef} aria-hidden className="group pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-data-[playing]:opacity-100">
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
                    className="vhs-picture absolute inset-0 h-full w-full object-cover"
                >
                    <source src="/lost-city-hero.mp4" type="video/mp4" media={TAPE_MEDIA} />
                </video>
                <div className="vhs-noise absolute inset-0" />
                <div className="vhs-tracking" />
                <div className="crt-scanlines absolute inset-0 opacity-70" />
            </div>

            {/* The tape catching as it starts */}
            <div className="crt-static-burst absolute inset-0 hidden group-data-[playing]:block" />
            <div className="vhs-osd absolute right-3.5 top-3.5 z-[1] hidden text-right font-mono font-bold uppercase leading-tight text-white group-data-[playing]:block">
                <span className="block text-[13px] tracking-[0.14em]">Play ►</span>
                <span className="block text-[10px] tracking-[0.2em] opacity-85">SP</span>
            </div>
        </div>
    );
}
