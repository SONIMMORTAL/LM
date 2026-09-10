"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Disc, Scissors, Sparkles, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { VinylCanvas3D } from "@/components/three/VinylCanvas3D";
import { useScratchDecks } from "@/hooks/use-scratch-decks";
import { useCallback, useState } from "react";

/*
 * The DJ-booth scene. The artwork has two blank turntable platters;
 * we composite real spinning records onto them using 3D WebGL canvases.
 *
 * Coordinates come from a pixel-level ellipse fit of the pure-black platter
 * wells in dj-scene.jpg (1536×1024), so they match the painted perspective:
 *   Left Platter:  center (481, 657) → cx 31.33%, cy 64.12%
 *                  well 166px across, squashed to 0.65, major axis tilted 15°
 *                  counter-clockwise (right edge sits higher than the left).
 *   Right Platter: center (1002, 643) → cx 65.22%, cy 62.83%
 *                  well 168px across, squashed to 0.67, tilt ~2°.
 * `w` is a touch wider than the well so the record covers the mat and meets
 * the inner edge of the strobe ring, as it would on a real deck.
 * CSS rotate() is clockwise-positive, so a counter-clockwise tilt is negative.
 */
const DECKS = [
    { cx: 31.28, cy: 64.30, w: 11.9, scaleY: 0.65, rotate: -15 }, // left turntable platter
    { cx: 65.20, cy: 62.95, w: 12.0, scaleY: 0.67, rotate: 2 },   // right turntable platter
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
    /** Stream URL cued on the left deck — grabbing the platter scratches it */
    leftSource?: string | null;
    /** Stream URL cued on the right deck */
    rightSource?: string | null;
    /** What's on the left deck, shown on its slipmat label */
    leftLabel?: string;
    /** What's on the right deck */
    rightLabel?: string;
}

export function DJSceneHero({
    leftVinyl,
    rightVinyl,
    isPlaying,
    nowPlaying,
    onInspect3D,
    leftSource = null,
    rightSource = null,
    leftLabel,
    rightLabel,
}: DJSceneHeroProps) {
    const deckLabels = [leftLabel, rightLabel];
    const [use3DDecks, setUse3DDecks] = useState(true);
    const vinyls = [leftVinyl, rightVinyl];

    const {
        platterRefs,
        status,
        isLive,
        crossfade,
        isCut,
        armDeck,
        setCrossfade,
        setCut,
        stopDecks,
    } = useScratchDecks({ sources: [leftSource, rightSource] });

    const armLeft = useCallback(() => { void armDeck(0); }, [armDeck]);
    const armRight = useCallback(() => { void armDeck(1); }, [armDeck]);

    // Once the decks are live they own the platters: they keep turning at 33 1/3
    // under the listener's hand rather than following the page player.
    const plattersSpinning = isLive ? !isCut : isPlaying;

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
                                        isPlaying={plattersSpinning}
                                        interactive={true}
                                        enableParallax={false}
                                        deckMode={true}
                                        platterRef={platterRefs[i]}
                                        onScratchStart={i === 0 ? armLeft : armRight}
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        "vinyl-rotor aspect-square w-full",
                                        plattersSpinning && "vinyl-rotor-on"
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

                    {/* What each deck is holding */}
                    {DECKS.map((deck, i) =>
                        deckLabels[i] ? (
                            <div
                                key={`label-${i}`}
                                className="absolute z-20 -translate-x-1/2 pointer-events-none"
                                style={{ left: `${deck.cx}%`, top: `${deck.cy + 7.5}%` }}
                            >
                                <span className="whitespace-nowrap rounded-full bg-black/75 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-noir-cloud backdrop-blur-sm">
                                    {i === 0 ? "A" : "B"} · {deckLabels[i]}
                                </span>
                            </div>
                        ) : null
                    )}

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

                    {/* Mixer — appears once a platter has been grabbed */}
                    <AnimatePresence>
                        {(isLive || status === "arming") && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                className="absolute bottom-[6%] left-4 sm:left-6 z-20 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/80 px-4 py-3 backdrop-blur-md shadow-2xl"
                            >
                                {status === "arming" ? (
                                    <span className="text-[10px] tracking-[0.3em] uppercase text-noir-cloud font-mono animate-pulse">
                                        Cueing record…
                                    </span>
                                ) : (
                                    <>
                                        <button
                                            onPointerDown={() => setCut(true)}
                                            onPointerUp={() => setCut(false)}
                                            onPointerLeave={() => isCut && setCut(false)}
                                            onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") setCut(true); }}
                                            onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") setCut(false); }}
                                            aria-pressed={isCut}
                                            aria-label="Cut — hold to kill the sound"
                                            title="Hold to cut"
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors",
                                                isCut
                                                    ? "bg-accent-cyan text-black border-accent-cyan"
                                                    : "bg-white/5 text-noir-cloud border-white/15 hover:text-white hover:bg-white/10"
                                            )}
                                        >
                                            <Scissors className="w-3.5 h-3.5" />
                                            <span>Cut</span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <span aria-hidden className="text-[10px] font-mono text-noir-ash">A</span>
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                value={crossfade}
                                                onChange={(e) => setCrossfade(parseFloat(e.target.value))}
                                                aria-label="Crossfader — blend between the left and right deck"
                                                className="w-24 sm:w-32 accent-accent-cyan cursor-ew-resize"
                                            />
                                            <span aria-hidden className="text-[10px] font-mono text-noir-ash">B</span>
                                        </div>

                                        <button
                                            onClick={stopDecks}
                                            aria-label="Stop the decks"
                                            title="Stop the decks"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-noir-cloud hover:text-white border border-white/15 text-xs font-mono transition-colors"
                                        >
                                            <Square className="w-3 h-3" />
                                            <span>Stop</span>
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Invitation / failure notice */}
                    {!isLive && status !== "arming" && (leftSource || rightSource) && (
                        <div className="absolute bottom-[6%] left-4 sm:left-6 z-20 pointer-events-none">
                            <span className="text-[10px] tracking-[0.25em] uppercase text-noir-ash font-mono">
                                {status === "unsupported"
                                    ? "Scratching needs a newer browser"
                                    : status === "error"
                                        ? "Deck unavailable"
                                        : "Drag a record to scratch"}
                            </span>
                        </div>
                    )}

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

