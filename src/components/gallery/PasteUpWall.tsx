"use client";

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GRIT, TAPE, marker, pad2 } from "./materials";
import type { GalleryPrint } from "./prints";

/**
 * The gallery on a big screen: prints pasted up on a painted block wall.
 *
 * The music page hands you records, the videos page tapes, the film arm a strip
 * of 35mm. Most of these photographs are of walls, trucks and blackbooks, so
 * they go back up on a wall — taped at a lean, captioned in marker, under the
 * same bare bulb that lights the home page.
 *
 * The paste-up is laid out on a wall 1200 units across and sized in container
 * query units, so it scales as one piece instead of reflowing into a grid.
 */

const WALL = 1200;
const WALL_HEIGHT = 1640;
const cq = (units: number) => `${+((units / WALL) * 100).toFixed(4)}cqw`;

/** Print border: sides and top, then the wider bottom margin the caption is written on. */
const BORDER = 10;
const MARGIN = 46;

interface Placement {
    x: number;
    y: number;
    /** Width of the print, border included. */
    w: number;
    /** Lean, in degrees. */
    r: number;
    tape: "strip" | "corners";
    /** Pixels it drifts with the cursor — nearer prints move more. */
    depth: number;
}

// Sequences hang together: the trailer at dusk then after dark, the box truck
// going up then finished, the blackbook pages in one corner.
const PLACEMENTS: Record<string, Placement> = {
    "trailer-dusk": { x: 30, y: 70, w: 440, r: -2.5, tape: "corners", depth: 6 },
    "trailer-night": { x: 505, y: 170, w: 380, r: 1.6, tape: "strip", depth: 9 },
    "hallway-record": { x: 915, y: 40, w: 265, r: 3, tape: "strip", depth: 7 },
    "blackbook-spread": { x: 50, y: 500, w: 410, r: 1.8, tape: "strip", depth: 8 },
    "dj-set": { x: 500, y: 545, w: 270, r: -3, tape: "corners", depth: 11 },
    "noxer-canvas": { x: 815, y: 530, w: 350, r: 2.4, tape: "corners", depth: 6 },
    "box-truck-ladder": { x: 35, y: 900, w: 290, r: -1.8, tape: "strip", depth: 9 },
    "box-truck-portrait": { x: 350, y: 985, w: 280, r: 2.6, tape: "corners", depth: 7 },
    "rooftop-throwies": { x: 655, y: 965, w: 255, r: -2.2, tape: "strip", depth: 10 },
    "blackbook-extra-ketchup": { x: 940, y: 880, w: 235, r: 4, tape: "strip", depth: 8 },
    "blackbook-portrait-piece": { x: 925, y: 1245, w: 245, r: -3.5, tape: "corners", depth: 12 },
};

/** Painted cinder block: running bond, 160 × 80. */
const BLOCKS =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='80'%3E%3Cpath d='M0 1H160M0 41H160M80 1V41M0 41V80M160 41V80' fill='none' stroke='%23000' stroke-opacity='.55' stroke-width='2'/%3E%3Cpath d='M0 3.5H160M0 43.5H160' fill='none' stroke='%23fff' stroke-opacity='.035'/%3E%3C/svg%3E\")";

/**
 * A photo added to prints.ts without a spot picked out still goes up — in rows
 * along the bottom of the wall, which grows to fit them.
 */
function pasteUp(prints: GalleryPrint[]) {
    let unplaced = 0;
    const placed = prints.map((print) => {
        const at = PLACEMENTS[print.id];
        if (at) return { print, at };
        const col = unplaced % 4;
        const row = Math.floor(unplaced / 4);
        unplaced++;
        return {
            print,
            at: {
                x: 40 + col * 290,
                y: WALL_HEIGHT + row * 440,
                w: 260,
                r: col % 2 ? 2 : -2,
                tape: "strip",
                depth: 8,
            } satisfies Placement,
        };
    });
    return { placed, height: WALL_HEIGHT + Math.ceil(unplaced / 4) * 440 };
}

interface PasteUpWallProps {
    prints: GalleryPrint[];
    onOpen: (index: number) => void;
}

