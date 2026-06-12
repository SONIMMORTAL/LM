"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnterOverlayProps {
    onEnter: () => void;
}

export function EnterOverlay({ onEnter }: EnterOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleEnter = () => {
        setIsVisible(false);
        onEnter();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-noir-void"
                >
                    {/* Ambient radial pulse — pure CSS, no canvas */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,217,255,0.12) 0%, transparent 70%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 animate-[brandPulse_4s_ease-in-out_infinite]"
                        style={{
                            background: "radial-gradient(ellipse 40% 35% at 50% 50%, rgba(0,217,255,0.06) 0%, transparent 60%)",
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="mb-10 text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-black tracking-[-0.04em] text-foreground uppercase mb-3">
                                Loaf Records
                            </h1>
                            <p className="text-noir-ash tracking-[0.25em] text-xs md:text-sm uppercase font-medium">
                                Brooklyn, New York
                            </p>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.4 }}
                            onClick={handleEnter}
                            className={cn(
                                "group relative px-10 py-3.5 overflow-hidden",
                                "border border-noir-smoke hover:border-accent-cyan",
                                "transition-colors duration-300"
                            )}
                        >
                            <div className="absolute inset-0 w-0 bg-accent-cyan/5 transition-all duration-300 ease-out group-hover:w-full" />
                            <span className="relative text-foreground group-hover:text-accent-cyan font-medium text-sm tracking-[0.2em] uppercase transition-colors duration-300">
                                Enter
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
