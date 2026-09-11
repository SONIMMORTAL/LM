"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Blackbook } from "@/components/gallery/Blackbook";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import { PasteUpWall } from "@/components/gallery/PasteUpWall";
import { galleryPrints } from "@/components/gallery/prints";

export default function GalleryPage() {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    return (
        <div className="min-h-screen pt-24 pb-28 lg:pb-16">
            {/* Hero Section */}
            <section className="px-6 mb-8 lg:mb-10">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <span className="inline-block mb-4 text-accent-cyan text-sm tracking-[0.3em] uppercase">
                            Visual Archive
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase mb-4">
                            The Gallery
                        </h1>
                        <p className="text-noir-cloud max-w-lg mx-auto">
                            Walls, trucks, blackbooks — and the crew behind them.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Big screens: the prints go up on a wall */}
            <section aria-label="The wall" className="hidden px-6 lg:block">
                <div className="max-w-6xl mx-auto">
                    <PasteUpWall prints={galleryPrints} onOpen={openLightbox} />
                </div>
            </section>

            {/* Phones and tablets: the same prints, taped into a blackbook */}
            <section aria-label="The blackbook" className="px-4 lg:hidden">
                <Blackbook prints={galleryPrints} onOpen={openLightbox} />
            </section>

            <AnimatePresence>
                {lightboxIndex !== null && (
                    <GalleryLightbox
                        key="lightbox"
                        prints={galleryPrints}
                        index={lightboxIndex}
                        onClose={closeLightbox}
                        onNavigate={setLightboxIndex}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
