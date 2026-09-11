"use client";

import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { marker, pad2 } from "./materials";
import type { GalleryPrint } from "./prints";

interface GalleryLightboxProps {
    prints: GalleryPrint[];
    index: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

/**
 * A print pulled off the wall (or out of the book) and held up to the light.
 * Swipe or arrow keys to move through the archive, Escape or a tap outside to
 * put it back.
 */
export function GalleryLightbox({ prints, index, onClose, onNavigate }: GalleryLightboxProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    // a swipe that lets go over the backdrop still fires a click there
    const lastDragEnd = useRef(0);
    const count = prints.length;
    const print = prints[index];

    const step = useCallback(
        (delta: number) => onNavigate((index + delta + count) % count),
        [index, count, onNavigate]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowLeft") step(-1);
            else if (e.key === "ArrowRight") step(1);
            else if (e.key === "Tab") {
                // keep focus inside the viewer
                const focusable = Array.from(
                    dialogRef.current?.querySelectorAll<HTMLElement>("button") ?? []
                ).filter((el) => el.offsetParent !== null);
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, step]);

    // Once for the life of the viewer: hold the page still, take focus, and
    // hand it back to whatever opened us.
    useEffect(() => {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            opener?.focus({ preventScroll: true });
        };
    }, []);

    if (!print) return null;

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        lastDragEnd.current = Date.now();
        if (info.offset.x < -70 || info.velocity.x < -500) step(1);
        else if (info.offset.x > 70 || info.velocity.x > 500) step(-1);
    };

    const handleBackdrop = () => {
        if (Date.now() - lastDragEnd.current > 300) onClose();
    };

    const press = (action: () => void) => (e: ReactMouseEvent) => {
        e.stopPropagation();
        action();
    };

    const control =
        "place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan";

    return (
        <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdrop}
            className="fixed inset-0 z-[200] flex flex-col bg-black/90 backdrop-blur-xl"
        >
            <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
                <p aria-live="polite" className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
                    <span className="text-[#e0443e]">#{pad2(index + 1)}</span>
                    <span className="mx-2 text-white/20">/</span>
                    {pad2(count)}
                </p>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={press(onClose)}
                    aria-label="Close photo viewer"
                    className={cn("grid h-11 w-11", control)}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-4 sm:px-20">
                <motion.figure
                    key={print.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.55}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 0.96, rotate: -1.2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    onClick={(e) => e.stopPropagation()}
                    className="m-0 flex max-h-full cursor-grab flex-col items-center active:cursor-grabbing"
                >
                    <div className="bg-[#ebe5d8] p-1.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,1)] sm:p-2.5">
                        <Image
                            src={print.src}
                            alt={print.alt}
                            width={print.width}
                            height={print.height}
                            sizes="(max-width: 640px) 94vw, 80vw"
                            quality={85}
                            placeholder="blur"
                            blurDataURL={print.blur}
                            draggable={false}
                            className="block h-auto max-h-[calc(100svh-15rem)] w-auto max-w-[calc(100vw-2.25rem)] select-none sm:max-w-[calc(100vw-12rem)]"
                        />
                    </div>
                    <figcaption className="mt-4 max-w-xl px-2 text-center">
                        <p className={cn(marker.className, "text-xl text-white sm:text-2xl")}>{print.caption}</p>
                        <p className="mt-1 text-xs text-white/55 sm:text-sm">{print.alt}</p>
                    </figcaption>
                </motion.figure>

                <button
                    type="button"
                    onClick={press(() => step(-1))}
                    aria-label="Previous photo"
                    className={cn("absolute left-5 top-1/2 -mt-6 hidden h-12 w-12 sm:grid", control)}
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    type="button"
                    onClick={press(() => step(1))}
                    aria-label="Next photo"
                    className={cn("absolute right-5 top-1/2 -mt-6 hidden h-12 w-12 sm:grid", control)}
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* on a phone the arrows sit where a thumb reaches */}
            <div className="flex items-center justify-center gap-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:hidden">
                <button
                    type="button"
                    onClick={press(() => step(-1))}
                    aria-label="Previous photo"
                    className={cn("grid h-12 w-12", control)}
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <span aria-hidden className={cn(marker.className, "text-sm text-white/35")}>
                    swipe
                </span>
                <button
                    type="button"
                    onClick={press(() => step(1))}
                    aria-label="Next photo"
                    className={cn("grid h-12 w-12", control)}
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>
        </motion.div>
    );
}
