"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { playCrateFlipSfx, playNeedleDropSfx } from "@/lib/ui-sfx";
import type { Track } from "@/lib/tracks-server";

export interface ShopRecord {
    name: string;
    artist: string;
    cover: string;
    tracks: Track[];
    price?: number;
}

interface RecordShopMobileProps {
    records: ShopRecord[];
    /** Album name → the record itself (transparent PNG), slid out of the sleeve */
    vinyls: Record<string, string>;
    selectedIndex: number;
    onSelect: (index: number) => void;
    onPlayTrack: (track: Track) => void;
    onBuy: (record: ShopRecord) => void;
    /** Title of the track the page player currently holds */
    currentTrackTitle?: string;
    isPlaying: boolean;
}

const PAPER = "#EEE5D1";
const INK = "#1D1813";
const STAMP_RED = "#B8321A";
const STICKER = "#F26B1D";

// Fine grain for the paper and the crate wood, the same noise the site's film grain uses
const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const price = (record: ShopRecord) => `$${(record.price ?? 9.99).toFixed(2)}`;

/**
 * The music page on a phone, as a record shop: the shop sign, a crate of sleeves to flip
 * through with price stickers on them, the record you pulled out with its vinyl sliding
 * from the sleeve, and the tracklist printed like the back of the jacket — side A, side B.
 * Nothing else: listen, and buy the record you came for.
 *
 * Every piece sits in its own bordered box, and anything that moves stays inside it.
 */
