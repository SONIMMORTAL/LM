"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface LetterState {
    char: string;
    isMatrix: boolean;
    isSpace: boolean;
}

interface MatrixTextProps {
    text?: string;
    className?: string;
    initialDelay?: number;
    letterAnimationDuration?: number;
    letterInterval?: number;
    textClassName?: string;
}

const MatrixText = ({
    text = "LOAF RECORDS",
    className,
    initialDelay = 200,
    letterAnimationDuration = 500,
    letterInterval = 100,
    textClassName = "text-4xl md:text-6xl lg:text-7xl",
}: MatrixTextProps) => {
    const [letters, setLetters] = useState<LetterState[]>(() =>
        text.split("").map((char) => ({
            char,
            isMatrix: false,
            isSpace: char === " ",
        }))
    );
    const [isAnimating, setIsAnimating] = useState(false);

    const getRandomChar = useCallback(
        () => (Math.random() > 0.5 ? "1" : "0"),
        []
    );

    const animateLetter = useCallback(
        (index: number) => {
            if (index >= text.length) return;

            requestAnimationFrame(() => {
                setLetters((prev) => {
                    const newLetters = [...prev];
                    if (!newLetters[index].isSpace) {
                        newLetters[index] = {
                            ...newLetters[index],
                            char: getRandomChar(),
                            isMatrix: true,
                        };
                    }
                    return newLetters;
                });

                setTimeout(() => {
                    setLetters((prev) => {
                        const newLetters = [...prev];
                        newLetters[index] = {
                            ...newLetters[index],
                            char: text[index],
                            isMatrix: false,
                        };
                        return newLetters;
                    });
                }, letterAnimationDuration);
            });
        },
        [getRandomChar, text, letterAnimationDuration]
    );

    const startAnimation = useCallback(() => {
        if (isAnimating) return;

        setIsAnimating(true);
        let currentIndex = 0;

        const animate = () => {
            if (currentIndex >= text.length) {
                setIsAnimating(false);
                return;
            }

            animateLetter(currentIndex);
            currentIndex++;
            setTimeout(animate, letterInterval);
        };

        animate();
    }, [animateLetter, text, isAnimating, letterInterval]);

    useEffect(() => {
        const timer = setTimeout(startAnimation, initialDelay);
        return () => clearTimeout(timer);
    }, []);

    const motionVariants = useMemo(
        () => ({
            initial: {
                color: "#00FFFF", // accent-cyan
            },
            matrix: {
                color: "#00ff00",
                textShadow: "0 2px 8px rgba(0, 255, 0, 0.6)",
            },
            normal: {
                color: "#00FFFF", // accent-cyan
                textShadow: "0 2px 8px rgba(0, 255, 255, 0.3)",
            },
        }),
        []
    );

    return (
        <div
            aria-label={text}
            className={cn("flex items-center justify-center", className)}
        >
            <div className="flex flex-wrap items-center justify-center">
                {letters.map((letter, index) => (
                    <motion.span
                        animate={letter.isMatrix ? "matrix" : "normal"}
                        className={cn(
                            "w-[1ch] overflow-hidden text-center font-bold uppercase tracking-tight",
                            textClassName
                        )}
                        initial="initial"
                        key={`${index}-${letter.char}`}
                        style={{
                            display: "inline-block",
                            fontVariantNumeric: "tabular-nums",
                        }}
                        transition={{
                            duration: 0.1,
                            ease: "easeInOut",
                        }}
                        variants={motionVariants}
                    >
                        {letter.isSpace ? "\u00A0" : letter.char}
                    </motion.span>
                ))}
            </div>
        </div>
    );
};

export default MatrixText;