export function PasteUpWall({ prints, onOpen }: PasteUpWallProps) {
    const wallRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const { placed, height } = pasteUp(prints);

    // Parallax runs through two CSS variables rather than state, so moving the
    // mouse never re-renders eleven images.
    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const wall = wallRef.current;
        if (!wall || reduceMotion || e.pointerType !== "mouse") return;
        const box = wall.getBoundingClientRect();
        wall.style.setProperty("--mx", (((e.clientX - box.left) / box.width) * 2 - 1).toFixed(3));
        wall.style.setProperty("--my", (((e.clientY - box.top) / box.height) * 2 - 1).toFixed(3));
    };

    const handlePointerLeave = () => {
        wallRef.current?.style.setProperty("--mx", "0");
        wallRef.current?.style.setProperty("--my", "0");
    };

    return (
        <div className="@container">
            <p className="mb-5 text-center text-[11px] uppercase tracking-[0.3em] text-noir-ash">
                {prints.length} prints · pasted up
            </p>

            <div
                ref={wallRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative overflow-hidden rounded-[3px] bg-[#16161a] ring-1 ring-black shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]"
                style={{ height: cq(height) }}
            >
                {/* ── the wall itself ─────────────────────────────────── */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundImage: BLOCKS, backgroundSize: `${cq(160)} ${cq(80)}` }}
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                    style={{ backgroundImage: GRIT }}
                />
                {/* overspray from pieces that were here before, and grime rising off the pavement */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: [
                            "radial-gradient(ellipse 55% 35% at 16% 10%, rgba(0,217,255,0.10), transparent 70%)",
                            "radial-gradient(ellipse 45% 30% at 84% 58%, rgba(214,38,120,0.08), transparent 70%)",
                            "radial-gradient(ellipse 90% 30% at 50% 100%, rgba(0,0,0,0.7), transparent 75%)",
                        ].join(","),
                    }}
                />

                {/* ── the piece underneath everything ─────────────────── */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute select-none motion-safe:transition-[translate] motion-safe:duration-700 motion-safe:ease-out"
                    style={{
                        left: cq(170),
                        top: cq(560),
                        rotate: "-7deg",
                        translate: "calc(var(--mx, 0) * -14px) calc(var(--my, 0) * -14px)",
                    }}
                >
                    <span
                        className="block font-display leading-[0.8]"
                        style={{
                            fontSize: cq(560),
                            color: "rgba(0,217,255,0.05)",
                            WebkitTextStroke: `${cq(3)} rgba(0,217,255,0.3)`,
                            textShadow: "0 0 60px rgba(0,217,255,0.22)",
                        }}
                    >
                        LOAF
                    </span>
                    {[
                        { left: "9%", h: 90 },
                        { left: "33%", h: 150 },
                        { left: "36%", h: 60 },
                        { left: "61%", h: 120 },
                        { left: "86%", h: 75 },
                    ].map((drip) => (
                        <span
                            key={drip.left}
                            className="absolute top-[92%] rounded-b-full bg-gradient-to-b from-[rgba(0,217,255,0.3)] to-[rgba(0,217,255,0.08)]"
                            style={{ left: drip.left, width: cq(6), height: cq(drip.h) }}
                        />
                    ))}
                </div>

                {/* the bulb over the wall, same wiring as the home page */}
                <span aria-hidden className="dungeon-lamp pointer-events-none absolute inset-x-0 top-0 h-[55%]" />

                {/* ── what's been written on it ───────────────────────── */}
                <Scrawl x={505} y={105} r={-4} size={24} color="#5fe3ff">
                    later that night ↘
                </Scrawl>
                <Scrawl x={70} y={1350} r={-3} size={24} color="#5fe3ff">
                    same truck →
                </Scrawl>
                <Scrawl x={60} y={1470} r={-2} size={22} color="rgba(240,234,220,0.75)">
                    pull any print off the wall ↑
                </Scrawl>
                <Scrawl x={660} y={1490} r={-8} size={44} color="rgba(255,79,154,0.8)">
                    LOAF REC.
                </Scrawl>
                <HelloSticker x={470} y={1420} />

                {/* ── the prints ──────────────────────────────────────── */}
                <ul className="absolute inset-0 m-0 list-none p-0">
                    {placed.map(({ print, at }, i) => (
                        <li
                            key={print.id}
                            className="absolute z-(--z) hover:z-50 focus-within:z-50 motion-safe:transition-[translate] motion-safe:duration-500 motion-safe:ease-out"
                            style={{
                                ["--z" as string]: 10 + i,
                                left: cq(at.x),
                                top: cq(at.y),
                                width: cq(at.w),
                                translate: `calc(var(--mx, 0) * ${at.depth}px) calc(var(--my, 0) * ${at.depth}px)`,
                            }}
                        >
                            {/* slapped up: lands a touch big and crooked, then settles */}
                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, scale: 1.14, rotate: at.r * 1.5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.05 * (i % 6) }}
                            >
                                <motion.button
                                    type="button"
                                    onClick={() => onOpen(i)}
                                    aria-label={`${print.caption}, view full size`}
                                    className="group relative block w-full cursor-zoom-in text-left focus-visible:outline-none"
                                    initial={false}
                                    animate={{ rotate: at.r, y: 0, scale: 1 }}
                                    whileHover={reduceMotion ? { scale: 1.02 } : { rotate: 0, y: -8, scale: 1.045 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                >
                                    <span
                                        className={cn(
                                            "relative block bg-[#ebe5d8]",
                                            "shadow-[0_12px_20px_-10px_rgba(0,0,0,0.95)] transition-shadow duration-300",
                                            "group-hover:shadow-[0_30px_44px_-16px_rgba(0,0,0,1)]",
                                            "group-focus-visible:ring-2 group-focus-visible:ring-accent-cyan group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-[#16161a]"
                                        )}
                                        style={{ padding: `${cq(BORDER)} ${cq(BORDER)} ${cq(MARGIN)}` }}
                                    >
                                        <span
                                            className="relative block overflow-hidden bg-noir-charcoal"
                                            style={{ aspectRatio: `${print.width} / ${print.height}` }}
                                        >
                                            <Image
                                                src={print.src}
                                                alt={print.alt}
                                                fill
                                                sizes={`(min-width: 1200px) ${Math.round(at.w * 0.96)}px, ${Math.round((at.w / WALL) * 100)}vw`}
                                                placeholder="blur"
                                                blurDataURL={print.blur}
                                                className="object-cover saturate-[0.9] transition-[filter] duration-500 group-hover:saturate-110"
                                            />
                                            {/* light catching the gloss as it comes off the wall */}
                                            <span
                                                aria-hidden
                                                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                            />
                                        </span>

                                        <span
                                            className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2"
                                            style={{ height: cq(MARGIN), paddingInline: cq(12) }}
                                        >
                                            <span
                                                className={cn(marker.className, "truncate leading-none text-[#1b1b1b]")}
                                                style={{ fontSize: cq(17) }}
                                            >
                                                {print.caption}
                                            </span>
                                            <span
                                                className="shrink-0 font-mono font-bold text-[#b9342f]"
                                                style={{ fontSize: cq(10) }}
                                            >
                                                #{pad2(i + 1)}
                                            </span>
                                        </span>
                                    </span>

                                    <PrintTape kind={at.tape} lean={at.r} />
                                </motion.button>
                            </motion.div>
                        </li>
                    ))}
                </ul>

                {/* inner shadow where the wall meets the frame of the page */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[60] shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]"
                />
            </div>
        </div>
    );
}

