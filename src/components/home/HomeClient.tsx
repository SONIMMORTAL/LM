"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DungeonMenu } from "@/components/home/DungeonMenu";
import { MobileStudioLanding } from "@/components/home/MobileStudioLanding";
import type { Track } from "@/lib/tracks-server";
import type { PrintfulProduct } from "@/lib/printful";

/**
 * Whether the intro should be suppressed for this visitor: either they've
 * already seen it this session, or they've asked for reduced motion and a
 * ten-second full-screen animation is exactly what that setting is about.
 *
 * Read through useSyncExternalStore rather than an effect, so the answer is
 * known during hydration — an effect would render the intro first and yank it
 * away a frame later for everyone who shouldn't have seen it.
 */
function subscribeToMotionPreference(onChange: () => void) {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

function readIntroSuppressed() {
    try {
        if (sessionStorage.getItem("hasSeenIntro")) return true;
    } catch {
        /* private browsing — fall through to the motion preference */
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The server can't know either fact, so it assumes a first-time visitor.
const introSuppressedOnServer = () => false;

function subscribeToMobileViewport(onChange: () => void) {
    const mqWidth = window.matchMedia("(max-width: 1023px)");
    const mqTouch = window.matchMedia("(pointer: coarse)");
    mqWidth.addEventListener("change", onChange);
    mqTouch.addEventListener("change", onChange);
    return () => {
        mqWidth.removeEventListener("change", onChange);
        mqTouch.removeEventListener("change", onChange);
    };
}

function readIsMobileViewport() {
    return (
        window.matchMedia("(max-width: 1023px)").matches ||
        window.matchMedia("(pointer: coarse)").matches
    );
}

const isMobileOnServer = () => true;

interface HomeClientProps {
    initialTracks?: Track[];
    initialProducts?: PrintfulProduct[];
}

export default function HomeClient({
    initialTracks = [],
    initialProducts = [],
}: HomeClientProps) {
    const introSuppressed = useSyncExternalStore(
        subscribeToMotionPreference,
        readIntroSuppressed,
        introSuppressedOnServer
    );

    const isMobileViewport = useSyncExternalStore(
        subscribeToMobileViewport,
        readIsMobileViewport,
        isMobileOnServer
    );

    const [dismissed, setDismissed] = useState(false);
    const [viewOverride, setViewOverride] = useState<"studio" | "room" | null>(null);

    const showIntro = !introSuppressed && !dismissed;
    const activeExperience =
        viewOverride !== null ? viewOverride : isMobileViewport ? "studio" : "room";

    const handleIntroEnd = useCallback(() => {
        setDismissed(true);
        try {
            sessionStorage.setItem("hasSeenIntro", "true");
        } catch {
            /* the intro simply plays again next visit */
        }
    }, []);

    // Escape / Enter / Space skip it, the same as clicking.
    useEffect(() => {
        if (!showIntro) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (["Escape", "Enter", " ", "Spacebar"].includes(e.key)) {
                e.preventDefault();
                handleIntroEnd();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showIntro, handleIntroEnd]);

    return (
        <div className="relative">
            {/* INTRO SPLASH */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-noir-void flex items-center justify-center cursor-pointer"
                        onClick={handleIntroEnd}
                    >
                        <video
                            autoPlay
                            playsInline
                            muted
                            preload="auto"
                            poster="/intro-poster.jpg"
                            onEnded={handleIntroEnd}
                            // Never strand the visitor behind a broken splash.
                            onError={handleIntroEnd}
                            aria-hidden="true"
                            className="w-full h-full object-cover"
                        >
                            <source src="/intro.webm" type="video/webm" />
                            <source src="/intro.mp4" type="video/mp4" />
                        </video>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                            <button
                                type="button"
                                onClick={handleIntroEnd}
                                className="text-noir-ash hover:text-white text-xs tracking-[0.3em] uppercase font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan"
                            >
                                Skip intro
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BESPOKE MOBILE 3D STUDIO LANDING vs DESKTOP 3D CRATE ROOM */}
            {activeExperience === "studio" ? (
                <MobileStudioLanding
                    tracks={initialTracks}
                    products={initialProducts}
                    onSwitchToRoom={() => setViewOverride("room")}
                />
            ) : (
                <DungeonMenu onSwitchToStudio={() => setViewOverride("studio")} />
            )}
        </div>
    );
}
