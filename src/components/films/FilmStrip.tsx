"use client";

import { VideoFacade } from "@/components/ui/VideoFacade";

export interface FilmStripEntry {
    youtubeId: string;
    title: string;
    credit?: string;
}

interface FilmStripProps {
    entries: FilmStripEntry[];
}

/**
 * The reel the work came off.
 *
 * The music page hands you records and the videos page hands you tapes; the
 * film arm gets the thing its own work lives on — a length of 35mm with the
 * frames still in it. Sprockets are a repeating gradient rather than a row of
 * elements, so a long strip costs nothing to paint.
 */
const SPROCKETS =
    "repeating-linear-gradient(to right, transparent 0 14px, rgba(0,0,0,0.85) 14px 26px)";

export function FilmStrip({ entries }: FilmStripProps) {
    if (entries.length === 0) return null;

    return (
        <div className="relative -mx-6 overflow-x-auto px-6 pb-2">
            <div className="relative min-w-max bg-[#0b0b0c] py-7 shadow-[0_20px_40px_-20px_rgba(0,0,0,1)] ring-1 ring-black">
                {/* sprocket runs, top and bottom */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-[#141416]"
                    style={{
                        WebkitMaskImage: SPROCKETS,
                        maskImage: SPROCKETS,
                    }}
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-[#141416]"
                    style={{
                        WebkitMaskImage: SPROCKETS,
                        maskImage: SPROCKETS,
                    }}
                />

                {/* the frames */}
                <div className="flex items-stretch gap-1 px-4">
                    {entries.map((entry, i) => (
                        <figure
                            key={entry.youtubeId}
                            className="group relative w-[300px] shrink-0 sm:w-[380px] lg:w-[440px]"
                        >
                            {/* frame line between exposures */}
                            {i > 0 && (
                                <span
                                    aria-hidden
                                    className="absolute -left-[3px] inset-y-0 w-px bg-black"
                                />
                            )}

                            <div className="relative overflow-hidden ring-1 ring-black/80">
                                <VideoFacade
                                    youtubeId={entry.youtubeId}
                                    title={entry.title}
                                    aspectRatio="aspect-video"
                                />
                            </div>

                            <figcaption className="px-1 pt-2">
                                <p className="truncate text-xs font-bold uppercase tracking-tight text-white">
                                    {entry.title}
                                </p>
                                {entry.credit && (
                                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-noir-ash">
                                        {entry.credit}
                                    </p>
                                )}
                            </figcaption>

                            {/* edge marking, the way stock is printed along the rebate */}
                            <span
                                aria-hidden
                                className="pointer-events-none absolute -top-[22px] left-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/25"
                            >
                                LF-{String(i + 1).padStart(3, "0")}A
                            </span>
                        </figure>
                    ))}
                </div>
            </div>
        </div>
    );
}