export function RecordShopMobile({
    records,
    vinyls,
    selectedIndex,
    onSelect,
    onPlayTrack,
    onBuy,
    currentTrackTitle,
    isPlaying,
}: RecordShopMobileProps) {
    const crateRef = useRef<HTMLDivElement>(null);
    const record = records[selectedIndex];

    // Keep the record you're holding in the middle of the crate
    useEffect(() => {
        const crate = crateRef.current;
        const sleeve = crate?.querySelector<HTMLElement>(`[data-sleeve="${selectedIndex}"]`);
        if (!crate || !sleeve) return;
        crate.scrollTo({
            left: sleeve.offsetLeft - (crate.clientWidth - sleeve.offsetWidth) / 2,
            behavior: "smooth",
        });
    }, [selectedIndex]);

    if (!record) return null;

    const playable = record.tracks.filter((t) => t.audio_url);
    const spinning = isPlaying && record.tracks.some((t) => t.title === currentTrackTitle);
    const sideA = record.tracks.slice(0, Math.ceil(record.tracks.length / 2));
    const sideB = record.tracks.slice(sideA.length);

    const pick = (index: number) => {
        if (index === selectedIndex) return;
        playCrateFlipSfx();
        onSelect(index);
    };

    const play = (track?: Track) => {
        if (!track?.audio_url) return;
        playNeedleDropSfx();
        onPlayTrack(track);
    };

    return (
        <section aria-label="Loaf Records record shop" className="md:hidden px-3 pt-[76px] pb-4 space-y-3">
            {/* ── The shop sign ── */}
            <header
                className="relative overflow-hidden rounded-2xl border-2 border-amber-400/45 px-4 py-3.5"
                style={{
                    backgroundColor: "#140E08",
                    backgroundImage:
                        "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 7px), linear-gradient(180deg, #1C140B, #0F0A06)",
                    boxShadow: "inset 0 0 0 3px #0B0805, inset 0 0 0 4px rgba(245,158,11,0.28)",
                }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
                            Est. 2009 · Brooklyn NY
                        </p>
                        <p className="mt-1 font-display text-[clamp(30px,10vw,40px)] uppercase leading-[0.9] tracking-[0.04em] text-amber-300 [text-shadow:0_2px_0_#000]">
                            Loaf Records
                        </p>
                        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/70">
                            Record shop · {records.length} LPs in the crate
                        </p>
                    </div>
                    <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-md border border-red-500/70 bg-[#1a0606]/85 px-2 py-1 font-display text-[13px] uppercase leading-none tracking-[0.18em] text-[#FFE1E1] [text-shadow:0_0_4px_#ff3b3b,0_0_10px_rgba(255,40,40,0.7)]">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" />
                        Open
                    </span>
                </div>
            </header>

            {/* ── The crate: flip through the sleeves ── */}
            <div
                className="relative overflow-hidden rounded-2xl border border-[#6B4A2B]"
                style={{
                    backgroundColor: "#1A120B",
                    backgroundImage: `${GRAIN}, linear-gradient(180deg, #24180E 0%, #140D07 100%)`,
                    backgroundSize: "160px 160px, auto",
                }}
            >
                {/* Divider card sticking up out of the crate */}
                <div className="flex items-center justify-between px-3 pt-2.5">
                    <span
                        className="rounded-t-md px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.22em]"
                        style={{ backgroundColor: PAPER, color: INK }}
                    >
                        S · Shadow The Great
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C9A77C]/70">
                        Flip through →
                    </span>
                </div>

                <div
                    ref={crateRef}
                    role="listbox"
                    aria-label="Records in the crate"
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 pt-4 pb-3"
                >
                    {records.map((r, i) => {
                        const selected = i === selectedIndex;
                        return (
                            <button
                                key={r.name}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                aria-label={`${r.name}, ${price(r)}`}
                                data-sleeve={i}
                                onClick={() => pick(i)}
                                className="group relative w-[38%] max-w-[150px] shrink-0 snap-center text-left"
                            >
                                <span
                                    className={cn(
                                        "relative block aspect-square overflow-hidden rounded-[4px] shadow-[0_10px_18px_rgba(0,0,0,0.7)] transition-transform duration-300",
                                        selected
                                            ? "-translate-y-1.5 ring-2 ring-amber-400"
                                            : "ring-1 ring-black/60 opacity-80 group-active:translate-y-0.5"
                                    )}
                                >
                                    <Image src={r.cover} alt="" fill sizes="150px" className="object-cover" />
                                    {/* Sleeve wear: a little shine down one edge */}
                                    <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/15 to-transparent" />
                                </span>
                                {/* Price sticker */}
                                <span
                                    aria-hidden
                                    className="absolute right-1 top-1 flex h-10 w-10 rotate-[-10deg] items-center justify-center rounded-full font-mono text-[10px] font-black text-white shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                                    style={{ backgroundColor: STICKER, boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35)" }}
                                >
                                    {price(r)}
                                </span>
                                <span
                                    className={cn(
                                        "mt-2 block truncate font-mono text-[9px] font-bold uppercase tracking-[0.16em]",
                                        selected ? "text-amber-300" : "text-[#C9A77C]/80"
                                    )}
                                >
                                    {r.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* The crate's front lip, stencilled */}
                <div
                    aria-hidden
                    className="flex h-6 items-center justify-center border-t border-black/50 font-mono text-[9px] font-black uppercase tracking-[0.4em] text-black/45"
                    style={{ backgroundImage: "linear-gradient(180deg, #8A6038, #5A3B1F)" }}
                >
                    Loaf Records · BKLYN
                </div>
            </div>

            {/* ── The record you pulled out ── */}
            <article className="overflow-hidden rounded-2xl border border-white/12 bg-[#0D0D10] p-3">
                <div className="relative h-[clamp(150px,46vw,200px)] overflow-hidden">
                    {/* The vinyl slides out from behind the sleeve, and turns while it plays */}
                    <div
                        key={record.name}
                        className="absolute left-0 top-0 aspect-square h-full translate-x-[52%] motion-safe:animate-[vinylSlide_0.6s_ease-out_both]"
                    >
                        <div className={cn("relative h-full w-full", spinning && "motion-safe:animate-[spin_2.4s_linear_infinite]")}>
                            <Image
                                src={vinyls[record.name] ?? "/vinylsolo.png"}
                                alt=""
                                fill
                                sizes="200px"
                                className="object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.8)]"
                            />
                        </div>
                    </div>
                    <div className="relative z-10 aspect-square h-full overflow-hidden rounded-[4px] shadow-[8px_0_18px_rgba(0,0,0,0.75)] ring-1 ring-black/60">
                        <Image src={record.cover} alt={`${record.name} sleeve`} fill sizes="200px" className="object-cover" />
                    </div>
                </div>

                <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-amber-400">
                    LP · {record.tracks.length} {record.tracks.length === 1 ? "track" : "tracks"} · Digital album
                </p>
                <h2 className="mt-1 font-display text-[clamp(28px,9vw,38px)] uppercase leading-[0.95] tracking-[0.03em] text-white">
                    {record.name}
                </h2>
                <p className="mt-0.5 text-sm text-noir-cloud">{record.artist}</p>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        disabled={playable.length === 0}
                        onClick={() => play(playable[0])}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-3 font-display text-[17px] uppercase leading-none tracking-[0.04em] text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-[0.98] disabled:opacity-40"
                    >
                        <Play className="h-4 w-4 shrink-0 fill-current" />
                        Drop the needle
                    </button>
                    {/* A price-gun tag, hole punched */}
                    <button
                        type="button"
                        onClick={() => onBuy(record)}
                        className="relative flex items-center justify-center gap-2 rounded-xl px-3 py-3 font-display text-[17px] uppercase leading-none tracking-[0.04em] active:scale-[0.98]"
                        style={{ backgroundColor: PAPER, color: INK }}
                    >
                        <span aria-hidden className="absolute left-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#0D0D10]" />
                        Buy {price(record)}
                    </button>
                </div>
            </article>

            {/* ── The back of the jacket: the tracklist, side A and side B ── */}
            <section
                aria-label={`${record.name} tracklist`}
                className="relative overflow-hidden rounded-xl px-4 pb-3 pt-4 shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
                style={{ backgroundColor: PAPER, color: INK }}
            >
                <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.18]" style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }} />
                <div className="relative flex items-baseline justify-between gap-3 border-b-2 pb-2" style={{ borderColor: INK }}>
                    <p className="min-w-0 truncate font-display text-xl uppercase leading-none tracking-[0.05em]">{record.name}</p>
                    <p className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.2em] opacity-70">Loaf Records</p>
                </div>

                {[
                    { side: "A", tracks: sideA, offset: 0 },
                    { side: "B", tracks: sideB, offset: sideA.length },
                ]
                    .filter((s) => s.tracks.length > 0)
                    .map(({ side, tracks }) => (
                        <div key={side} className="relative mt-3">
                            <span
                                className="inline-block -rotate-2 rounded-sm border-2 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.24em]"
                                style={{ borderColor: STAMP_RED, color: STAMP_RED }}
                            >
                                Side {side}
                            </span>
                            <ol className="mt-1.5">
                                {tracks.map((track, i) => {
                                    const current = currentTrackTitle === track.title;
                                    const canPlay = Boolean(track.audio_url);
                                    return (
                                        <li key={track.id} className="border-b border-black/10 last:border-b-0">
                                            <button
                                                type="button"
                                                disabled={!canPlay}
                                                onClick={() => play(track)}
                                                className="flex w-full min-w-0 items-center gap-3 py-2.5 text-left disabled:opacity-45"
                                            >
                                                <span className="w-6 shrink-0 font-mono text-[11px] font-black opacity-60">
                                                    {side}
                                                    {i + 1}
                                                </span>
                                                <span
                                                    className={cn("min-w-0 flex-1 truncate text-[13px] font-semibold", current && "font-black")}
                                                    style={current ? { color: STAMP_RED } : undefined}
                                                >
                                                    {track.title}
                                                </span>
                                                {canPlay &&
                                                    (current && isPlaying ? (
                                                        <Pause className="h-3.5 w-3.5 shrink-0" style={{ color: STAMP_RED }} />
                                                    ) : (
                                                        <Play className="h-3.5 w-3.5 shrink-0 opacity-40" />
                                                    ))}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    ))}
            </section>
        </section>
    );
}
