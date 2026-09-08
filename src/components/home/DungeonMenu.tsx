"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Menu data — each destination is a record
   pulled from the crate.
   ───────────────────────────────────────────── */
interface MenuItem {
    label: string;
    sub: string;
    href: string;
    vinyl: string;
}

const MENU_ITEMS: MenuItem[] = [
    {
        label: "Music",
        sub: "Albums · Singles · Vinyl",
        href: "/music",
        vinyl: "/LFTD-3-deluxe-vinyl.png",
    },
    {
        label: "Shop",
        sub: "Official Merch & Apparel",
        href: "/shop",
        vinyl: "/THE-COMMISSION-7-deluxe-vinyl.png",
    },
    {
        label: "Loaf Films",
        sub: "Video Production",
        href: "/loaf-films",
        vinyl: "/darkside-cover-deluxe-vinyl.png",
    },
    {
        label: "Videos",
        sub: "Music Videos & Visuals",
        href: "/videos",
        vinyl: "/lord-knows-cover-4-deluxe-vinyl.png",
    },
    {
        label: "Gallery",
        sub: "Behind The Scenes",
        href: "/gallery",
        vinyl: "/MORE-LIFE-VINYL-5-deluxe-vinyl.png",
    },
    {
        label: "Contact",
        sub: "Bookings & Inquiries",
        href: "/contact",
        vinyl: "/LC1-2-deluxe-vinyl.png",
    },
];

const COUNT = MENU_ITEMS.length;

/** Shortest signed distance from selected index to item index (wrap-around). */
function circularOffset(index: number, selected: number): number {
    const half = Math.floor(COUNT / 2);
    return ((index - selected + COUNT + half) % COUNT) - half;
}

