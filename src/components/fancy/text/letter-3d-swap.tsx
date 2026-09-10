"use client";

import { motion, Transition, useInView } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";

interface Letter3DSwapProps {
    children: string;
    mainClassName?: string;
    frontFaceClassName?: string;
    secondFaceClassName?: string;
    rotateDirection?: "top" | "bottom";
    staggerDuration?: number;
    staggerFrom?: "first" | "last" | "center" | "random";
    transition?: Transition;
    loop?: boolean;
    loopDelay?: number;
}

/**
 * A stable 0..1 scatter for a given letter position.
 *
 * The "random" stagger used to call Math.random() while rendering, so the same
 * word animated differently on every re-render and the server and client
 * disagreed. Hashing the index looks just as scattered, stays put, and is pure.
 */
function scatterFor(index: number) {
    const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
}

export default function Letter3DSwap({
    children,
    mainClassName = "",
    frontFaceClassName = "",
    secondFaceClassName = "",
    rotateDirection = "top",
    staggerDuration = 0.03,
    staggerFrom = "first",
    transition = { type: "spring", damping: 25, stiffness: 160 },
    loop = true,
    loopDelay = 3000,
}: Letter3DSwapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.5 });
    /*
     * Only the interval owns state now. Whether a letter is flipped is derived
     * from "are we in view" plus "how many times has the loop ticked", so
     * entering view flips immediately without an effect writing state during
     * render.
     */
    const [flipCount, setFlipCount] = useState(0);
    const isFlipped = isInView && flipCount % 2 === 0;

    const letters = useMemo(() => children.split(""), [children]);

    // Calculate stagger delays
    const getDelay = (index: number) => {
        const total = letters.length;
        switch (staggerFrom) {
            case "last":
                return (total - 1 - index) * staggerDuration;
            case "center":
                const center = (total - 1) / 2;
                return Math.abs(index - center) * staggerDuration;
            case "random":
                return scatterFor(index) * staggerDuration * total;
            case "first":
            default:
                return index * staggerDuration;
        }
    };

    // Loop animation — setState lives in the interval callback, which is what
    // an effect is actually for.
    useEffect(() => {
        if (!loop || !isInView) return;

        const interval = setInterval(() => {
            setFlipCount((count) => count + 1);
        }, loopDelay);

        return () => clearInterval(interval);
    }, [loop, loopDelay, isInView]);

    const rotateX = rotateDirection === "top" ? -90 : 90;

    return (
        <div
            ref={containerRef}
            className={`inline-flex flex-wrap justify-center ${mainClassName}`}
            style={{ perspective: "1000px" }}
        >
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    className="relative inline-block"
                    style={{
                        transformStyle: "preserve-3d",
                    }}
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: isFlipped ? rotateX : 0 }}
                    transition={{
                        ...transition,
                        delay: getDelay(index),
                    }}
                >
                    {/* Front face */}
                    <span
                        className={`inline-block ${frontFaceClassName}`}
                        style={{
                            backfaceVisibility: "hidden",
                        }}
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </span>

                    {/* Back face (rotated 90 degrees) */}
                    <span
                        className={`absolute inset-0 inline-block ${secondFaceClassName}`}
                        style={{
                            backfaceVisibility: "hidden",
                            transform: `rotateX(${-rotateX}deg)`,
                            transformOrigin: rotateDirection === "top" ? "bottom" : "top",
                        }}
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </span>
                </motion.span>
            ))}
        </div>
    );
}
