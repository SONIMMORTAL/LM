"use client";

import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GRIT, TAPE, marker, pad2 } from "./materials";
import type { GalleryPrint } from "./prints";

/**
 * The gallery in your hand: a blackbook you thumb through.
 *
 * A wall of prints doesn't fit on a phone, but a book does — and a good share
 * of these photos are of blackbook pages anyway. One print taped in per page,
 * captioned in marker. Native scroll-snap does the paging, so the swipe is the
 * phone's own; the pages just bend away from the one you're on.
 */

/** Pens the page scribbles cycle through. */
const INKS = ["#c8322b", "#0a8fb0", "#7a3aa0"];

interface BlackbookProps {
    prints: GalleryPrint[];
    onOpen: (index: number) => void;
}

export function Blackbook({ prints, onOpen }: BlackbookProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const stripRef = useRef<HTMLOListElement>(null);
    const [page, setPage] = useState(0);
    const reduceMotion = useReducedMotion() ?? false;
    const { scrollXProgress } = useScroll({ container: scrollerRef });
    const count = prints.length;
    const filled = useTransform(scrollXProgress, [0, 1], [1 / Math.max(count, 1), 1]);

    // keep the contents strip centred on the page you're looking at
    const followStrip = (index: number) => {
        const strip = stripRef.current;
        const thumb = strip?.children[index] as HTMLElement | undefined;
        if (!strip || !thumb) return;
        strip.scrollTo({
            left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2,
            behavior: reduceMotion ? "auto" : "smooth",
        });
    };

    const handleScroll = () => {
        const scroller = scrollerRef.current;
        if (!scroller || scroller.clientWidth === 0) return;
        const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
        if (index !== page) {
            setPage(index);
            followStrip(index);
        }
    };

    const goTo = (index: number) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const clamped = Math.max(0, Math.min(count - 1, index));
        scroller.scrollTo({
            left: clamped * scroller.clientWidth,
            behavior: reduceMotion ? "auto" : "smooth",
        });
    };

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(page + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(page - 1);
        }
    };

    if (count === 0) return null;

    return (
        <div className="mx-auto w-full max-w-md">
            <p className="mb-4 text-center text-[10px] uppercase tracking-[0.3em] text-noir-ash">
                {count} pages · swipe to flip · tap to look closer
            </p>

            {/* ── the book ────────────────────────────────────────────── */}
            <div className="relative rounded-[16px] bg-gradient-to-br from-[#1b1b1e] via-[#0e0e10] to-[#070708] py-2.5 pl-5 pr-6 shadow-[0_30px_50px_-22px_rgba(0,0,0,1),inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-black">
                {/* stitching down the spine */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-6 left-[9px] border-l border-dashed border-white/15"
                />
                {/* the elastic band, hanging off the cover while it's open */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-[7px] w-[9px] rounded-[2px] bg-gradient-to-r from-black via-[#26262a] to-black shadow-[0_0_8px_rgba(0,0,0,0.9)]"
                />

                <div
                    ref={scrollerRef}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Blackbook"
                    className="hide-scrollbar relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                >
                    {prints.map((print, i) => (
                        <BookPage
                            key={print.id}
                            print={print}
                            index={i}
                            count={count}
                            progress={scrollXProgress}
                            reduceMotion={reduceMotion}
                            onOpen={onOpen}
                        />
                    ))}
                </div>
            </div>

            {/* ── turning pages ───────────────────────────────────────── */}
            <div className="mt-5 flex items-center gap-4 px-1">
                <button
                    type="button"
                    onClick={() => goTo(page - 1)}
                    disabled={page === 0}
                    aria-label="Previous page"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-noir-smoke bg-noir-charcoal text-foreground transition-opacity disabled:opacity-30"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                    <p aria-live="polite" className={cn(marker.className, "text-center text-lg leading-none text-foreground")}>
                        {pad2(page + 1)} <span className="text-noir-ash">/ {pad2(count)}</span>
                    </p>
                    <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-noir-smoke">
                        <motion.span
                            className="block h-full origin-left rounded-full bg-accent-cyan"
                            style={{ scaleX: filled }}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => goTo(page + 1)}
                    disabled={page === count - 1}
                    aria-label="Next page"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-noir-smoke bg-noir-charcoal text-foreground transition-opacity disabled:opacity-30"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* ── contents: jump straight to a page ───────────────────── */}
            <ol
                ref={stripRef}
                aria-label="Pages"
                className="hide-scrollbar relative mt-5 flex list-none gap-2 overflow-x-auto px-1 py-1"
            >
                {prints.map((print, i) => (
                    <li key={print.id} className="shrink-0">
                        <button
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Page ${i + 1}: ${print.caption}`}
                            aria-current={i === page ? "page" : undefined}
                            className={cn(
                                "relative block h-12 w-12 overflow-hidden rounded-[3px] transition-[opacity,box-shadow] duration-200",
                                i === page ? "opacity-100 ring-2 ring-accent-cyan" : "opacity-45 ring-1 ring-noir-smoke"
                            )}
                        >
                            <Image src={print.src} alt="" fill sizes="48px" className="object-cover" />
                        </button>
                    </li>
                ))}
            </ol>
        </div>
    );
}

interface BookPageProps {
    print: GalleryPrint;
    index: number;
    count: number;
    progress: MotionValue<number>;
    reduceMotion: boolean;
    onOpen: (index: number) => void;
}

function BookPage({ print, index, count, progress, reduceMotion, onOpen }: BookPageProps) {
    const span = 1 / Math.max(count - 1, 1);
    const at = index * span;
    const range = [at - span, at, at + span];
    // pages bend away from the one you're on, like paper held open at the spine
    const rotateY = useTransform(progress, range, [24, 0, -24]);
    const scale = useTransform(progress, range, [0.9, 1, 0.9]);
    const shade = useTransform(progress, range, [0.4, 0, 0.4]);

    const ratio = print.width / print.height;
    // landscape prints run the width of the page; portrait ones give up width to keep their height
    const printWidth = Math.min(90, 84 * ratio);
    const tilt = (((index * 53) % 7) - 3) * 0.6;
    const ink = INKS[index % INKS.length];

    return (
        <div
            role="group"
            aria-roledescription="page"
            aria-label={`Page ${index + 1} of ${count}`}
            className="w-full shrink-0 snap-center snap-always px-1"
        >
            <motion.figure
                style={reduceMotion ? undefined : { rotateY, scale, transformPerspective: 900 }}
                className="relative m-0 flex aspect-[3/4] flex-col overflow-hidden rounded-[6px] bg-[#eee8da] shadow-[0_12px_24px_-12px_rgba(0,0,0,0.9)]"
            >
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
                    style={{ backgroundImage: GRIT }}
                />
                {/* the gutter, where the page curves into the binding */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent"
                />

                <div className="relative flex items-start justify-between px-4 pt-3">
                    <span className="font-mono text-[10px] font-bold tracking-tight text-[#b9342f]">
                        #{pad2(index + 1)}
                    </span>
                    <span
                        aria-hidden
                        className={cn(marker.className, "-rotate-6 text-base leading-none")}
                        style={{ color: ink }}
                    >
                        {index === 0 ? "swipe →" : index % 2 ? "LOAF" : "LR"}
                    </span>
                </div>

                <div className="relative flex min-h-0 flex-1 items-center justify-center px-3">
                    <button
                        type="button"
                        onClick={() => onOpen(index)}
                        aria-label={`${print.caption}, view full size`}
                        className="relative block bg-white p-[5px] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                        style={{ width: `${printWidth}%`, transform: `rotate(${tilt}deg)` }}
                    >
                        <span
                            className="relative block overflow-hidden bg-noir-charcoal"
                            style={{ aspectRatio: `${print.width} / ${print.height}` }}
                        >
                            <Image
                                src={print.src}
                                alt={print.alt}
                                fill
                                sizes="(max-width: 480px) 80vw, 400px"
                                placeholder="blur"
                                blurDataURL={print.blur}
                                className="object-cover"
                            />
                        </span>
                        <span
                            aria-hidden
                            className={TAPE}
                            style={{
                                left: "50%",
                                top: -9,
                                width: "38%",
                                height: 20,
                                transform: `translateX(-50%) rotate(${-tilt * 2}deg)`,
                            }}
                        />
                    </button>
                </div>

                <figcaption className="relative flex items-end justify-between gap-3 px-4 pb-3 pt-2">
                    <span className={cn(marker.className, "text-[clamp(1.05rem,5vw,1.4rem)] leading-tight text-[#1b1b1b]")}>
                        {print.caption}
                    </span>
                    <span aria-hidden className={cn(marker.className, "shrink-0 text-sm")} style={{ color: ink }}>
                        p.{index + 1}
                    </span>
                </figcaption>

                {!reduceMotion && (
                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-black"
                        style={{ opacity: shade }}
                    />
                )}
            </motion.figure>
        </div>
    );
}
