"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Disc, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { VinylCanvas3D } from "@/components/three/VinylCanvas3D";
import { useState } from "react";

/*
 * The DJ-booth scene. The artwork has two blank turntable platters;
 * we composite real spinning records onto them using 3D WebGL canvases.
 *
 * Coordinates derived from detailed scan and rim analysis of dj-scene.jpg (1536×1024):
 *   Left Platter:
 *     True center: cx = 31.38% (481px), cy = 64.55% (661px)
 *     Width: w = 12.0% (snug fit inside the outer rim of 11.45% diameter)
 *     Aspect ratio: scaleY = 0.59
 *   Right Platter:
 *     True center: cx = 65.36% (1004px), cy = 63.77% (653px)
 *     Width: w = 13.5% (snug fit inside the outer rim of 14.32% diameter)
 *     Aspect ratio: scaleY = 0.73
 */
const DECKS = [
    { cx: 31.38, cy: 61.20, w: 12.0, scaleY: 0.58, rotate: 14 }, // left turntable platter
    { cx: 65.36, cy: 63.77, w: 13.5, scaleY: 0.73, rotate: 0 },  // right turntable platter
] as const;

interface DJSceneHeroProps {
    /** Vinyl PNG for the left deck (the record currently cued up) */
    leftVinyl: string;
    /** Vinyl PNG for the right deck */
    rightVinyl: string;
    /** Spins both records when true */
    isPlaying: boolean;
    /** Album name shown in the caption chip while playing */
    nowPlaying?: string;
    /** Trigger 3D studio inspect modal */
    onInspect3D?: () => void;
}

export function DJSceneHero({
    leftVinyl,
    rightVinyl,
    isPlaying,
    nowPlaying,
    onInspect3D,
}: DJSceneHeroProps) {
    const [use3DDecks, setUse3DDecks] = useState(true);
    const vinyls = [leftVinyl, rightVinyl];

    return (
        <section
            aria-label="Loaf Records DJ booth"
            className="relative w-full flex justify-center bg-noir-void overflow-hidden"
        >
            <div className="relative w-full max-w-[150vh]">
                <div className="relative aspect-[3/2] w-full select-none">
                    <Image
                        src="/scenes/dj-scene.jpg"
                        alt="The Loaf Records crew gathered around the DJ decks"
                        fill
                        priority
                        quality={85}
                        sizes="(max-width: 1536px) 100vw, 1536px"
                        className="object-contain"
                    />

                    {/* Records on the decks — perspective-squashed to sit flush in the platter wells */}
                    {DECKS.map((deck, i) => (
                        <div
                            key={i}
                            className="absolute z-10"
                            style={{
                                left: `${deck.cx}%`,
                                top: `${deck.cy}%`,
                                width: `${deck.w}%`,
                                transform: `translate(-50%, -50%) rotate(${deck.rotate || 0}deg) scaleY(${deck.scaleY})`,
                            }}
                        >
                            {use3DDecks ? (
                                <div className="aspect-square w-full">
                                    <VinylCanvas3D
                                        coverUrl={vinyls[i]}
                                        isPlaying={isPlaying}
                                        interactive={true}
                                        enableParallax={false}
                                        deckMode={true}
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        "vinyl-rotor aspect-square w-full",
                                        isPlaying && "vinyl-rotor-on"
                                    )}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={vinyls[i]}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="h-full w-full"
                                        >
                                            <Image
                                                src={vinyls[i]}
                                                alt=""
                                                width={320}
                                                height={320}
                                                quality={75}
                                                sizes="12vw"
                                                className="h-full w-full object-contain"
                                                draggable={false}
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Bottom fade into the page */}
                    <div
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-[18%] pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(to top, var(--color-noir-void) 0%, transparent 100%)",
                        }}
                    />

                    {/* Interactive Top-Right 3D Studio & Deck Mode Controls */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        {onInspect3D && (
                            <button
                                onClick={onInspect3D}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-accent-cyan hover:text-white border border-accent-cyan/30 backdrop-blur-md text-xs font-mono transition-all shadow-glow-sm hover:shadow-glow-md"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Inspect 3D Vinyl</span>
                            </button>
                        )}
                        <button
                            onClick={() => setUse3DDecks((v) => !v)}
                            title="Toggle between WebGL 3D and 2D decks"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-noir-cloud hover:text-white border border-white/10 backdrop-blur-md text-xs font-mono transition-colors"
                        >
                            <Disc className="w-3.5 h-3.5" />
                            <span>{use3DDecks ? "3D Decks (Active)" : "2D Decks"}</span>
                        </button>
                    </div>

                    {/* Now-playing chip */}
                    <AnimatePresence>
                        {isPlaying && nowPlaying && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-[6%] left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full border border-white/10 bg-black/75 px-4 py-2 backdrop-blur-md shadow-2xl z-20"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-60" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
                                </span>
                                <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-noir-cloud font-mono">
                                    Now spinning · {nowPlaying}
                                </span>
                                {onInspect3D && (
                                    <button
                                        onClick={onInspect3D}
                                        className="ml-2 text-[10px] text-accent-cyan hover:underline uppercase font-bold tracking-wider"
                                    >
                                        Inspect
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

