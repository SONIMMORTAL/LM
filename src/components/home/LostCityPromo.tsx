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
            productId: 9999, // Special ID for Lost City digital album
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
        <section className="py-20 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-noir-void via-noir-charcoal to-noir-void relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block mb-3 text-accent-cyan text-sm tracking-[0.3em] uppercase font-medium">
                        Featured Album
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
                        Out Now
                    </h2>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                    {/* Left Side - Interactive Vinyl */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
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
                                {/* Sleeve Edge Effect */}
                                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent" />
                            </motion.div>

                            {/* Spinning Vinyl */}
                            <motion.div
                                className="absolute inset-0 z-10 rounded-full overflow-hidden bg-neutral-900"
                                style={{
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                                }}
                                animate={{
                                    x: isHovered ? 60 : 0,
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
                                {/* Vinyl Shine/Reflection */}
                                <div
                                    className="absolute inset-0 rounded-full opacity-40"
                                    style={{
                                        background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.1) 30deg, transparent 60deg, transparent 120deg, rgba(255,255,255,0.1) 150deg, transparent 180deg)'
                                    }}
                                />

                                {/* Center Album Art (on vinyl label) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full overflow-hidden border-4 border-neutral-900 shadow-2xl">
                                    <Image
                                        src="/LC1.jpg"
                                        alt="Lost City"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </motion.div>

                            {/* Glow Effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-accent-cyan/20 blur-3xl -z-10"
                                animate={{
                                    opacity: isHovered ? 0.6 : 0.2,
                                    scale: isHovered ? 1.2 : 1
                                }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </motion.div>

                    {/* Right Side - Video & Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Album Title & Artist */}
                        <div>
                            <motion.h3
                                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                Lost City
                            </motion.h3>
                            <p className="text-noir-cloud text-lg mt-2">Shadow The Great</p>
                        </div>

                        {/* Video Container */}
                        <div
                            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer"
                            onClick={() => setIsVideoPlaying(true)}
                        >
                            {!isVideoPlaying ? (
                                <>
                                    {/* Thumbnail */}
                                    <Image
                                        src="/LC2.jpg"
                                        alt="Lost City Video Thumbnail"
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent-cyan flex items-center justify-center shadow-glow-lg"
                                        >
                                            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-noir-void ml-1" fill="currentColor" />
                                        </motion.div>
                                    </div>
                                    <span className="absolute bottom-4 left-4 text-sm text-white/80 font-medium">Watch: Lost City (Official Video)</span>
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

                        {/* Price & CTAs */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Price Badge */}
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-accent-cyan">$9.99</span>
                                <span className="text-noir-ash text-sm">Digital Album</span>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 flex-1 sm:justify-end">
                                <motion.button
                                    onClick={handleBuyAlbum}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="px-6 py-3 bg-accent-cyan text-noir-void font-bold rounded-full flex items-center gap-2 shadow-glow-md hover:shadow-glow-lg transition-shadow"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Buy Album
                                </motion.button>
                                <Link href="/music#lost-city">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="px-6 py-3 border border-noir-smoke text-foreground font-medium rounded-full flex items-center gap-2 hover:border-accent-cyan/50 transition-colors"
                                    >
                                        <Headphones className="w-4 h-4" />
                                        Listen
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                        {/* Tracklist Teaser */}
                        <div className="pt-4 border-t border-noir-smoke/50">
                            <p className="text-noir-ash text-sm uppercase tracking-wider mb-3">Featured Tracks</p>
                            <div className="flex flex-wrap gap-2">
                                {["Chess", "Juice", "Live & Direct", "Pray", "Drop Gems"].map((track, i) => (
                                    <motion.span
                                        key={track}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="px-3 py-1.5 bg-noir-slate/50 text-noir-cloud text-sm rounded-full border border-noir-smoke/50 hover:border-accent-cyan/30 hover:text-accent-cyan transition-colors cursor-default"
                                    >
                                        {track}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