function PrintTape({ kind, lean }: { kind: Placement["tape"]; lean: number }) {
    if (kind === "strip") {
        return (
            <span
                aria-hidden
                className={TAPE}
                style={{
                    left: "50%",
                    top: cq(-14),
                    width: "34%",
                    height: cq(30),
                    transform: `translateX(-50%) rotate(${-lean * 1.6}deg)`,
                }}
            />
        );
    }
    return (
        <>
            <span
                aria-hidden
                className={TAPE}
                style={{ left: cq(-18), top: cq(2), width: cq(84), height: cq(24), transform: "rotate(-38deg)" }}
            />
            <span
                aria-hidden
                className={TAPE}
                style={{ right: cq(-18), top: cq(2), width: cq(84), height: cq(24), transform: "rotate(38deg)" }}
            />
        </>
    );
}

function Scrawl({
    x,
    y,
    r,
    size,
    color,
    children,
}: {
    x: number;
    y: number;
    r: number;
    size: number;
    color: string;
    children: ReactNode;
}) {
    return (
        <span
            aria-hidden
            className={cn(marker.className, "pointer-events-none absolute whitespace-nowrap leading-none")}
            style={{ left: cq(x), top: cq(y), fontSize: cq(size), color, rotate: `${r}deg` }}
        >
            {children}
        </span>
    );
}

function HelloSticker({ x, y }: { x: number; y: number }) {
    return (
        <span
            aria-hidden
            className="pointer-events-none absolute block overflow-hidden rounded-[5px] bg-[#f4f1ea] shadow-[0_6px_12px_-6px_rgba(0,0,0,0.9)]"
            style={{ left: cq(x), top: cq(y), width: cq(180), rotate: "-7deg" }}
        >
            <span
                className="block bg-[#d7263d] text-center font-black uppercase leading-none tracking-tight text-white"
                style={{ fontSize: cq(22), paddingTop: cq(8), paddingBottom: cq(5) }}
            >
                Hello
                <span className="block font-medium normal-case tracking-normal" style={{ fontSize: cq(10), marginTop: cq(3) }}>
                    my name is
                </span>
            </span>
            <span
                className={cn(marker.className, "block text-center leading-none text-[#111]")}
                style={{ fontSize: cq(40), paddingBlock: cq(12) }}
            >
                LOAF
            </span>
            <span className="block bg-[#d7263d]" style={{ height: cq(10) }} />
        </span>
    );
}
