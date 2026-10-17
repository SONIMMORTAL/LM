"use client";

import { useId, useSyncExternalStore } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * The Loaf Records mark: the label on its record, sat on a gold deck with the
 * tonearm down. One component for the desktop header, the desktop home and the
 * mobile landing, so the logo is the same thing everywhere.
 *
 * It's CSS and an inline SVG around one small image of the record, so it stays
 * crisp at any size. The record turns at 33⅓ while music is playing on the site
 * and rests upright when it isn't; the turn is a transform animation, so it runs
 * on the compositor, and it's skipped entirely for reduced motion.
 */

// Brushed gold plinth, lit from the top left
const GOLD =
    "linear-gradient(145deg, #f4dfaa 0%, #d1ad6a 24%, #a07a3c 52%, #dcbd7f 76%, #8d6830 100%)";
const BRUSHED =
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 3px)";
const BEVEL =
    "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 3px rgba(0,0,0,0.35), 0 6px 14px rgba(0,0,0,0.6)";
// Silver platter rim with strobe dots
const STROBE = "repeating-conic-gradient(#dadada 0 3deg, #7c7c7c 3deg 6deg)";
// Gloss on the vinyl — it stays put while the record turns under it, like real light would
const SHEEN =
    "conic-gradient(from 200deg, transparent 0deg, rgba(255,255,255,0.22) 16deg, transparent 38deg, transparent 180deg, rgba(255,255,255,0.12) 196deg, transparent 218deg), radial-gradient(circle, transparent 60%, rgba(0,0,0,0.4) 100%)";

// Media events don't bubble, but they do pass through a capturing listener on the document
const MEDIA_EVENTS = ["play", "playing", "pause", "ended", "emptied"] as const;

function subscribeToMedia(onChange: () => void) {
    MEDIA_EVENTS.forEach((type) => document.addEventListener(type, onChange, true));
    return () => MEDIA_EVENTS.forEach((type) => document.removeEventListener(type, onChange, true));
}

const isMusicPlaying = () =>
    Array.from(document.querySelectorAll("audio")).some((a) => !a.paused && !a.ended);

interface LoafDeckProps {
    /** Edge length in px. */
    size?: number;
    /** Accessible name when the mark stands alone; leave out when a labelled link wraps it. */
    label?: string;
    priority?: boolean;
    className?: string;
}

export function LoafDeck({ size = 48, label, priority, className }: LoafDeckProps) {
    const playing = useSyncExternalStore(subscribeToMedia, isMusicPlaying, () => false);
    // Several decks can share a page, so each gets its own gradient id
    const armGradient = `loaf-deck-arm-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

    return (
        <span
            {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
            className={cn("group/deck relative inline-block shrink-0 [perspective:320px]", className)}
            style={{ width: size, height: size }}
        >
            <span
                className="absolute inset-0 rounded-[22%] transition-transform duration-500 ease-out group-hover/deck:[transform:rotateX(16deg)_rotateY(-12deg)]"
                style={{ background: GOLD, boxShadow: BEVEL }}
            >
                <span className="absolute inset-0 rounded-[inherit] opacity-50" style={{ backgroundImage: BRUSHED }} />

                {/* Platter */}
                <span
                    className="absolute left-[6%] top-[11%] h-[78%] w-[78%] rounded-full"
                    style={{ background: STROBE, boxShadow: "0 2px 4px rgba(0,0,0,0.55)" }}
                >
                    <span className="absolute inset-[5%] overflow-hidden rounded-full bg-black shadow-[0_0_0_1px_rgba(0,0,0,0.9)]">
                        <span className={cn("absolute inset-0", playing && "motion-safe:animate-[spin_1.8s_linear_infinite]")}>
                            <Image
                                src="/brand/loaf-record.jpg"
                                alt=""
                                fill
                                priority={priority}
                                sizes={`${Math.ceil(size * 0.72)}px`}
                                className="scale-[1.04] object-cover"
                            />
                        </span>
                        <span className="absolute inset-0 rounded-full" style={{ background: SHEEN }} />
                    </span>
                    {/* Spindle */}
                    <span className="absolute left-1/2 top-1/2 h-[7%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dedede] shadow-[0_0_0_1px_rgba(0,0,0,0.6)]" />
                </span>

                {/* Pitch fader slot */}
                <span className="absolute right-[5%] top-[58%] h-[28%] w-[4%] rounded-full bg-black/70 shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)]" />

                {/* Tonearm, resting on the record */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
                    <defs>
                        <linearGradient id={armGradient} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#fbedc4" />
                            <stop offset="1" stopColor="#b48a45" />
                        </linearGradient>
                    </defs>
                    {/* shadow it casts on the deck */}
                    <path d="M89 18 L85 57 L71 69" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" transform="translate(1.6 2.2)" />
                    <path d="M89 18 L85 57 L71 69" fill="none" stroke="#2a1f0e" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M89 18 L85 57 L71 69" fill="none" stroke={`url(#${armGradient})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    {/* headshell */}
                    <path d="M72 68 L66 73" stroke="#2a1f0e" strokeWidth="6" strokeLinecap="round" />
                    <path d="M72 68 L66 73" stroke={`url(#${armGradient})`} strokeWidth="3.6" strokeLinecap="round" />
                    {/* pivot + counterweight */}
                    <circle cx="89" cy="17" r="7.5" fill="#6e5226" />
                    <circle cx="89" cy="17" r="5" fill={`url(#${armGradient})`} />
                    <circle cx="89" cy="17" r="2" fill="#2a1f0e" />
                </svg>
            </span>
        </span>
    );
}
