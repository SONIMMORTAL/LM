"use client";

import { motion, useReducedMotion } from "framer-motion";

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    /** Render as something other than an h1. Use this when the text is not the page's main heading. */
    as?: "h1" | "h2" | "p" | "span";
}

const STAGGER_PER_LETTER = 0.04;

/**
 * Staggered letter reveal for headings.
 *
 * Deliberately avoids two things that previously left the shop hero stuck at
 * opacity 0 and unreadable:
 *   1. `whileInView` — the observer never reported the element, so the reveal
 *      never started. A main heading must not depend on scroll detection.
 *   2. parent-to-child variant propagation with `staggerChildren` — propagation
 *      froze partway through, leaving most letters transparent.
 *
 * Each letter now animates itself on mount with its own explicit delay, and the
 * wrapper element never animates its own opacity. If an individual letter's
 * animation fails the heading is still readable.
 */
export function TextReveal({ text, className = "", delay = 0, as = "h1" }: TextRevealProps) {
    const prefersReducedMotion = useReducedMotion();

    // Precompute each word's starting letter index so the stagger continues
    // across spaces without mutating a counter during render.
    const words = text.split(" ");
    const wordOffsets: number[] = [];
    words.reduce((runningTotal, word) => {
        wordOffsets.push(runningTotal);
        return runningTotal + word.length;
    }, 0);

    const Tag = as;

    return (
        <Tag
            // pb keeps descenders (the p in "Drop") clear of overflow-hidden,
            // which masks the letters sliding up from below.
            className={`flex flex-wrap overflow-hidden pb-[0.12em] ${className}`}
        >
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="mr-[0.25em] whitespace-nowrap">
                    {word.split("").map((letter, letterIndex) => {
                        const index = wordOffsets[wordIndex] + letterIndex;
                        return (
                            <motion.span
                                key={letterIndex}
                                className="inline-block"
                                initial={
                                    prefersReducedMotion
                                        ? false
                                        : { opacity: 0, y: 20 }
                                }
                                animate={{ opacity: 1, y: 0 }}
                                transition={
                                    prefersReducedMotion
                                        ? { duration: 0 }
                                        : {
                                              type: "spring",
                                              damping: 12,
                                              stiffness: 100,
                                              delay: delay + index * STAGGER_PER_LETTER,
                                          }
                                }
                            >
                                {letter}
                            </motion.span>
                        );
                    })}
                </span>
            ))}
        </Tag>
    );
}
