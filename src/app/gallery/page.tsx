"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
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
            {/* The header: the crew drawing in their blackbooks down in the basement */}
            <header className="px-4 sm:px-6 mb-8 lg:mb-10">
                <div className="max-w-6xl mx-auto">
                    <h1 className="sr-only">Blackbook</h1>
                    <div className="relative aspect-[1983/793] overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#141714] bg-white shadow-[0_20px_60px_rgba(20,23,20,0.12)]">
                        <Image
                            src="/brand/blackbook-header.webp"
                            alt="Four kids in caps and a hoodie drawing in blackbooks around a table in a Brooklyn basement, under a dripping BLACKBOOK piece and a Loaf Records tag"
                            fill
                            priority
                            fetchPriority="high"
                            sizes="(max-width: 1200px) 100vw, 1152px"
                            placeholder="blur"
                            blurDataURL="data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADQAQCdASoMAAUABABoJZQCdAEPNHrPAAD+zbqGIJqgbVxzVRJ4L99IxYMQQggXFvAAAA=="
                            className="object-cover"
                        />
                    </div>
                    <p className="mt-3 text-center text-sm text-noir-cloud">
                        Walls, trucks, blackbooks — and the crew behind them.
                    </p>
                </div>
            </header>

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