export function DungeonMenu() {
    const router = useRouter();
    const reducedMotion = useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);

    const [selected, setSelected] = useState(0);
    const [viewport, setViewport] = useState({ w: 1280, h: 800 });

    /* ── Measure viewport for responsive carousel math ── */
    useEffect(() => {
        const measure = () =>
            setViewport({ w: window.innerWidth, h: window.innerHeight });
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    const isMobile = viewport.w < 768;
    const vinylSize = Math.round(
        Math.min(viewport.w * (isMobile ? 0.6 : 0.28), viewport.h * 0.38, 400)
    );
    const spacing = isMobile
        ? Math.round(viewport.w * 0.38)
        : Math.round(Math.min(Math.max(viewport.w * 0.16, 170), 260));

    /* ── Selection helpers ── */
    const select = useCallback((dir: 1 | -1) => {
        setSelected((s) => (s + dir + COUNT) % COUNT);
    }, []);

    const activate = useCallback(
        (index: number) => {
            router.push(MENU_ITEMS[index].href);
        },
        [router]
    );

    /* ── Prefetch every destination once ── */
    useEffect(() => {
        MENU_ITEMS.forEach((item) => router.prefetch(item.href));
    }, [router]);

    /* ── Keyboard: ← → browse, Enter select ── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
            if (e.key === "ArrowLeft" || e.key === "Left") {
                e.preventDefault();
                select(-1);
            } else if (e.key === "ArrowRight" || e.key === "Right") {
                e.preventDefault();
                select(1);
            } else if (e.key === "Enter") {
                e.preventDefault();
                activate(selected);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [select, activate, selected]);

    /* ── Wheel: horizontal or vertical scroll browses ── */
    const wheelLock = useRef(0);
    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const now = Date.now();
            if (now - wheelLock.current < 400) return;
            const delta =
                Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (Math.abs(delta) < 12) return;
            wheelLock.current = now;
            select(delta > 0 ? 1 : -1);
        };
        node.addEventListener("wheel", onWheel, { passive: false });
        return () => node.removeEventListener("wheel", onWheel);
    }, [select]);

    /* ── Touch swipe ── */
    const touchStart = useRef<number | null>(null);
    const onTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(dx) > 48) select(dx < 0 ? 1 : -1);
    };

    /* ── Mouse parallax on the room ── */
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
    const bgX = useTransform(springX, [0, 1], [14, -14]);
    const bgY = useTransform(springY, [0, 1], [10, -10]);

    const onMouseMove = (e: React.MouseEvent) => {
        if (reducedMotion || isMobile) return;
        mouseX.set(e.clientX / viewport.w);
        mouseY.set(e.clientY / viewport.h);
    };

    const current = MENU_ITEMS[selected];
    const counter = useMemo(
        () => `${String(selected + 1).padStart(2, "0")} / ${String(COUNT).padStart(2, "0")}`,
        [selected]
    );

    return (
        <section
            ref={sectionRef}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            aria-label="Loaf Records main menu"
            className="relative h-[100dvh] w-full overflow-hidden bg-noir-void select-none"
        >
            {/* ═══ THE ROOM ═══ */}
            <motion.div
                className="absolute -inset-6"
                style={reducedMotion || isMobile ? undefined : { x: bgX, y: bgY }}
            >
                <Image
                    src="/menu/dungeon-bg.jpg"
                    alt=""
                    fill
                    priority
                    quality={82}
                    sizes="110vw"
                    className="object-cover object-center scale-[1.04]"
                />
            </motion.div>

            {/* Lamp glow — flickers like the bulb in the room */}
            <div
                aria-hidden
                className="dungeon-lamp absolute left-1/2 top-0 h-[46vh] w-[60vw] -translate-x-1/2 pointer-events-none"
            />

            {/* Top scrim — dims the wall art behind the title, DVD-menu style */}
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[38vh] pointer-events-none"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
                }}
            />

            {/* Vignette + floor anchor */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 120% 90% at 50% 38%, transparent 40%, rgba(0,0,0,0.55) 100%)",
                }}
            />
            <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none"
                style={{
                    background:
                        "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)",
                }}
            />

            {/* ═══ TOP CHROME ═══ */}
            <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6 safe-top">
                <div className="flex items-baseline gap-3">
                    <span className="font-display text-2xl sm:text-3xl tracking-[0.08em] text-foreground leading-none">
                        LOAF RECORDS
                    </span>
                    <span className="hidden sm:block text-[10px] tracking-[0.35em] uppercase text-noir-cloud/80">
                        Brooklyn, NY
                    </span>
                </div>
                <Link
                    href="/vip"
                    className="text-[11px] tracking-[0.3em] uppercase text-noir-cloud hover:text-accent-cyan transition-colors border border-white/15 hover:border-accent-cyan/50 px-3.5 py-2 rounded-full backdrop-blur-sm bg-black/20"
                >
                    VIP
                </Link>
            </header>

            {/* ═══ TITLE ═══ */}
            <div className="absolute inset-x-0 top-[11vh] sm:top-[10vh] z-20 flex flex-col items-center px-6 text-center pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.label}
                        initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                        className="flex flex-col items-center"
                    >
                        <h1
                            className="font-display uppercase leading-[0.9] text-foreground"
                            style={{
                                fontSize: "clamp(2.8rem, 7vw, 6rem)",
                                textShadow:
                                    "0 4px 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.6)",
                            }}
                        >
                            {current.label}
                        </h1>
                        <p className="mt-2.5 text-[11px] sm:text-xs tracking-[0.42em] uppercase text-noir-cloud">
                            {current.sub}
                        </p>
                        <button
                            onClick={() => activate(selected)}
                            className="pointer-events-auto mt-5 flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-black/30 px-6 py-2.5 text-[11px] tracking-[0.35em] uppercase text-accent-cyan backdrop-blur-sm transition-colors hover:bg-accent-cyan hover:text-noir-void"
                        >
                            Enter
                            <CornerDownLeft className="h-3.5 w-3.5" />
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ═══ ROTATING VINYL CAROUSEL ═══ */}
            <div
                className="absolute inset-x-0 bottom-[13vh] sm:bottom-[11vh] z-20 flex items-end justify-center"
                style={{ perspective: 1400, height: vinylSize + 60 }}
                role="menu"
                aria-orientation="horizontal"
            >
                {MENU_ITEMS.map((item, i) => {
                    const offset = circularOffset(i, selected);
                    const abs = Math.abs(offset);
                    const isCenter = offset === 0;
                    const visible = abs <= (isMobile ? 1 : 2);

                    return (
                        <motion.button
                            key={item.href}
                            role="menuitem"
                            aria-label={`${item.label} — ${item.sub}`}
                            aria-current={isCenter ? "true" : undefined}
                            tabIndex={isCenter ? 0 : -1}
                            onClick={() =>
                                isCenter ? activate(i) : setSelected(i)
                            }
                            className={cn(
                                "absolute bottom-0 left-1/2 outline-none",
                                isCenter ? "cursor-pointer" : "cursor-e-resize"
                            )}
                            initial={false}
                            animate={{
                                x: offset * spacing - vinylSize / 2,
                                scale: isCenter ? 1 : 0.66 - (abs - 1) * 0.08,
                                rotateY: offset * -26,
                                z: -abs * 170,
                                opacity: visible
                                    ? isCenter
                                        ? 1
                                        : 0.75 - (abs - 1) * 0.18
                                    : 0,
                                filter: isCenter
                                    ? "blur(0px) brightness(1)"
                                    : `blur(${Math.min(abs, 2)}px) brightness(0.72)`,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 210,
                                damping: 26,
                                mass: 0.9,
                            }}
                            style={{
                                width: vinylSize,
                                height: vinylSize,
                                zIndex: 20 - abs,
                                pointerEvents: visible ? "auto" : "none",
                                transformStyle: "preserve-3d",
                            }}
                            whileHover={isCenter ? { scale: 1.04 } : undefined}
                            whileTap={{ scale: isCenter ? 0.97 : 0.6 }}
                        >
                            {/* Floor shadow */}
                            <span
                                aria-hidden
                                className="absolute left-1/2 -bottom-5 h-8 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-md"
                                style={{ opacity: isCenter ? 0.8 : 0.35 }}
                            />
                            {/* Spinning record */}
                            <span
                                className={cn(
                                    "block h-full w-full vinyl-rotor",
                                    isCenter && !reducedMotion
                                        ? "vinyl-rotor-on"
                                        : ""
                                )}
                            >
                                <Image
                                    src={item.vinyl}
                                    alt=""
                                    width={480}
                                    height={480}
                                    quality={80}
                                    priority={abs <= 1}
                                    sizes="(max-width: 768px) 62vw, 420px"
                                    className="h-full w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.8)]"
                                    draggable={false}
                                />
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* ═══ EDGE ARROWS ═══ */}
            <button
                aria-label="Previous"
                onClick={() => select(-1)}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 text-noir-cloud/70 hover:text-foreground transition-colors"
            >
                <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.25} />
            </button>
            <button
                aria-label="Next"
                onClick={() => select(1)}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 text-noir-cloud/70 hover:text-foreground transition-colors"
            >
                <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.25} />
            </button>

            {/* ═══ BOTTOM HUD ═══ */}
            <footer className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-5 pb-24 sm:px-8 sm:pb-6 safe-bottom pointer-events-none">
                <div className="hidden md:flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase text-noir-ash">
                    <span className="flex items-center gap-1.5">
                        <kbd className="dungeon-key">◄</kbd>
                        <kbd className="dungeon-key">►</kbd>
                        Browse
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="dungeon-key">↵</kbd>
                        Select
                    </span>
                </div>
                <span className="md:hidden text-[10px] tracking-[0.3em] uppercase text-noir-ash">
                    Swipe · Tap to enter
                </span>
                <span className="font-display text-sm tracking-[0.25em] text-noir-cloud tabular-nums">
                    {counter}
                </span>
            </footer>
        </section>
    );
}
