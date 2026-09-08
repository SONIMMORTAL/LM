"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { PrintfulProduct } from "@/lib/printful";

interface FeaturedMerchProps {
    products: PrintfulProduct[];
}

export function FeaturedMerch({ products }: FeaturedMerchProps) {
    // Take top 4 products
    const featured = products.slice(0, 4);

    if (featured.length === 0) return null;

    return (
        <section className="relative py-20 md:py-28 px-4 sm:px-6 overflow-hidden">
            {/* Subtle ambient glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,217,255,0.04) 0%, transparent 70%)",
                }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
                >
                    <div>
                        <span className="inline-block mb-3 text-accent-cyan text-xs tracking-[0.35em] uppercase font-medium">
                            Official Merch
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.02em] uppercase">
                            The <span className="text-accent-cyan">Drop</span>
                        </h2>
                    </div>
                    <Link
                        href="/shop"
                        className="group flex items-center gap-1.5 text-noir-cloud hover:text-accent-cyan transition-colors text-sm tracking-[0.12em] uppercase font-medium"
                    >
                        View All
                        <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </motion.div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {featured.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link
                                href={`/shop/product/${product.id}`}
                                className="group block"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-noir-charcoal mb-3 ring-1 ring-white/5 group-hover:ring-accent-cyan/30 transition-all duration-300">
                                    <Image
                                        src={product.thumbnail_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-noir-void/0 group-hover:bg-noir-void/40 transition-colors duration-300 flex items-center justify-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileHover={{ opacity: 1, scale: 1 }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-accent-cyan/90 backdrop-blur-sm flex items-center justify-center shadow-glow-md">
                                                <ShoppingBag className="w-5 h-5 text-noir-void" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate group-hover:text-accent-cyan transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-noir-ash text-xs tracking-[0.15em] uppercase mt-0.5">
                                    Loaf Records
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA — mobile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-10 text-center sm:hidden"
                >
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold uppercase tracking-wider text-foreground hover:border-accent-cyan/40 hover:bg-white/10 transition-all"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Shop All Merch
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
