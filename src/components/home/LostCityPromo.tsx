"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play, ShoppingCart, Headphones } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function LostCityPromo() {
    const [isHovered, setIsHovered] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const { addToCart, setIsCartOpen } = useCart();

    const handleBuyAlbum = () => {
        addToCart({
            productId: 9999,
            variantId: 1,
            name: "Lost City",
            variantName: "Digital Album",
            price: 9.99,
            currency: "USD",
            quantity: 1,
            thumbnail: "/LC1.jpg",
        });
        setIsCartOpen(true);
    };

    return (
        <section
            className="py-20 md:py-32 px-4 sm:px-6 relative overflow-hidden"
            style={{
                background: "linear-gradient(to bottom, #050505, #1A1A1A 40%, #1A1A1A 60%, #050505)",
            }}
        >
            {/* Ambient glow — CSS gradient, no blur divs */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 50% 40% at 30% 40%, rgba(0,217,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 70% 60%, rgba(30,80,220,0.05) 0%, transparent 70%)",
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header — editorial, not generic */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14 md:mb-20"
                >
                    <span className="inline-block mb-4 text-accent-cyan text-xs tracking-[0.35em] uppercase font-medium">
                        Out Now
                    </span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] uppercase">
                        Lost City
                    </h2>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Left Side — Interactive Vinyl */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative flex justify-center lg:justify-end"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px]">
                            {/* Album Sleeve */}
                            <motion.div
                                className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl z-20"
                                animate={{
                                    x: isHovered ? -40 : 0,
                                    rotateY: isHovered ? -5 : 0
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <Image
                                    src="/LC1.jpg"
                                    alt="Lost City Album Cover"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent" />
                            </motion.div>

                            {/* Spinning Vinyl — initial offset on mobile to hint at interactivity */}
                            <motion.div
                                className="absolute inset-0 z-10 rounded-full overflow-hidden bg-neutral-900"
                                style={{
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                                }}
                                initial={{ x: 15 }}
                                animate={{
                                    x: isHovered ? 60 : 15,
                                    rotate: isHovered ? 360 : 0
                                }}
                                transition={{
                                    x: { type: "spring", stiffness: 200, damping: 20 },
                                    rotate: { duration: 3, repeat: isHovered ? Infinity : 0, ease: "linear" }
                                }}
                            >
                                {/* CSS Vinyl Grooves */}
                                <div
                                    className="absolute inset-0 rounded-full opacity-80"
                                    style={{
                                        background: 'repeating-radial-gradient(#111 0, #111 2px, #222 3px, #222 4px)'
                                    }}
                                />
                                {/* Vinyl Shine */}
                                <div
                                    className="absolute inset-0 rounded-full opacity-40"
                                    style={{
                                        background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.1) 30deg, transparent 60deg, transparent 120deg, rgba(255,255,255,0.1) 150deg, transparent 180deg)'
                                    }}
                                />

                                {/* Center Label */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full overflow-hidden border-4 border-neutral-900 shadow-2xl">
                                    <Image
                                        src="/LC1.jpg"
                                        alt="Lost City"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </motion.div>

                            {/* Glow */}
                            <motion.div
                                className="absolute inset-0 rounded-full -z-10"
                                style={{
                                    background: "radial-gradient(circle, rgba(0,217,255,0.15) 0%, transparent 70%)"
                                }}
                                animate={{
                                    opacity: isHovered ? 0.8 : 0.3,
                                    scale: isHovered ? 1.15 : 1
                                }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </motion.div>

                    {/* Right Side — Video & Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="space-y-6"
                    >
                        {/* Artist line */}
                        <div>
                            <p className="text-noir-ash text-sm tracking-[0.2em] uppercase mb-1">Shadow The Great</p>
                            <div className="w-8 h-px bg-accent-cyan/40" />
                        </div>

                        {/* Video Container */}
                        <div
                            className="relative aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer"
                            onClick={() => setIsVideoPlaying(true)}
                        >
                            {!isVideoPlaying ? (
                                <>
                                    <Image
                                        src="/LC2.jpg"
                                        alt="Lost City Video Thumbnail"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                        <motion.div
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent-cyan/90 backdrop-blur-sm flex items-center justify-center shadow-glow-md"
                                        >
                                            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-noir-void ml-0.5" fill="currentColor" />
                                        </motion.div>
                                    </div>
                                    <span className="absolute bottom-3 left-3 text-xs text-white/70 font-medium tracking-wide">
                                        Lost City (Official Video)
                                    </span>
                                </>
                            ) : (
                                <iframe
                                    src="https://www.youtube.com/embed/OOx9QAeRo8E?autoplay=1"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Lost City - Shadow The Great"
                                />
                            )}
                        </div>

                        {/* Price & CTAs — tighter layout */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-accent-cyan">$9.99</span>
                                <span className="text-noir-ash text-xs tracking-wide uppercase">Digital</span>
                            </div>

                            <div className="flex gap-3 ml-auto">
                                <motion.button
                                    onClick={handleBuyAlbum}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="px-5 py-2.5 bg-accent-cyan text-noir-void font-bold text-sm tracking-wide uppercase flex items-center gap-2 shadow-glow-md hover:shadow-glow-lg transition-shadow"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Buy
                                </motion.button>
                                <Link href="/music#lost-city">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="px-5 py-2.5 border border-noir-smoke text-foreground font-medium text-sm tracking-wide uppercase flex items-center gap-2 hover:border-accent-cyan/40 transition-colors"
                                    >
                                        <Headphones className="w-4 h-4" />
                                        Listen
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
