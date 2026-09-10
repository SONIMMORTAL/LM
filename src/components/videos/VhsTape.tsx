"use client";

import { memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface VhsTapeVideo {
    id?: string;
    title: string;
    description?: string;
    youtube_id?: string;
    youtubeId?: string;
}

interface VhsTapeProps {
    video: VhsTapeVideo;
    /** Tape number written on the spine label. */
    index: number;
    onPlay: (youtubeId: string, title?: string) => void;
    className?: string;
}

/**
 * A video as a VHS cassette.
 *
 * The page already puts the viewer in front of a TV, so the catalogue reads
 * better as a shelf of tapes you pick one off than as a grid of thumbnails.
 * The still shows through the cassette's front window; the handwritten strip
 * across the top is the label someone wrote by hand.
 *
 * Everything here is CSS — no tape artwork to download.
 */
export const VhsTape = memo(function VhsTape({
    video,
    index,
    onPlay,
    className,
}: VhsTapeProps) {
    const youtubeId = video.youtube_id || video.youtubeId;
    if (!youtubeId) return null;

    // Give each tape its own slight lean so a shelf of them isn't mechanical.
    const lean = ((index * 37) % 5) - 2;

    return (
        <button
            type="button"
            onClick={() => onPlay(youtubeId, video.title)}
            aria-label={`Play ${video.title}`}
            style={{ ["--lean" as string]: `${lean * 0.35}deg` }}
            className={cn(
                "group relative block w-full text-left",
                "transition-transform duration-300 ease-out",
                "hover:-translate-y-3 focus-visible:-translate-y-3 focus-visible:outline-none",
                className
            )}
        >
            <div
                className={cn(
                    "relative aspect-[16/10] overflow-hidden rounded-[3px]",
                    // the moulded plastic body
                    "bg-gradient-to-b from-[#1c1c1f] via-[#111113] to-[#0a0a0b]",
                    "shadow-[0_18px_30px_-12px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]",
                    "ring-1 ring-black/80",
                    "transition-shadow duration-300",
                    "group-hover:shadow-[0_28px_46px_-14px_rgba(0,0,0,1),inset_0_1px_0_rgba(255,255,255,0.12)]",
                    "group-focus-visible:ring-2 group-focus-visible:ring-accent-cyan"
                )}
                style={{ transform: "rotate(var(--lean))" }}
            >
                {/* ── the written-on label across the top ─────────────── */}
                <div className="absolute inset-x-[6%] top-[6%] z-20 rounded-[2px] bg-[#e8e4d9] px-2 py-1 shadow-md">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-[8px] font-bold uppercase tracking-tight text-[#b9342f]">
                            LR-{String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-tight text-[#1a1a1a]">
                            {video.title}
                        </span>
                    </div>
                </div>

                {/* ── the front window, with the still behind it ──────── */}
                <div className="absolute inset-x-[10%] bottom-[20%] top-[30%] overflow-hidden rounded-[2px] ring-1 ring-black/70">
                    <Image
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                        className="object-cover opacity-70 saturate-[0.85] transition-all duration-500 group-hover:opacity-100 group-hover:saturate-100"
                        loading="lazy"
                    />
                    {/* smoked window plastic */}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/45"
                    />
                    {/* the two reel hubs sitting behind the window */}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute left-[14%] top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border-[3px] border-black/60 bg-[#0d0d0f]/70 shadow-[inset_0_0_0_5px_rgba(255,255,255,0.06)]"
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute right-[14%] top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border-[3px] border-black/60 bg-[#0d0d0f]/70 shadow-[inset_0_0_0_5px_rgba(255,255,255,0.06)]"
                    />
                </div>

                {/* ── moulded details along the bottom ────────────────── */}
                <div className="absolute inset-x-[10%] bottom-[6%] flex items-center justify-between">
                    <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-white/35">
                        Loaf Records
                    </span>
                    <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-white/25">
                        SP · 120
                    </span>
                </div>

                {/* the sheen across the plastic as it tips toward you */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
            </div>

            {/* what the tape is, for anyone who wants it spelled out */}
            <p className="mt-3 truncate text-sm font-bold tracking-tight text-white transition-colors group-hover:text-accent-cyan">
                {video.title}
            </p>
            {video.description && (
                <p className="truncate text-xs text-noir-cloud opacity-60">
                    {video.description}
                </p>
            )}
        </button>
    );
});
