"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DungeonMenu } from "@/components/home/DungeonMenu";

export default function HomeClient() {
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        if (sessionStorage.getItem("hasSeenIntro")) {
            setShowIntro(false);
        }
    }, []);

    const handleIntroEnd = () => {
        setShowIntro(false);
        sessionStorage.setItem("hasSeenIntro", "true");
    };

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
                            src="/introvid.mp4"
                            autoPlay
                            playsInline
                            muted
                            onEnded={handleIntroEnd}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 pointer-events-none">
                            <span className="text-noir-ash text-xs tracking-[0.3em] uppercase font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                                Click to skip
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* THE MENU */}
            <DungeonMenu />
        </div>
    );
}
