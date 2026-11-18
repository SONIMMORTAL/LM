"use client";

import Image, { getImageProps } from "next/image";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Disc, Scissors, Sparkles, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScratchDecks } from "@/hooks/use-scratch-decks";
import { playNeedleDropSfx } from "@/lib/ui-sfx";
import { useCallback, useState, useSyncExternalStore } from "react";

const VinylCanvas3D = dynamic(
    () => import("@/components/three/VinylCanvas3D").then((m) => m.VinylCanvas3D),
    { ssr: false }
);

/*
 * The DJ-booth scene (`public/brand/music-decks-hero-4k.webp`: a 3840×2254 4x upscale of the
 * 1024×601 original, so the percentages below hold at any size). The
 * artwork frames twin turntables behind the mixer; we composite live spinning
 * records onto both platters so grabbing either vinyl scratches it.
 *
 * Each record is centred on its platter's spindle: the centre of the painted LOAF label,
 * measured in the art's pixels:
 *   Left Platter:  label centre (334.6, 440.4) → cx 32.67%, cy 73.29%, w 13.09%, scaleY 0.642
 *   Right Platter: label centre (685.7, 439.2) → cx 66.97%, cy 73.08%, w 13.09%, scaleY 0.642
 */
const DECKS = [
    { cx: 32.67, cy: 73.29, w: 13.09, scaleY: 0.642, rotate: -1 }, // left turntable platter
    { cx: 66.97, cy: 73.08, w: 13.09, scaleY: 0.642, rotate: 1 },  // right turntable platter
] as const;

/*
 * The booth only shows from md up. Phones never see it, so they skip its art (a blank
 * pixel stands in) and never build its WebGL decks.
 */
const NARROW = "(max-width: 767px)";
const WIDE = "(min-width: 768px)";
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const boothArt = getImageProps({
    src: "/brand/music-decks-hero-4k.webp",
    alt: "The Loaf Records crew gathered around the twin vinyl turntables in The Dungeon",
    fill: true,
    quality: 90,
    sizes: "(max-width: 1536px) 100vw, 1536px",
    loading: "eager",
    fetchPriority: "high",
}).props;

const subscribeWide = (onChange: () => void) => {
    const query = window.matchMedia(WIDE);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
};

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
    const isWide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
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

    const armLeft = useCallback(() => {
        playNeedleDropSfx();
        void armDeck(0);
    }, [armDeck]);
    const armRight = useCallback(() => {
        playNeedleDropSfx();
        void armDeck(1);
    }, [armDeck]);

    // Once the decks are live they own the platters: they keep turning at 33 1/3
    // under the listener's hand rather than following the page player.
    const plattersSpinning = isLive ? !isCut : isPlaying;

    return (
        <section
            aria-label="Loaf Records DJ booth"
            className="relative w-full flex justify-center px-4 sm:px-6 overflow-hidden"
        >
            <div className="relative w-full max-w-[1440px] overflow-hidden rounded-3xl border-2 border-[#141714] bg-[#0B0B0F] shadow-[0_24px_60px_rgba(20,23,20,0.14)]">
                <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                <div className="relative aspect-[1024/601] w-full select-none">
                    {/* Phones take the blank pixel, so the hidden booth costs them nothing */}
                    <picture>
                        <source media={NARROW} srcSet={BLANK} />
                        {/* eslint-disable-next-line jsx-a11y/alt-text -- the alt comes in with boothArt */}
                        <img {...boothArt} className="object-cover" />
                    </picture>

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
                            {!isWide ? null : use3DDecks ? (
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
                                style={{ left: `${deck.cx}%`, top: `${deck.cy - 9.5}%` }}
                            >
                                <span className="whitespace-nowrap rounded-full border border-white/15 bg-black/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-100 backdrop-blur-sm">
                                    {i === 0 ? "A" : "B"} · {deckLabels[i]}
                                </span>
                            </div>
                        ) : null
                    )}

                    {/* Bottom frame fade */}
                    <div
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-[14%] pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(to top, rgba(11, 11, 15, 0.72) 0%, transparent 100%)",
                        }}
                    />

                    {/* Interactive Top-Right 3D Studio & Deck Mode Controls */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        {onInspect3D && (
                            <button
                                onClick={onInspect3D}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-[#A3C49A] hover:text-white border border-[#A3C49A]/40 backdrop-blur-md text-xs font-mono transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Inspect 3D Vinyl</span>
                            </button>
                        )}
                        <button
                            onClick={() => setUse3DDecks((v) => !v)}
                            title="Toggle between WebGL 3D and 2D decks"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-zinc-200 hover:text-white border border-white/15 backdrop-blur-md text-xs font-mono transition-colors"
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
                                className="absolute bottom-[6%] left-4 sm:left-6 z-20 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/85 px-4 py-3 backdrop-blur-md shadow-2xl"
                            >
                                {status === "arming" ? (
                                    <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-200 font-mono animate-pulse">
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
                                                    ? "bg-white text-black border-white"
                                                    : "bg-white/10 text-zinc-200 border-white/20 hover:text-white hover:bg-white/20"
                                            )}
                                        >
                                            <Scissors className="w-3.5 h-3.5" />
                                            <span>Cut</span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <span aria-hidden className="text-[10px] font-mono text-zinc-300">A</span>
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                value={crossfade}
                                                onChange={(e) => setCrossfade(parseFloat(e.target.value))}
                                                aria-label="Crossfader — blend between the left and right deck"
                                                className="w-24 sm:w-32 accent-[#9EC294] cursor-ew-resize"
                                            />
                                            <span aria-hidden className="text-[10px] font-mono text-zinc-300">B</span>
                                        </div>

                                        <button
                                            onClick={stopDecks}
                                            aria-label="Stop the decks"
                                            title="Stop the decks"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white border border-white/20 text-xs font-mono transition-colors"
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
                            <span className="rounded-full bg-black/75 px-3 py-1 text-[10px] tracking-[0.25em] uppercase text-zinc-200 font-mono backdrop-blur-sm">
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
                                className="absolute bottom-[6%] left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full border border-white/15 bg-black/80 px-4 py-2 backdrop-blur-md shadow-2xl z-20"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9EC294] opacity-60" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9EC294]" />
                                </span>
                                <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-zinc-100 font-mono">
                                    Now spinning · {nowPlaying}
                                </span>
                                {onInspect3D && (
                                    <button
                                        onClick={onInspect3D}
                                        className="ml-2 text-[10px] text-[#9EC294] hover:underline uppercase font-bold tracking-wider"
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

