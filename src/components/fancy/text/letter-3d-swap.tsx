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
    const [isFlipped, setIsFlipped] = useState(false);

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
                return Math.random() * staggerDuration * total;
            case "first":
            default:
                return index * staggerDuration;
        }
    };

    // Trigger animation when in view
    useEffect(() => {
        if (isInView) {
            setIsFlipped(true);
        }
    }, [isInView]);

    // Loop animation
    useEffect(() => {
        if (!loop || !isInView) return;

        const interval = setInterval(() => {
            setIsFlipped((prev) => !prev);
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
