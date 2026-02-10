"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatrixRain } from "@/components/ui/MatrixRain";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnterOverlayProps {
    onEnter: () => void;
}

export function EnterOverlay({ onEnter }: EnterOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleEnter = () => {
        setIsVisible(false);
        // Wait for exit animation to finish before calling parent onEnter (if needed)
        // But usually we want immediate feedback, so we call it now to trigger any state changes
        // The AnimatePresence in parent or self serves to handle the unmount animation
        onEnter();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -50, transition: { duration: 0.8, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
                >
                    {/* Matrix Background */}
                    <MatrixRain color="#22d3ee" fontSize={16} speed={1.2} />

                    {/* Content Overlay */}
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="mb-8 text-center"
                        >
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2">
                                LOAF RECORDS
                            </h1>
                            <p className="text-accent-cyan tracking-[0.3em] text-sm md:text-base uppercase animate-pulse">
                                System Offline // Initialize
                            </p>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.5 }}
                            onClick={handleEnter}
                            className={cn(
                                "group relative px-8 py-3 bg-transparent overflow-hidden rounded-none",
                                "border border-accent-cyan/50 hover:border-accent-cyan",
                                "transition-all duration-300"
                            )}
                        >
                            <div className="absolute inset-0 w-0 bg-accent-cyan transition-all duration-[250ms] ease-out group-hover:w-full opacity-10" />
                            <div className="flex items-center gap-3">
                                <span className="text-accent-cyan group-hover:text-white font-mono text-lg tracking-widest transition-colors">
                                    ENTER SYSTEM
                                </span>
                                <Play className="w-4 h-4 text-accent-cyan group-hover:text-white transition-colors" />
                            </div>
                        </motion.button>
                    </div>

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[url('/scanline.png')] opacity-10 bg-repeat" />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-accent-cyan/5 to-transparent h-[10px] w-full animate-scan" />

                </motion.div>
            )}
        </AnimatePresence>
    );
}
