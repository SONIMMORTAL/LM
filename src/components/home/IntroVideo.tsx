"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { canAttemptIntro, INTRO_VIDEO_CONFIG, isIntroDroppingFrames, supportsSmoothIntro } from "@/lib/intro-playback";

type IntroNavigator = Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
};

/** An optional enhancement: the page is usable while eligibility/loading is checked. */
export function IntroVideo() {
    const [state, setState] = useState<"pending" | "loading" | "playing" | "done">("pending");
    const videoRef = useRef<HTMLVideoElement>(null);
    const cleanupRef = useRef<() => void>(() => {});
    const finished = useRef(false);
    const started = useRef(false);

    const finish = useCallback(() => {
        finished.current = true;
        cleanupRef.current();
        videoRef.current?.pause();
        setState("done");
        try {
            sessionStorage.setItem("hasSeenIntro", "true");
        } catch {
            // Storage is optional, including in private browsing.
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const device = navigator as IntroNavigator;
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let seenIntro = false;
        try {
            seenIntro = Boolean(sessionStorage.getItem("hasSeenIntro"));
        } catch {
            // Device and playback checks still apply without session storage.
        }

        if (!canAttemptIntro({
            mobile: window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches,
            reducedMotion: motion.matches,
            seenIntro,
            saveData: device.connection?.saveData,
            effectiveType: device.connection?.effectiveType,
            deviceMemory: device.deviceMemory,
            hardwareConcurrency: device.hardwareConcurrency,
        }) || !device.mediaCapabilities?.decodingInfo) return;

        // Never take over after the visitor has already started using the page.
        const onInteraction = () => finish();
        const onMotion = () => { if (motion.matches) finish(); };
        window.addEventListener("pointerdown", onInteraction, { passive: true });
        window.addEventListener("touchstart", onInteraction, { passive: true });
        window.addEventListener("keydown", onInteraction);
        window.addEventListener("wheel", onInteraction, { passive: true });
        motion.addEventListener("change", onMotion);

        // Covers a hung capability query, slow download, and autoplay rejection.
        const startupDeadline = window.setTimeout(() => {
            if (!started.current) finish();
        }, 1500);
        const maximumDuration = window.setTimeout(finish, 12_000);

        void device.mediaCapabilities.decodingInfo({ type: "file", video: INTRO_VIDEO_CONFIG })
            .then(info => {
                if (cancelled || finished.current) return;
                if (supportsSmoothIntro(info)) setState("loading");
                else finish();
            })
            .catch(() => { if (!cancelled) finish(); });

        const cleanup = () => {
            cancelled = true;
            window.clearTimeout(startupDeadline);
            window.clearTimeout(maximumDuration);
            window.removeEventListener("pointerdown", onInteraction);
            window.removeEventListener("touchstart", onInteraction);
            window.removeEventListener("keydown", onInteraction);
            window.removeEventListener("wheel", onInteraction);
            motion.removeEventListener("change", onMotion);
        };
        cleanupRef.current = cleanup;
        return cleanup;
    }, [finish]);

    useEffect(() => {
        if (state !== "playing") return;
        const video = videoRef.current;
        if (!video) return;
        let lastTime = video.currentTime;
        let lastProgress = performance.now();
        const monitor = window.setInterval(() => {
            const quality = video.getVideoPlaybackQuality?.();
            if (quality && isIntroDroppingFrames(quality.totalVideoFrames, quality.droppedVideoFrames)) {
                finish();
                return;
            }
            if (video.currentTime !== lastTime) {
                lastTime = video.currentTime;
                lastProgress = performance.now();
            } else if (performance.now() - lastProgress > 750) {
                finish();
            }
        }, 250);
        const onVisibility = () => { if (document.hidden) finish(); };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.clearInterval(monitor);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [state, finish]);

    if (state === "pending" || state === "done") return null;

    return (
        <div
            className={`fixed inset-0 z-[100] bg-noir-void ${state === "playing" ? "visible cursor-pointer" : "invisible pointer-events-none"}`}
            onClick={finish}
        >
            <video
                ref={videoRef}
                src="/intro-light.mp4"
                autoPlay
                playsInline
                muted
                preload="auto"
                disablePictureInPicture
                onPlaying={() => {
                    if (finished.current) return;
                    started.current = true;
                    setState("playing");
                }}
                onEnded={finish}
                onError={finish}
                onStalled={finish}
                onWaiting={() => { if (started.current) finish(); }}
                aria-hidden="true"
                className="h-full w-full object-cover"
            />
            <div className="absolute bottom-8 inset-x-0 flex justify-center">
                <button
                    type="button"
                    onClick={finish}
                    className="rounded-full bg-black/70 px-4 py-3 text-xs font-medium uppercase tracking-[0.3em] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan"
                >
                    Skip intro
                </button>
            </div>
        </div>
    );
}
