"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { PrintfulProduct, PrintfulProductDetails } from "@/lib/printful";
import {
    mergeRackItems,
    RACK_CATEGORIES,
    resolveColorHex,
    type HangerStyle,
    type RackCategory,
    type RackProductItem,
} from "@/lib/shop-rack-catalog";
import { QuickViewDialog } from "@/components/shop/QuickViewDialog";
import { cn } from "@/lib/utils";

interface ClothingRackProps {
    products: PrintfulProduct[];
    detailsById: Record<number, PrintfulProductDetails>;
}

const NEIGHBOR_SHIFT_PX = [0, 56, 26, 10] as const;

/**
 * Interactive boutique showroom clothing rack matching Loaf Records' apparel catalog:
 * brushed-chrome overhead pole, wire & clip hangers, hover/scroll parting + pendulum sway,
 * category filters, and native Quick View bag integration.
 */
export function ClothingRack({ products, detailsById }: ClothingRackProps) {
    const allItems = useMemo(
        () => mergeRackItems(products, detailsById),
        [products, detailsById]
    );

    const [activeCategory, setActiveCategory] = useState<RackCategory>("All");
    const filteredItems = useMemo(() => {
        if (activeCategory === "All") return allItems;
        return allItems.filter((item) => item.meta.category === activeCategory);
    }, [allItems, activeCategory]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [controlsSpotlight, setControlsSpotlight] = useState(false);
    const [swingState, setSwingState] = useState<{ index: number; tick: number }>({
        index: -1,
        tick: 0,
    });
    const [quickViewItem, setQuickViewItem] = useState<RackProductItem | null>(null);
    const [isMobileViewport, setIsMobileViewport] = useState(false);

    const trackRef = useRef<HTMLDivElement>(null);
    const slotRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const dragStateRef = useRef<{
        active: boolean;
        startX: number;
        startScrollLeft: number;
        moved: boolean;
    }>({ active: false, startX: 0, startScrollLeft: 0, moved: false });
    const scrollRafRef = useRef<number | null>(null);

    const safeActiveIndex =
        filteredItems.length > 0 ? Math.min(activeIndex, filteredItems.length - 1) : 0;
    const activeItem = filteredItems[safeActiveIndex] ?? null;

    // Detect viewport breakpoint cleanly without SSR hydration mismatch
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const sync = () => setIsMobileViewport(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    const triggerSwing = useCallback((index: number) => {
        setSwingState((prev) => ({ index, tick: prev.tick + 1 }));
    }, []);

    const scrollSlotIntoView = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
        const track = trackRef.current;
        const slot = slotRefs.current[index];
        if (!track || !slot) return;

        const targetLeft = slot.offsetLeft - track.clientWidth / 2 + slot.offsetWidth / 2;
        track.scrollTo({
            left: Math.max(0, targetLeft),
            behavior,
        });
    }, []);

    const handleCategoryChange = (cat: RackCategory) => {
        setActiveCategory(cat);
        setActiveIndex(0);
        setHoveredIndex(null);
        setControlsSpotlight(false);
        setSwingState({ index: -1, tick: 0 });
        trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    };

    const stepSelection = useCallback(
        (delta: number) => {
            if (filteredItems.length === 0) return;
            const next =
                (safeActiveIndex + delta + filteredItems.length) % filteredItems.length;
            setActiveIndex(next);
            setControlsSpotlight(!isMobileViewport);
            triggerSwing(next);
            scrollSlotIntoView(next, "smooth");
        },
        [filteredItems.length, safeActiveIndex, isMobileViewport, triggerSwing, scrollSlotIntoView]
    );

    // Sync active centered slot during mobile swipe via native scrollsnap events + rAF fallback
    useEffect(() => {
        const track = trackRef.current;
        if (!track || !isMobileViewport || filteredItems.length <= 1) return;

        const findClosestSlotIndex = () => {
            const centerX = track.scrollLeft + track.clientWidth / 2;
            let bestIndex = 0;
            let bestDist = Number.POSITIVE_INFINITY;

            for (let i = 0; i < filteredItems.length; i++) {
                const el = slotRefs.current[i];
                if (!el) continue;
                const elCenter = el.offsetLeft + el.offsetWidth / 2;
                const dist = Math.abs(elCenter - centerX);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIndex = i;
                }
            }
            return bestIndex;
        };

        const applySnapIndex = (nextIndex: number) => {
            setActiveIndex((prev) => {
                if (prev !== nextIndex) {
                    triggerSwing(nextIndex);
                }
                return nextIndex;
            });
        };

        const onScroll = () => {
            if (scrollRafRef.current !== null) return;
            scrollRafRef.current = requestAnimationFrame(() => {
                scrollRafRef.current = null;
                applySnapIndex(findClosestSlotIndex());
            });
        };

        // Native CSS scroll-snap events (Chrome 129+, Safari 26.2+) give immediate snap-target feedback
        const onSnapEvent = (event: Event) => {
            const snapEvent = event as Event & { snapTargetInline?: Element | null };
            const target = snapEvent.snapTargetInline;
            if (target instanceof HTMLElement) {
                const idx = Number.parseInt(target.dataset.rackIndex ?? "", 10);
                if (!Number.isNaN(idx)) {
                    applySnapIndex(idx);
                    return;
                }
            }
            applySnapIndex(findClosestSlotIndex());
        };

        track.addEventListener("scroll", onScroll, { passive: true });
        track.addEventListener("scrollsnapchanging", onSnapEvent);
        track.addEventListener("scrollsnapchange", onSnapEvent);

        return () => {
            track.removeEventListener("scroll", onScroll);
            track.removeEventListener("scrollsnapchanging", onSnapEvent);
            track.removeEventListener("scrollsnapchange", onSnapEvent);
            if (scrollRafRef.current !== null) {
                cancelAnimationFrame(scrollRafRef.current);
                scrollRafRef.current = null;
            }
        };
    }, [isMobileViewport, filteredItems.length, triggerSwing]);

    // Arrow key navigation across the rack when Quick View isn't open
    useEffect(() => {
        if (quickViewItem) return;
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

            if (e.key === "ArrowRight") {
                e.preventDefault();
                stepSelection(1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                stepSelection(-1);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [quickViewItem, stepSelection]);

    // Desktop click-and-drag rail panning (does not hijack touches on mobile)
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "touch") return;
        const track = trackRef.current;
        if (!track) return;
        dragStateRef.current = {
            active: true,
            startX: e.clientX,
            startScrollLeft: track.scrollLeft,
            moved: false,
        };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStateRef.current.active) return;
        const track = trackRef.current;
        if (!track) return;
        const dx = e.clientX - dragStateRef.current.startX;
        if (Math.abs(dx) > 6) {
            dragStateRef.current.moved = true;
            track.scrollLeft = dragStateRef.current.startScrollLeft - dx;
        }
    };

    const endPointerDrag = () => {
        dragStateRef.current.active = false;
    };

    // Determine which slot currently parts its neighbors
    const focusedIndex = isMobileViewport
        ? safeActiveIndex
        : hoveredIndex !== null
          ? hoveredIndex
          : controlsSpotlight
            ? safeActiveIndex
            : null;

    const categoryCounts = useMemo(() => {
        const counts: Record<RackCategory, number> = {
            All: allItems.length,
            Hoodies: 0,
            Tees: 0,
            Outerwear: 0,
            Shorts: 0,
        };
        for (const item of allItems) {
            counts[item.meta.category] += 1;
        }
        return counts;
    }, [allItems]);

    const progressThumbPct =
        filteredItems.length > 0 ? Math.max(14, 100 / filteredItems.length) : 100;
    const progressOffsetPct =
        filteredItems.length > 1
            ? (safeActiveIndex / (filteredItems.length - 1)) * (100 - progressThumbPct)
            : 0;

    return (
        <section
            aria-label="Loaf Wear clothing rack"
            className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-x-clip bg-[#FAF9F6] text-[#141714] pt-24 pb-28 md:pt-32 md:pb-24 selection:bg-[#365332] selection:text-white"
        >
            {/* Subtle tiger-stripe camo rim & Loaf Wear boutique mural backdrop */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="tiger-camo-strip absolute inset-0 opacity-[0.11]" />
                <Image
                    src="/brand/shop-rack-bg-4k.webp"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-[0.26] md:opacity-[0.30]"
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(250,249,246,0.78) 0%, rgba(250,249,246,0.40) 38%, rgba(250,249,246,0.46) 72%, rgba(250,249,246,0.90) 100%)",
                    }}
                />
            </div>

            {/* Header & Category Filter Strip */}
            <header className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-3.5 px-4 md:flex-row md:items-end md:justify-between md:px-10">
                <div>
                    <div className="flex items-center gap-2">
                        <span aria-hidden className="tiger-camo-strip h-2 w-7 rounded-sm border border-[#141714]/20" />
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#365332]">
                            Loaf Wear · Archive Rail
                        </p>
                    </div>
                    <div className="mt-1 flex items-baseline gap-3">
                        <h1 className="font-display text-3xl uppercase leading-none tracking-[0.04em] text-[#141714] md:text-5xl">
                            Clothing Rack
                        </h1>
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#61675E]">
                            {filteredItems.length}{" "}
                            {filteredItems.length === 1 ? "Piece" : "Pieces"}
                        </span>
                    </div>
                </div>

                <nav
                    aria-label="Clothing categories"
                    className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5"
                >
                    {RACK_CATEGORIES.map((category) => {
                        const count = categoryCounts[category];
                        if (category !== "All" && count === 0) return null;
                        const selected = category === activeCategory;
                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => handleCategoryChange(category)}
                                aria-pressed={selected}
                                className={cn(
                                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 md:py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all cursor-pointer",
                                    selected
                                        ? "border-[#18181B] bg-[#18181B] text-[#F4F2ED]"
                                        : "border-black/15 bg-white/60 text-zinc-700 hover:border-black/45 hover:text-[#18181B]"
                                )}
                            >
                                <span>{category}</span>
                                <span
                                    className={cn(
                                        "text-[9px]",
                                        selected ? "text-zinc-300" : "text-zinc-400"
                                    )}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </header>

            {/* Interactive Showroom Chrome Rail */}
            <div className="relative z-10 my-3 flex-1 flex flex-col justify-center md:my-4">
                {filteredItems.length === 0 ? (
                    <div className="mx-auto max-w-md px-6 py-24 text-center">
                        <p className="font-display text-2xl uppercase tracking-wider text-zinc-700">
                            Rail Empty
                        </p>
                        <p className="mt-2 font-mono text-xs text-zinc-500">
                            Catalog items are currently syncing. Check back in a moment.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="relative mx-auto w-full max-w-[1520px]">
                            {/* Brushed Chrome Overhead Pole & Wall Brackets */}
                            <div
                                aria-hidden="true"
                                style={{
                                    background:
                                        "linear-gradient(180deg, #9898A0 0%, #FFFFFF 30%, #B4B4BA 55%, #55555B 85%, #C8C8CE 100%)",
                                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.22)",
                                }}
                                className="rack-chrome-bar pointer-events-none absolute left-3 right-3 top-[16px] z-10 h-[7px] rounded-full md:left-6 md:right-6"
                            />
                            <div
                                aria-hidden="true"
                                style={{
                                    background: "linear-gradient(90deg, #686870, #D4D4DC, #787880)",
                                }}
                                className="rack-chrome-cap pointer-events-none absolute left-5 top-[11px] z-10 hidden h-[17px] w-[7px] rounded-sm shadow-sm md:block"
                            />
                            <div
                                aria-hidden="true"
                                style={{
                                    background: "linear-gradient(90deg, #686870, #D4D4DC, #787880)",
                                }}
                                className="rack-chrome-cap pointer-events-none absolute right-5 top-[11px] z-10 hidden h-[17px] w-[7px] rounded-sm shadow-sm md:block"
                            />

                            {/* Horizontal Garment Rail */}
                            <div
                                ref={trackRef}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={endPointerDrag}
                                onPointerCancel={endPointerDrag}
                                onMouseLeave={() => {
                                    setHoveredIndex(null);
                                }}
                                className="relative z-20 w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory md:snap-none md:cursor-grab md:active:cursor-grabbing"
                            >
                                <div className="flex w-max min-w-full items-start justify-center max-md:px-[calc(50vw-92px)] md:px-28">
                                    {filteredItems.map((item, idx) => {
                                        const isActive = idx === safeActiveIndex;
                                        const hasFocus = focusedIndex !== null;
                                        const dist = hasFocus ? Math.abs(idx - focusedIndex) : 0;

                                        let shiftX = 0;
                                        let scale = 0.89;
                                        let zIndex = isActive
                                            ? 24
                                            : 20 - Math.min(Math.abs(idx - safeActiveIndex), 10);

                                        if (hasFocus) {
                                            if (isMobileViewport) {
                                                scale = dist === 0 ? 1 : dist === 1 ? 0.84 : 0.78;
                                                zIndex = dist === 0 ? 35 : 20 - Math.min(dist, 12);
                                            } else {
                                                const step =
                                                    NEIGHBOR_SHIFT_PX[Math.min(dist, 3)];
                                                if (idx < focusedIndex) shiftX = -step;
                                                else if (idx > focusedIndex) shiftX = step;
                                                scale = dist === 0 ? 1 : dist === 1 ? 0.86 : 0.89;
                                                zIndex = dist === 0 ? 40 : 25 - Math.min(dist, 15);
                                            }
                                        }

                                        const shouldSwing = swingState.index === idx;

                                        return (
                                            <button
                                                key={item.product.id}
                                                ref={(el) => {
                                                    slotRefs.current[idx] = el;
                                                }}
                                                data-rack-index={idx}
                                                type="button"
                                                aria-label={`${item.product.name}${item.priceRangeLabel ? ` — ${item.priceRangeLabel}` : ""}, quick view`}
                                                onMouseEnter={() => {
                                                    if (isMobileViewport) return;
                                                    setHoveredIndex(idx);
                                                    setActiveIndex(idx);
                                                    setControlsSpotlight(false);
                                                    triggerSwing(idx);
                                                }}
                                                onFocus={() => {
                                                    setActiveIndex(idx);
                                                    if (!isMobileViewport) {
                                                        setHoveredIndex(idx);
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (dragStateRef.current.moved) {
                                                        dragStateRef.current.moved = false;
                                                        return;
                                                    }
                                                    setActiveIndex(idx);
                                                    if (isMobileViewport && !isActive) {
                                                        scrollSlotIntoView(idx, "smooth");
                                                        triggerSwing(idx);
                                                        return;
                                                    }
                                                    setQuickViewItem(item);
                                                }}
                                                style={{ zIndex }}
                                                className={cn(
                                                    "group relative shrink-0 select-none text-left focus:outline-none cursor-pointer",
                                                    "snap-center snap-always",
                                                    "h-[346px] w-[184px] md:h-[380px] md:w-[104px] lg:h-[400px] lg:w-[114px]"
                                                )}
                                            >
                                                <div
                                                    style={{
                                                        transform: `translateX(${shiftX}px) scale(${scale})`,
                                                        transformOrigin: "50% 19px",
                                                    }}
                                                    className="pointer-events-none absolute left-1/2 top-0 aspect-[9/10] w-[264px] -translate-x-1/2 transition-transform duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:w-[292px] lg:w-[312px]"
                                                >
                                                    <div
                                                        key={shouldSwing ? `sw-${swingState.tick}` : "idle"}
                                                        style={{ transformOrigin: "50% 19px" }}
                                                        className={cn(
                                                            "relative h-full w-full",
                                                            shouldSwing && "animate-rack-swing"
                                                        )}
                                                    >
                                                        {/* Slim Chrome Wire / Clip Hanger */}
                                                        <RackHangerSvg style={item.meta.hanger} />

                                                        {/* Cutout Garment */}
                                                        <div
                                                            className={cn(
                                                                "relative z-10 h-full w-full",
                                                                item.meta.topOffsetClass
                                                            )}
                                                        >
                                                            <Image
                                                                src={item.meta.cutoutSrc}
                                                                alt={item.product.name}
                                                                fill
                                                                loading="eager"
                                                                priority={idx < 4}
                                                                fetchPriority={idx === 0 ? "high" : undefined}
                                                                sizes="(max-width: 768px) 264px, 312px"
                                                                className="object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.16)]"
                                                            />
                                                        </div>

                                                        {/* Front clip jaws bite visually over waistbands on clip hangers */}
                                                        {item.meta.hanger === "clips" && (
                                                            <RackClipsOverlaySvg />
                                                        )}
                                                    </div>
                                                </div>

                                                <span className="sr-only">{item.product.name}</span>
                                                <span className="pointer-events-none absolute inset-x-3 top-6 bottom-6 rounded-xl ring-2 ring-transparent group-focus-visible:ring-[#18181B]" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Soft Studio Floor Shadow beneath the Hanging Garments */}
                        <div
                            aria-hidden="true"
                            className="rack-floor-shadow pointer-events-none mx-auto -mt-3 h-4 w-[min(780px,82%)] md:-mt-2 md:h-5"
                        />

                        {/* Mobile Swipe Progress Track & Cue */}
                        <div className="mt-2.5 flex flex-col items-center gap-1.5 md:hidden">
                            <div className="relative h-[3px] w-40 overflow-hidden rounded-full bg-black/12">
                                <div
                                    style={{
                                        width: `${progressThumbPct}%`,
                                        left: `${progressOffsetPct}%`,
                                    }}
                                    className="absolute top-0 bottom-0 rounded-full bg-[#18181B] transition-[left] duration-200 ease-out"
                                />
                            </div>
                            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                                Swipe to explore
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Active Item Strip & Showroom Controls */}
            {activeItem && (
                <footer
                    aria-label="Selected garment controls"
                    className="relative z-10 mx-auto w-full max-w-[1440px] px-4 md:px-10"
                >
                    <div className="flex flex-col gap-3.5 rounded-2xl border border-black/10 bg-[#F4F2ED]/85 px-4 py-3.5 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:px-5">
                        <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                <span>
                                    No. {String(safeActiveIndex + 1).padStart(2, "0")} /{" "}
                                    {String(filteredItems.length).padStart(2, "0")}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{activeItem.meta.category}</span>
                                {activeItem.colors.length > 0 && (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span
                                            aria-label={`Available colors: ${activeItem.colors.join(", ")}`}
                                            className="inline-flex items-center gap-1.5"
                                        >
                                            {activeItem.colors.slice(0, 6).map((color) => (
                                                <span
                                                    key={color}
                                                    title={color}
                                                    aria-hidden="true"
                                                    className="h-2.5 w-2.5 rounded-full border border-black/25"
                                                    style={{ backgroundColor: resolveColorHex(color) }}
                                                />
                                            ))}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <h2 className="truncate font-display text-2xl uppercase leading-none tracking-[0.03em] text-[#18181B] md:text-3xl">
                                    {activeItem.product.name}
                                </h2>
                                {activeItem.priceRangeLabel && (
                                    <span className="font-mono text-sm font-semibold text-[#18181B] md:text-base">
                                        {activeItem.priceRangeLabel}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => stepSelection(-1)}
                                    aria-label="Previous garment"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white text-[#18181B] transition-colors hover:border-[#18181B] hover:bg-[#18181B] hover:text-white cursor-pointer"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => stepSelection(1)}
                                    aria-label="Next garment"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white text-[#18181B] transition-colors hover:border-[#18181B] hover:bg-[#18181B] hover:text-white cursor-pointer"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setQuickViewItem(activeItem)}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#18181B] px-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F4F2ED] transition-colors hover:bg-black cursor-pointer"
                            >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                <span>Quick View</span>
                            </button>

                            <Link
                                href={`/shop/product/${activeItem.product.id}`}
                                className="inline-flex h-11 items-center justify-center gap-1 rounded-full border border-black/20 bg-white px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[#18181B] transition-colors hover:border-[#18181B]"
                            >
                                <span>Details</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </footer>
            )}

            <QuickViewDialog item={quickViewItem} onClose={() => setQuickViewItem(null)} />
        </section>
    );
}

function RackHangerSvg({ style }: { style: HangerStyle }) {
    const uid = useId();
    const metalGradId = `rack-metal-${uid}`;

    return (
        <svg
            viewBox="0 0 180 62"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[6px] z-0 h-[56px] w-[158px] -translate-x-1/2 md:h-[58px] md:w-[168px]"
        >
            <defs>
                <linearGradient id={metalGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#85858E" />
                    <stop offset="45%" stopColor="#FAFAFC" />
                    <stop offset="100%" stopColor="#5D5D66" />
                </linearGradient>
            </defs>

            {/* Slim brushed-chrome J-hook looping cleanly over the bar (y=13.5 -> 19.5px rail center) */}
            <path
                d="M95.5 15.2C97.1 8.4 93.9 3.6 89.8 3.6C85.5 3.6 83.2 7.8 85.4 11.4L90 19.6V32"
                stroke={`url(#${metalGradId})`}
                strokeWidth="2.9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {style === "clips" ? (
                /* Horizontal chrome clip rod */
                <rect
                    x="44"
                    y="33"
                    width="92"
                    height="3.8"
                    rx="1.9"
                    fill={`url(#${metalGradId})`}
                />
            ) : style === "hoodie" ? (
                /* Hoodies hide hanger shoulders inside the hood — show clean neck stem only */
                <path
                    d="M90 31V44"
                    stroke={`url(#${metalGradId})`}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                />
            ) : (
                /* Slim silver wire shoulder arc tucked cleanly inside collar neck opening */
                <path
                    d="M90 31L56 50.5C54.6 51.3 54.8 53.2 56.5 53.2H123.5C125.2 53.2 125.4 51.3 124 50.5L90 31Z"
                    stroke={`url(#${metalGradId})`}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );
}

function RackClipsOverlaySvg() {
    return (
        <svg
            viewBox="0 0 180 62"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[6px] z-20 h-[56px] w-[158px] -translate-x-1/2 md:h-[58px] md:w-[168px]"
        >
            <g fill="#C0C0C8" stroke="#3F3F46" strokeWidth="0.9">
                <rect x="49" y="32" width="10" height="21" rx="2" />
                <rect x="51" y="45" width="6" height="8" rx="1" fill="#52525B" />
                <rect x="121" y="32" width="10" height="21" rx="2" />
                <rect x="123" y="45" width="6" height="8" rx="1" fill="#52525B" />
            </g>
        </svg>
    );
}
