"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Disc3, Pause, Play, Search, ShoppingBag, Youtube } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Track } from "@/lib/tracks-server";

export interface CrateAlbum {
    name: string;
    artist: string;
    cover: string;
    tracks: Track[];
    youtubeId?: string;
    /** 0 means the record is streaming-free; anything else is for sale. */
    price?: number;
}

interface RecordCrateProps {
    albums: CrateAlbum[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    onPlayTrack: (track: Track) => void;
    onLoadToDeck: (albumIndex: number, deck: 0 | 1) => void;
    onBuy: (album: CrateAlbum) => void;
    onInspect: (album: CrateAlbum) => void;
    /** Title of the track the page player currently holds. */
    currentTrackTitle?: string;
    isPlaying: boolean;
}

/** How far apart the sleeves sit, and how hard the fan curves away. */
const SLEEVE_STEP = 132;
const SLEEVE_STEP_FAR = 46;
const MAX_TILT = 34;

/**
 * The catalogue as a crate you dig through, rather than seven identical blocks
 * stacked down twelve screens of scroll. The sleeve you're on pulls upright and
 * forward; the rest fan back at an angle the way records do when you push them
 * over to look at one.
 */
export function RecordCrate({
    albums,
    selectedIndex,
    onSelect,
    onPlayTrack,
    onLoadToDeck,
    onBuy,
    onInspect,
    currentTrackTitle,
    isPlaying,
}: RecordCrateProps) {
    const listId = useId();
    const crateRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ startX: number; startIndex: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const album = albums[selectedIndex];

    const move = useCallback(
        (delta: number) => {
            const next = Math.min(albums.length - 1, Math.max(0, selectedIndex + delta));
            if (next !== selectedIndex) onSelect(next);
        },
        [albums.length, selectedIndex, onSelect]
    );

    // ── Keyboard: dig with the arrows, Enter drops it on deck A ──────
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowRight":
                e.preventDefault();
                move(1);
                break;
            case "ArrowLeft":
                e.preventDefault();
                move(-1);
                break;
            case "Home":
                e.preventDefault();
                onSelect(0);
                break;
            case "End":
                e.preventDefault();
                onSelect(albums.length - 1);
                break;
            case "Enter":
                e.preventDefault();
                onLoadToDeck(selectedIndex, 0);
                break;
        }
    };

    // ── Drag sideways to flip through, like pushing records over ─────
    useEffect(() => {
        if (!isDragging) return;

        const onMove = (e: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag) return;
            const steps = Math.round((drag.startX - e.clientX) / 90);
            const target = Math.min(albums.length - 1, Math.max(0, drag.startIndex + steps));
            if (target !== selectedIndex) onSelect(target);
        };
        const onUp = () => {
            dragRef.current = null;
            setIsDragging(false);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isDragging, albums.length, selectedIndex, onSelect]);

    if (!album) return null;

    const isFree = !album.price;
    // A release whose rows have no audio_url can't be played from here.
    // Offering a play button for it would be offering a button that does
    // nothing. (Video-only tapes are kept out of the crate altogether — see
    // lib/video-tapes.ts.)
    const hasAudio = album.tracks.some((track) => !!track.audio_url);

    return (
        <div className="w-full">
            {/* ── THE CRATE ─────────────────────────────────────────── */}
            <div
                ref={crateRef}
                role="listbox"
                aria-label="Record crate — use the left and right arrow keys to dig through the catalogue"
                aria-activedescendant={`${listId}-${selectedIndex}`}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onMouseDown={(e) => {
                    dragRef.current = { startX: e.clientX, startIndex: selectedIndex };
                    setIsDragging(true);
                }}
                className={cn(
                    "relative h-[340px] sm:h-[400px] w-full select-none overflow-hidden",
                    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan rounded-2xl",
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                    perspective: "1600px",
                    // Fade the records that run off the sides rather than
                    // letting them get chopped at a hard edge.
                    maskImage:
                        "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                    WebkitMaskImage:
                        "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                }}
            >
                {/* the crate lip the records sit behind */}
                <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-6 h-24 rounded-[50%] bg-black/60 blur-2xl"
                />

                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        // At either end of the crate every record sits on one
                        // side, which reads as a mistake rather than as being
                        // at the front of the box. Lean the whole fan back
                        // toward the middle to even out the weight.
                        transform: `translateX(${(selectedIndex - (albums.length - 1) / 2) * SLEEVE_STEP_FAR * 0.55}px)`,
                        transition: "transform 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                >
                    {albums.map((entry, i) => {
                        const offset = i - selectedIndex;
                        const distance = Math.abs(offset);
                        const isCurrent = offset === 0;

                        // Near sleeves spread out; distant ones compress into the stack.
                        const x =
                            Math.sign(offset) *
                            (Math.min(distance, 1) * SLEEVE_STEP +
                                Math.max(0, distance - 1) * SLEEVE_STEP_FAR);

                        return (
                            <button
                                key={entry.name}
                                id={`${listId}-${i}`}
                                role="option"
                                aria-selected={isCurrent}
                                tabIndex={-1}
                                onClick={() => (isCurrent ? onInspect(entry) : onSelect(i))}
                                style={{
                                    transform: `translateX(${x}px) translateZ(${isCurrent ? 90 : -distance * 60}px) rotateY(${Math.sign(-offset) * Math.min(distance, 3) * (MAX_TILT / 3)}deg) scale(${isCurrent ? 1 : 0.82})`,
                                    zIndex: albums.length - distance,
                                    filter: isCurrent
                                        ? "none"
                                        : `brightness(${Math.max(0.28, 0.62 - distance * 0.12)})`,
                                    transitionProperty: "transform, filter",
                                    transitionDuration: "480ms",
                                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                                }}
                                className={cn(
                                    "absolute h-[210px] w-[210px] sm:h-[260px] sm:w-[260px] overflow-hidden rounded-sm",
                                    "shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] ring-1",
                                    isCurrent ? "ring-white/25" : "ring-black/60",
                                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan"
                                )}
                            >
                                <Image
                                    src={entry.cover}
                                    alt={isCurrent ? "" : `${entry.name} by ${entry.artist}`}
                                    fill
                                    sizes="260px"
                                    quality={80}
                                    className="object-cover"
                                    draggable={false}
                                />
                                {/* the sheen a sleeve catches under a light */}
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10"
                                />
                                {isCurrent && (
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 flex items-end justify-end p-2 opacity-0 transition-opacity hover:opacity-100"
                                    >
                                        <span className="flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-accent-cyan">
                                            <Search className="h-3 w-3" /> Inspect
                                        </span>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* position in the crate */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5">
                    {albums.map((entry, i) => (
                        <span
                            key={entry.name}
                            aria-hidden
                            className={cn(
                                "h-[3px] rounded-full transition-all duration-300",
                                i === selectedIndex ? "w-6 bg-accent-cyan" : "w-2 bg-white/20"
                            )}
                        />
                    ))}
                </div>
            </div>

            <p className="mt-3 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-noir-ash">
                {/* Don't tell a phone to press the arrow keys. */}
                <span className="hidden sm:inline">Drag or press ← → to dig · ↵ loads deck A</span>
                <span className="sm:hidden">Swipe to dig through the crate</span>
            </p>

            {/* ── THE RECORD YOU'RE HOLDING ─────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={album.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="mx-auto mt-10 grid max-w-5xl gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
                >
                    {/* left: identity + actions */}
                    <div>
                        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-accent-cyan">
                            {isFree ? (
                                <>
                                    <Youtube className="h-3.5 w-3.5" />
                                    <span>Stream free</span>
                                </>
                            ) : (
                                <>
                                    <Disc3 className="h-3.5 w-3.5" />
                                    <span>Digital album · ${album.price?.toFixed(2)}</span>
                                </>
                            )}
                        </div>

                        <h2 className="mt-2 text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
                            {album.name}
                        </h2>
                        <p className="mt-1 text-noir-cloud">{album.artist}</p>
                        <p className="mt-1 font-mono text-xs text-noir-ash">
                            {album.tracks.length} {album.tracks.length === 1 ? "track" : "tracks"}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {hasAudio ? (
                                <button
                                    onClick={() =>
                                        onPlayTrack(
                                            album.tracks.find((t) => t.audio_url) ?? album.tracks[0]
                                        )
                                    }
                                    className="flex items-center gap-2 rounded-full bg-accent-cyan px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-noir-void transition-colors hover:bg-white"
                                >
                                    <Play className="h-4 w-4" />
                                    Play album
                                </button>
                            ) : (
                                <Link
                                    href={
                                        album.youtubeId
                                            ? `/videos?v=${album.youtubeId}`
                                            : "/videos"
                                    }
                                    className="flex items-center gap-2 rounded-full bg-accent-cyan px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-noir-void transition-colors hover:bg-white"
                                >
                                    <Play className="h-4 w-4" />
                                    Watch on the big screen
                                </Link>
                            )}

                            {!isFree && (
                                <button
                                    onClick={() => onBuy(album)}
                                    className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Buy ${album.price?.toFixed(2)}
                                </button>
                            )}
                        </div>

                        {hasAudio && (
                            <div className="mt-6">
                                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-noir-ash">
                                    Drop it on a deck
                                </p>
                                <div className="mt-2 flex gap-2">
                                    {([0, 1] as const).map((deck) => (
                                        <button
                                            key={deck}
                                            onClick={() => onLoadToDeck(selectedIndex, deck)}
                                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-noir-cloud transition-colors hover:border-accent-cyan/40 hover:text-white"
                                        >
                                            <Disc3 className="h-3.5 w-3.5" />
                                            Deck {deck === 0 ? "A" : "B"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* right: the tracklist, always open — no more hunting for a dropdown */}
                    <div>
                        {album.tracks.length > 0 ? (
                            <>
                            {!hasAudio && (
                                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-noir-ash">
                                    Video release · tracklisting
                                </p>
                            )}
                            <ol className="divide-y divide-white/5 border-y border-white/5">
                                {album.tracks.map((track, i) => {
                                    const isCurrent = currentTrackTitle === track.title;
                                    const number = String(i + 1).padStart(2, "0");

                                    // No audio behind this row — show it as the
                                    // tracklisting it is, not a dead button.
                                    if (!track.audio_url) {
                                        return (
                                            <li
                                                key={track.id}
                                                className="flex items-center gap-3 px-2 py-2.5 text-noir-ash"
                                            >
                                                <span className="w-6 shrink-0 text-right font-mono text-[11px]">
                                                    {number}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate text-sm">
                                                    {track.title}
                                                </span>
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={track.id}>
                                            <button
                                                onClick={() => onPlayTrack(track)}
                                                className={cn(
                                                    "group flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors",
                                                    isCurrent
                                                        ? "text-accent-cyan"
                                                        : "text-noir-cloud hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <span className="w-6 shrink-0 text-right font-mono text-[11px] text-noir-ash">
                                                    {isCurrent && isPlaying ? (
                                                        <Pause className="ml-auto h-3 w-3" />
                                                    ) : (
                                                        number
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate text-sm">
                                                    {track.title}
                                                </span>
                                                <Play className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                            </>
                        ) : (
                            <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
                                <Disc3 className="mb-3 h-8 w-8 text-noir-smoke" />
                                <p className="text-sm text-noir-ash">
                                    Watch this one on the video page
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
