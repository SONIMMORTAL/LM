"use client";

import Image from "next/image";
import { ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoTape } from "@/lib/video-tapes";

export interface FullTape extends VideoTape {
    /** Track titles in running order. */
    tracks: string[];
}

interface FullTapeShelfProps {
    tapes: FullTape[];
    /** YouTube id of whatever is on the theater screen right now. */
    nowShowingId?: string;
    onPlay: (youtubeId: string, title?: string) => void;
}

/** The title the theater uses — the caption shows everything before the "|". */
export function fullTapeTitle(tape: VideoTape): string {
    return `${tape.artist} - ${tape.name} | Full tape`;
}

function trackCount(tape: FullTape): string {
    return `${tape.tracks.length} ${tape.tracks.length === 1 ? "track" : "tracks"}`;
}

/**
 * The releases that only exist as full-length uploads, shelved above the music
 * videos with their own sleeves. The sleeve puts the whole tape on the big
 * screen.
 *
 * On a desktop there's room for big sleeves with the tracklist folding out
 * underneath. On a phone that stacked three screens of scroll on top of the
 * music videos, so there the sleeves sit three across in a single row and the
 * tracklist moves under the player, for whichever tape is on screen.
 */
export function FullTapeShelf({ tapes, nowShowingId, onPlay }: FullTapeShelfProps) {
    if (tapes.length === 0) return null;

    return (
        <section aria-labelledby="full-tapes-heading" className="relative px-6 pt-10 pb-2 md:pt-16 md:pb-8 z-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-5 md:mb-12 border-b border-white/10 pb-4 md:pb-6">
                    <div>
                        <p aria-hidden className="text-5xl md:text-8xl font-bold tracking-tighter opacity-10 uppercase select-none">
                            Full Tapes
                        </p>
                        <h2
                            id="full-tapes-heading"
                            className="text-lg sm:text-2xl font-bold text-accent-cyan -mt-6 md:-mt-8 uppercase tracking-widest pl-2"
                        >
                            Watch the whole tape
                        </h2>
                    </div>
                    <p className="hidden sm:block max-w-xs text-right text-sm text-noir-cloud">
                        Front to back, on the big screen.
                    </p>
                </div>

                <ul className="grid grid-cols-3 items-start gap-3 sm:gap-5 md:gap-x-8 md:gap-y-12">
                    {tapes.map((tape) => {
                        const isOnScreen = nowShowingId === tape.youtubeId;
                        const hasTracks = tape.tracks.length > 0;

                        return (
                            <li key={tape.slug} className="min-w-0">
                                <button
                                    type="button"
                                    onClick={() => onPlay(tape.youtubeId, fullTapeTitle(tape))}
                                    aria-label={`Watch ${tape.name} by ${tape.artist} on the big screen`}
                                    className={cn(
                                        "group relative block aspect-square w-full overflow-hidden rounded-sm",
                                        "shadow-[0_18px_40px_-15px_rgba(0,0,0,0.9)] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] ring-1 transition-shadow",
                                        isOnScreen ? "ring-2 ring-accent-cyan" : "ring-white/10 hover:ring-white/25",
                                        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
                                    )}
                                >
                                    <Image
                                        src={tape.cover}
                                        alt=""
                                        fill
                                        sizes="(max-width: 1280px) 33vw, 400px"
                                        quality={80}
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                    {/* the sheen a sleeve catches under a light */}
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10"
                                    />

                                    {/* Tucked in the corner on a phone so it doesn't sit
                                        on the middle of a thumbnail-sized sleeve. */}
                                    <span className="absolute bottom-1.5 right-1.5 md:inset-0 md:flex md:items-center md:justify-center">
                                        <span className="flex h-7 w-7 md:h-16 md:w-16 items-center justify-center rounded-full border border-white/25 bg-black/60 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-accent-cyan group-hover:bg-accent-cyan">
                                            <Play className="h-3 w-3 md:h-7 md:w-7 translate-x-px md:translate-x-0.5 text-white group-hover:text-black" fill="currentColor" />
                                        </span>
                                    </span>

                                    <span className="absolute left-3 top-3 hidden md:block rounded-full bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan">
                                        {isOnScreen ? "Now showing" : "Full tape"}
                                    </span>
                                </button>

                                <div className="mt-2 md:mt-4 lg:flex lg:items-baseline lg:justify-between lg:gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm sm:text-lg md:text-2xl lg:text-3xl font-black uppercase tracking-tighter text-white">
                                            {tape.name}
                                        </h3>
                                        <p className="hidden md:block text-sm text-noir-cloud">{tape.artist}</p>
                                    </div>
                                    {hasTracks && (
                                        <p className="truncate font-mono text-[10px] md:text-xs lg:shrink-0">
                                            {/* On a phone the sleeve has no room for a badge, so
                                                this line says which tape is on the screen. */}
                                            <span className={cn("md:hidden", isOnScreen ? "text-accent-cyan" : "text-noir-ash")}>
                                                {isOnScreen ? "Now showing" : trackCount(tape)}
                                            </span>
                                            <span className="hidden md:inline text-noir-ash">{trackCount(tape)}</span>
                                        </p>
                                    )}
                                </div>

                                <TapeTracklist tape={tape} className="mt-3 hidden md:block" />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

interface TapeTracklistProps {
    tape: FullTape;
    /** What the fold-out says when it's closed. */
    label?: string;
    className?: string;
}

/** A tape's tracklist, folded shut until someone asks for it. */
export function TapeTracklist({ tape, label = "Tracklist", className }: TapeTracklistProps) {
    if (tape.tracks.length === 0) return null;

    return (
        <details className={cn("group/list border-t border-white/10", className)}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-noir-ash transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                <span className="truncate">{label}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open/list:rotate-180" />
            </summary>
            <ol className="divide-y divide-white/5 border-t border-white/5">
                {tape.tracks.map((title, i) => (
                    <li
                        // Titles can repeat on a tape; the position can't.
                        key={i}
                        className="flex items-center gap-3 px-1 py-2 text-noir-cloud"
                    >
                        <span className="w-6 shrink-0 text-right font-mono text-[11px] text-noir-ash">
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
                    </li>
                ))}
            </ol>
        </details>
    );
}
