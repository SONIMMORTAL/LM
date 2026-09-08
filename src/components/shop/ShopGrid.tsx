"use client";

import { motion } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import type { PrintfulProduct } from "@/lib/printful";
import { ProductCard } from "./ProductCard";
import { Badge } from "@/components/ui/badge";

interface ShopGridProps {
    products: PrintfulProduct[];
}

export function ShopGrid({ products }: ShopGridProps) {
    // 1. Featured Drop (Lost City, Commission)
    const featuredDrop = products.filter((p) => {
        const name = p.name.toLowerCase();
        return name.includes("lost city") || name.includes("commission");
    });

    // 2. Best Sellers (Bear, Jeeps, Champion, Dungeon, Puffer, fleece, heavyweight)
    const bestSellers = products.filter((p) => {
        if (featuredDrop.includes(p)) return false;
        const name = p.name.toLowerCase();
        return (
            name.includes("bear") ||
            name.includes("jeep") ||
            name.includes("champion") ||
            name.includes("dungeon") ||
            name.includes("puffer") ||
            name.includes("shorts") ||
            name.includes("jacket") ||
            name.includes("fleece") ||
            name.includes("heavyweight")
        );
    });

    // 3. For The City (Everything else: Knowledge Born, More Life, Panther, etc.)
    const forTheCity = products.filter((p) => {
        return !featuredDrop.includes(p) && !bestSellers.includes(p);
    });

    return (
        <div className="space-y-20 px-4 sm:px-6">
            {/* 1. FEATURED DROP */}
            {featuredDrop.length > 0 && (
                <section aria-labelledby="featured-drop-heading">
                    <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <Badge variant="outline" className="text-accent-cyan border-accent-cyan/20 tracking-[0.25em] uppercase mb-4 rounded-full px-4 py-1 bg-accent-cyan/5">
                                New Arrival
                            </Badge>
                            <h2
                                id="featured-drop-heading"
                                className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white font-display"
                            >
                                Featured Drop
                            </h2>
                            <p className="text-noir-cloud text-sm mt-1">
                                Limited quantities. Lost City and Commission drop.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredDrop.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* 2. BEST SELLERS */}
            {bestSellers.length > 0 && (
                <section aria-labelledby="best-sellers-heading">
                    <div className="max-w-7xl mx-auto mb-8">
                        <div>
                            <Badge variant="outline" className="text-accent-cyan border-accent-cyan/20 tracking-[0.25em] uppercase mb-4 rounded-full px-4 py-1 bg-accent-cyan/5">
                                Customer Favorites
                            </Badge>
                            <h2
                                id="best-sellers-heading"
                                className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white font-display"
                            >
                                Best Sellers
                            </h2>
                            <p className="text-noir-cloud text-sm mt-1">
                                Loaf Records essentials. Bear gear and heavyweight fleece.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {bestSellers.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* 3. FOR THE CITY */}
            {forTheCity.length > 0 && (
                <section aria-labelledby="for-the-city-heading">
                    <div className="max-w-7xl mx-auto mb-8">
                        <div>
                            <Badge variant="outline" className="text-accent-cyan border-accent-cyan/20 tracking-[0.25em] uppercase mb-4 rounded-full px-4 py-1 bg-accent-cyan/5">
                                Brooklyn Originals
                            </Badge>
                            <h2
                                id="for-the-city-heading"
                                className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white font-display"
                            >
                                For The City
                            </h2>
                            <p className="text-noir-cloud text-sm mt-1">
                                Knowledge Born and More Life collectibles for the streets.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {forTheCity.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {products.length === 0 && (
                <div className="text-center py-20 text-noir-cloud max-w-md mx-auto">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50 text-accent-cyan" />
                    <p className="text-lg font-semibold text-white">No products found.</p>
                    <p className="text-sm mt-2">Check back soon for the next drop.</p>
                </div>
            )}
        </div>
    );
}
