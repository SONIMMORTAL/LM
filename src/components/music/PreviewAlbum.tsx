"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronLeft, Pause, Play } from "lucide-react";
import { claimAudio, getMasterVolume, onAudioClaim } from "@/lib/audio-bus";
import type { AlbumRelease } from "@/lib/discography";
import type { TrackCredits } from "@/lib/credits";
import { RELEASES, formatPrice, type ReleaseProduct } from "@/lib/releases";
import { ReleasePurchaseModal } from "@/components/music/ReleasePurchaseModal";
import { cn } from "@/lib/utils";

const PREVIEW_SECONDS = 20;

interface PreviewAlbumProps {
    album: AlbumRelease & { sale: NonNullable<AlbumRelease["sale"]> };
    songs: TrackCredits[];
    artistHref?: string;
}

/**
 * An album sold through the site: 20 seconds of every track to hear, then name your price for
 * the whole thing. One preview plays at a time, and it gives way to the mini player, the decks
 * or a video the moment one of them starts (and they to it).
 */
export function PreviewAlbum({ album, songs, artistHref }: PreviewAlbumProps) {
    const release = RELEASES[album.sale.release];
    const audiobook = RELEASES["god-is-good-audiobook"];
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [heard, setHeard] = useState(false);
    const [buying, setBuying] = useState<ReleaseProduct | null>(null);

    // One audio element for every preview, made on first use
    const audio = () => {
        if (!audioRef.current) {
            const el = new Audio();
            el.preload = "none";
            el.addEventListener("timeupdate", () => setProgress(Math.min(1, el.currentTime / PREVIEW_SECONDS)));
            el.addEventListener("ended", () => {
                setPlaying(null);
                setProgress(0);
                setHeard(true);
            });
            audioRef.current = el;
        }
        return audioRef.current;
    };

    useEffect(
        () =>
            onAudioClaim("preview", () => {
                audioRef.current?.pause();
                setPlaying(null);
            }),
        []
    );
    useEffect(() => () => audioRef.current?.pause(), []);

    const toggle = (index: number) => {
        const el = audio();
        if (playing === index) {
            el.pause();
            setPlaying(null);
            return;
        }
        claimAudio("preview");
        el.src = album.sale.previews[index];
        el.volume = getMasterVolume();
        setProgress(0);
        setPlaying(index);
        void el.play().catch(() => setPlaying(null));
    };

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Link href="/music" className="mb-6 inline-flex items-center gap-2 text-sm text-[#61675E] hover:text-[#141714]">
                <ChevronLeft className="h-4 w-4" />
                Back to Music
            </Link>

            <div className="overflow-hidden rounded-3xl border-2 border-[#141714] bg-white shadow-[0_24px_60px_rgba(20,23,20,0.12)]">
                <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                <div className="grid lg:grid-cols-12">
                    {/* The record */}
                    <div className="space-y-6 p-5 sm:p-8 lg:col-span-5">
                        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border-2 border-[#141714]/15 shadow-xl">
                            <Image
                                src={album.cover}
                                alt={`${album.name} by ${album.artist}: Shadow and Ruggz in varsity jackets looking out at the Brooklyn Bridge`}
                                fill
                                priority
                                sizes="(max-width: 1024px) 90vw, 384px"
                                className="object-cover"
                            />
                        </div>

                        <div className="space-y-2 text-center lg:text-left">
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#9B2C1F]">New album</p>
                            <h1 className="font-display text-5xl uppercase leading-[0.9] tracking-wide text-[#141714] sm:text-6xl">{album.name}</h1>
                            <p className="text-lg font-semibold text-[#365332]">
                                {artistHref ? (
                                    <Link href={artistHref} className="underline-offset-4 hover:underline">
                                        {album.artist}
                                    </Link>
                                ) : (
                                    album.artist
                                )}
                                {album.producer && <span className="font-normal text-[#61675E]"> · Produced by {album.producer}</span>}
                            </p>
                            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#61675E]">{songs.length} tracks</p>
                        </div>

                        {album.about?.map((line) => (
                            <p key={line} className="text-[15px] leading-relaxed text-[#3E443B]">
                                {line}
                            </p>
                        ))}

                        <button
                            type="button"
                            onClick={() => setBuying(release)}
                            className={cn(
                                "w-full rounded-2xl bg-[#141714] px-5 py-4 text-left text-white shadow-lg transition-transform active:scale-[0.99]",
                                heard && "ring-4 ring-[#F2B705]/70"
                            )}
                        >
                            <span className="block font-display text-2xl uppercase leading-none tracking-wide">Get the album</span>
                            <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-white/75">
                                Name your price · from {formatPrice(release.minPrice)}
                            </span>
                        </button>

                        <Link
                            href={audiobook.path}
                            className="flex items-center gap-3 rounded-2xl border-2 border-[#141714]/15 bg-[#FAF9F6] p-3 hover:border-[#365332]"
                        >
                            <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md">
                                <Image src={audiobook.cover} alt="" fill sizes="44px" className="object-cover" />
                            </div>
                            <span className="min-w-0">
                                <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#61675E]">
                                    <BookOpen className="h-3.5 w-3.5" /> Also out
                                </span>
                                <span className="block font-display text-xl uppercase leading-tight">{audiobook.name}</span>
                                <span className="block text-sm text-[#3E443B]">12 chapters · {formatPrice(audiobook.minPrice)}</span>
                            </span>
                        </Link>
                    </div>

                    {/* The tracklist, every song 20 seconds deep */}
                    <div className="border-t-2 border-[#141714]/10 p-5 sm:p-8 lg:col-span-7 lg:border-l-2 lg:border-t-0">
                        <div className="mb-4 flex items-baseline justify-between gap-3">
                            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#61675E]">Tracklist</h2>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#61675E]">Tap a song · {PREVIEW_SECONDS}-sec preview</p>
                        </div>
                        <ol className="space-y-1">
                            {songs.map((song, index) => {
                                const isPlaying = playing === index;
                                return (
                                    <li key={`${index}-${song.title}`}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(index)}
                                            aria-pressed={isPlaying}
                                            aria-label={`${isPlaying ? "Stop" : "Play"} the ${PREVIEW_SECONDS}-second preview of ${song.title}`}
                                            className={cn(
                                                "group relative flex w-full items-center gap-3.5 overflow-hidden rounded-xl px-3 py-3 text-left transition-colors",
                                                isPlaying ? "bg-[#141714] text-white" : "hover:bg-[#F2F1EC]"
                                            )}
                                        >
                                            {isPlaying && (
                                                <span
                                                    aria-hidden
                                                    className="absolute inset-y-0 left-0 bg-[#365332]/60 transition-[width] duration-200 ease-linear"
                                                    style={{ width: `${progress * 100}%` }}
                                                />
                                            )}
                                            <span
                                                className={cn(
                                                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                                                    isPlaying ? "border-white bg-white text-[#141714]" : "border-[#141714]/20 text-[#141714] group-hover:border-[#141714]"
                                                )}
                                            >
                                                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
                                            </span>
                                            <span className="relative w-6 shrink-0 font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                                            <span className="relative min-w-0 flex-1">
                                                <span className="block truncate font-semibold">{song.title}</span>
                                                {song.featured.length > 0 && (
                                                    <span className={cn("block truncate text-sm", isPlaying ? "text-white/75" : "text-[#61675E]")}>
                                                        feat. {song.featured.join(", ")}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                        {heard && (
                            <p className="mt-4 rounded-xl bg-[#F2B705]/15 px-4 py-3 text-sm text-[#141714]">
                                That&apos;s 20 seconds of it.{" "}
                                <button type="button" onClick={() => setBuying(release)} className="font-bold underline underline-offset-4">
                                    Get all {songs.length} songs — name your price
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <ReleasePurchaseModal release={buying} onClose={() => setBuying(null)} />
        </div>
    );
}
