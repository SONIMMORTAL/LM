"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Gallery data with real images
const galleryItems = [
    {
        id: "1",
        type: "image" as const,
        src: "/gallery-rooftop.png",
        alt: "Brooklyn rooftop session",
        size: "large",
    },
    {
        id: "2",
        type: "image" as const,
        src: "/gallery-studio.png",
        alt: "Studio recording session",
        size: "small",
    },
    {
        id: "3",
        type: "image" as const,
        src: "/gallery-concert.png",
        alt: "Live performance",
        size: "small",
    },
    {
        id: "4",
        type: "image" as const,
        src: "/SHDW.avif",
        alt: "Shadow The Great",
        size: "medium",
    },
    {
        id: "5",
        type: "image" as const,
        src: "/gallery-street.png",
        alt: "Brooklyn streets",
        size: "small",
    },
    {
        id: "6",
        type: "image" as const,
        src: "/gallery-vinyl.png",
        alt: "Vinyl collection",
        size: "medium",
    },
    {
        id: "7",
        type: "image" as const,
        src: "/MORE LIFE VINYL.jpg",
        alt: "More Life album",
        size: "small",
    },
    {
        id: "8",
        type: "video" as const,
        src: null,
        youtubeId: "41Zx0etfnkM",
        alt: "Jeeps music video",
        size: "large",
    },
];

function BentoItem({
    item,
    index,
    onClick
}: {
    item: typeof galleryItems[0];
    index: number;
    onClick: () => void;
}) {
    const [isPlaying, setIsPlaying] = useState(false);

    const sizeClasses = {
        small: "col-span-1 row-span-1",
        medium: "col-span-1 md:col-span-1 row-span-1 md:row-span-2",
        large: "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer overflow-hidden rounded-2xl",
                "bg-gradient-to-br from-noir-charcoal to-noir-slate",
                sizeClasses[item.size as keyof typeof sizeClasses]
            )}
        >
            {/* Image/Video Content */}
            {item.src ? (
                <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />
            ) : item.type === "video" ? (
                <div className="absolute inset-0 bg-noir-charcoal flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={`https://img.youtube.com/vi/${(item as any).youtubeId}/maxresdefault.jpg`}
                            alt={item.alt}
                            fill
                            className="object-cover opacity-70"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-noir-smoke/30 flex items-center justify-center">
                        <span className="text-2xl font-bold text-noir-ash/30">
                            {item.id}
                        </span>
                    </div>
                </div>
            )}

            {/* Aspect ratio spacer */}
            <div className="aspect-square md:aspect-auto md:h-full" />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-noir-void/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-foreground font-medium text-sm">
                    {item.alt}
                </p>
                <span className="text-accent-cyan text-xs uppercase tracking-wider mt-1">
                    {item.type}
                </span>
            </div>

            {/* Video play button */}
            {item.type === "video" && (
                <motion.div
                    initial={false}
                    animate={{ scale: isPlaying ? 0.9 : 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-16 h-16 rounded-full bg-accent-cyan/90 flex items-center justify-center shadow-glow-md group-hover:scale-110 transition-transform">
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-noir-void" />
                        ) : (
                            <Play className="w-6 h-6 text-noir-void ml-1" />
                        )}
                    </div>
                </motion.div>
            )}

            {/* Glow effect on hover */}
            <div className="absolute inset-0 border-2 border-accent-cyan/0 group-hover:border-accent-cyan/30 rounded-2xl transition-colors duration-300" />
        </motion.div>
    );
}

function Lightbox({
    items,
    currentIndex,
    onClose,
    onPrev,
    onNext
}: {
    items: typeof galleryItems;
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const currentItem = items[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-noir-void/95 backdrop-blur-xl flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-noir-cloud hover:text-foreground transition-colors z-10"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 p-3 rounded-full bg-noir-charcoal/80 text-foreground hover:bg-noir-slate transition-colors"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 p-3 rounded-full bg-noir-charcoal/80 text-foreground hover:bg-noir-slate transition-colors"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Content */}
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[80vh] w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {currentItem.type === "video" && (currentItem as any).youtubeId ? (
                    <div className="aspect-video bg-noir-charcoal rounded-2xl overflow-hidden">
                        <iframe
                            src={`https://www.youtube.com/embed/${(currentItem as any).youtubeId}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={currentItem.alt}
                        />
                    </div>
                ) : currentItem.src ? (
                    <div className="relative aspect-square md:aspect-video bg-noir-charcoal rounded-2xl overflow-hidden">
                        <Image
                            src={currentItem.src}
                            alt={currentItem.alt}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1024px) 100vw, 80vw"
                        />
                    </div>
                ) : (
                    <div className="aspect-video bg-noir-charcoal rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-6xl font-bold text-noir-ash/30 block mb-2">
                                {currentItem.id}
                            </span>
                            <p className="text-foreground font-medium">{currentItem.alt}</p>
                            <span className="text-accent-cyan text-sm uppercase tracking-wider">
                                {currentItem.type}
                            </span>
                        </div>
                    </div>
                )}

                {/* Caption */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-noir-charcoal/80 rounded-full">
                    <span className="text-foreground text-sm">
                        {currentItem.alt} • {currentIndex + 1} / {items.length}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function GalleryPage() {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const goToPrev = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex(lightboxIndex === 0 ? galleryItems.length - 1 : lightboxIndex - 1);
        }
    };

    const goToNext = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex(lightboxIndex === galleryItems.length - 1 ? 0 : lightboxIndex + 1);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Hero Section */}
            <section className="px-6 mb-12">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block mb-4 text-accent-cyan text-sm tracking-[0.3em] uppercase">
                            Visual Archive
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase mb-4">
                            The Gallery
                        </h1>
                        <p className="text-noir-cloud max-w-lg mx-auto">
                            Behind the scenes. On stage. In the streets.
                            A visual journey through Brooklyn noir.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid */}
            <section className="px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
                        {galleryItems.map((item, index) => (
                            <BentoItem
                                key={item.id}
                                item={item}
                                index={index}
                                onClick={() => openLightbox(index)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    items={galleryItems}
                    currentIndex={lightboxIndex}
                    onClose={closeLightbox}
                    onPrev={goToPrev}
                    onNext={goToNext}
                />
            )}
        </div>
    );
}
