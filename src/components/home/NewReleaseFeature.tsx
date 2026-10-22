"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, Play } from "lucide-react";
import { claimAudio, onAudioClaim } from "@/lib/audio-bus";
import { playVhsClunkSfx } from "@/lib/ui-sfx";
import { splitVideoTitle, type ChannelUpload } from "@/lib/youtube-feed";

const DROP_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

/**
 * The newest upload on the Loaf Records channel, featured on the home page. It comes
 * from the channel feed, so posting a video to YouTube is all it takes to change it.
 */
export function NewReleaseFeature({ video }: { video: ChannelUpload }) {
    const [playing, setPlaying] = useState(false);
    const { headline, credits } = splitVideoTitle(video.title);
    const dropped = DROP_DATE.format(new Date(video.published));

    // Hand the room back if the mini player or the decks start up
    useEffect(() => onAudioClaim("video", () => setPlaying(false)), []);

    return (
        <section
            id="new-release"
            aria-labelledby="new-release-title"
            className="relative z-10 px-3 sm:px-4 py-4 max-w-2xl mx-auto scroll-mt-20"
        >
            <div className="rounded-[28px] border-2 border-red-500/35 bg-[#0A0B10]/95 p-4 sm:p-5 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
                <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[8px] font-bold uppercase tracking-[0.18em] min-[360px]:tracking-[0.26em] text-red-400">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" />
                        New release · {dropped}
                    </span>
                    <Link
                        href="/videos"
                        className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300"
                    >
                        <Film className="hidden min-[360px]:block w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">All videos ↗</span>
                    </Link>
                </div>
                <h2
                    id="new-release-title"
                    className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-white leading-[0.95] mt-1.5 line-clamp-2"
                >
                    {headline}
                </h2>
                <p className="mt-1 mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-noir-cloud truncate">
                    {credits ?? "Loaf Records · On YouTube"}
                </p>

                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
                    {playing ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&playsinline=1`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                playVhsClunkSfx();
                                claimAudio("video");
                                setPlaying(true);
                            }}
                            aria-label={`Play ${headline}`}
                            className="group relative block w-full h-full text-left"
                        >
                            <Image
                                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                                alt=""
                                fill
                                sizes="(max-width: 768px) 92vw, 600px"
                                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div aria-hidden className="absolute inset-0 crt-scanlines opacity-60" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                            <span
                                aria-hidden
                                className="vhs-osd absolute right-3 top-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                            >
                                New ►
                            </span>
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-16 h-16 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] group-active:scale-95 transition-transform">
                                    <Play className="w-7 h-7 fill-current ml-0.5" />
                                </span>
                            </span>
                            <span className="absolute bottom-3 left-3 rounded-lg bg-black/85 border border-red-500/50 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-red-300">
                                Fresh off the channel
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
