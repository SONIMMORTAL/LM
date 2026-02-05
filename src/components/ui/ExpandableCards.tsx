"use client";

import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ease-out-quint for entering/exiting elements
const EASE_OUT_QUINT = [0.23, 1, 0.32, 1] as const;

export interface Card {
    id: number;
    title: string;
    image: string;
    content: string;
    price: string;
    actionUrl?: string;
}

export interface ExpandableCardsProps {
    cards: Card[];
    selectedCard?: number | null;
    onSelect?: (id: number | null) => void;
    className?: string;
    cardClassName?: string;
}

export default function ExpandableCards({
    cards,
    selectedCard: controlledSelected,
    onSelect,
    className = "",
    cardClassName = "",
}: ExpandableCardsProps) {
    const [internalSelected, setInternalSelected] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const shouldReduceMotion = useReducedMotion();

    const selectedCard =
        controlledSelected !== undefined ? controlledSelected : internalSelected;

    // Detect mobile for responsive sizing
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollWidth = scrollRef.current.scrollWidth;
            const clientWidth = scrollRef.current.clientWidth;
            scrollRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
    }, []);

    const handleCardClick = (id: number) => {
        if (selectedCard === id) {
            if (onSelect) {
                onSelect(null);
            } else {
                setInternalSelected(null);
            }
        } else {
            if (onSelect) {
                onSelect(id);
            } else {
                setInternalSelected(id);
            }
            // Center the clicked card in view
            setTimeout(() => {
                const cardElement = document.querySelector(`[data-card-id="${id}"]`);
                if (cardElement) {
                    cardElement.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                    });
                }
            }, 100);
        }
    };

    // Responsive card dimensions
    const cardWidth = isMobile ? 200 : 280;
    const expandedWidth = isMobile ? 320 : 500;
    const expandedPanelWidth = isMobile ? 120 : 220;
    const cardHeight = isMobile ? 300 : 400;

    return (
        <div
            className={`flex w-full flex-col gap-4 overflow-hidden p-2 sm:p-4 ${className}`}
        >
            <div
                className="scrollbar-hide mx-auto flex w-full overflow-x-auto pt-2 pb-6 sm:pt-4 sm:pb-8 items-center px-2 sm:px-4"
                ref={scrollRef}
                style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
                }}
            >
                {cards.map((card) => (
                    <motion.div
                        animate={{
                            width: selectedCard === card.id ? expandedWidth : cardWidth,
                            flexShrink: 0
                        }}
                        initial={{ width: cardWidth }}
                        aria-label={`${card.title} card${selectedCard === card.id ? ", expanded" : ""}`}
                        aria-selected={selectedCard === card.id}
                        className={`
                            relative mr-3 sm:mr-6 cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl 
                            border-2 border-transparent active:border-accent-cyan/50
                            bg-noir-slate shadow-xl transition-colors
                            ${selectedCard === card.id ? 'border-accent-cyan/50 ring-1 ring-accent-cyan/20' : ''}
                            ${cardClassName}
                        `}
                        style={{ height: cardHeight }}
                        data-card-id={card.id}
                        key={card.id}
                        layout
                        onClick={() => handleCardClick(card.id)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleCardClick(card.id);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        transition={
                            shouldReduceMotion
                                ? { duration: 0 }
                                : {
                                    duration: 0.3,
                                    ease: EASE_OUT_QUINT,
                                }
                        }
                    >
                        <div className="relative h-full" style={{ width: cardWidth }}>
                            <Image
                                src={card.image || "/placeholder.svg"}
                                alt={card.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 200px, 300px"
                                priority={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-noir-void via-noir-void/40 to-transparent" />

                            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                                <div className={`transition-opacity duration-200 ${selectedCard === card.id ? 'opacity-0' : 'opacity-100'}`}>
                                    <h2 className="font-bold text-lg sm:text-2xl uppercase tracking-tight leading-none mb-1 sm:mb-2 line-clamp-2">
                                        {card.title}
                                    </h2>
                                    <p className="text-accent-cyan font-bold text-sm sm:text-base">{card.price}</p>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {selectedCard === card.id && (
                                <motion.div
                                    className="absolute top-0 right-0 h-full bg-noir-void/95 backdrop-blur-xl border-l border-white/10"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{
                                        width: expandedPanelWidth,
                                        opacity: 1
                                    }}
                                    exit={{
                                        width: 0,
                                        opacity: 0
                                    }}
                                    transition={{
                                        duration: 0.25,
                                        ease: EASE_OUT_QUINT
                                    }}
                                >
                                    <motion.div
                                        className="flex h-full flex-col justify-between p-4 sm:p-6"
                                        style={{ width: expandedPanelWidth }}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: 0.05, duration: 0.15 }}
                                    >
                                        <div>
                                            <h2 className="font-bold text-base sm:text-xl uppercase tracking-tight leading-tight mb-1 sm:mb-2 text-white line-clamp-3">
                                                {card.title}
                                            </h2>
                                            <p className="text-accent-cyan font-bold text-sm sm:text-lg mb-2 sm:mb-4">{card.price}</p>
                                            {!isMobile && (
                                                <p className="text-noir-cloud text-sm line-clamp-3 leading-relaxed">
                                                    Official Merch. Limited edition.
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-2 sm:mt-4">
                                            <Link
                                                href={card.actionUrl || "#"}
                                                className="flex items-center justify-center gap-1 sm:gap-2 w-full py-2 sm:py-3 bg-accent-cyan text-noir-void font-bold rounded-lg sm:rounded-xl hover:bg-white active:scale-95 transition-all text-xs sm:text-sm uppercase tracking-wider"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                                                View
                                            </Link>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
