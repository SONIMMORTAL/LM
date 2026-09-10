"use client";

import { ShoppingBag } from "lucide-react";
import type { PrintfulProduct } from "@/lib/printful";
import { ProductCard } from "./ProductCard";

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
                            <span
                                aria-hidden
                                className="pointer-events-none block select-none text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter text-white/[0.07]"
                            >
                                Featured Drop
                            </span>
                            <h2
                                id="featured-drop-heading"
                                className="-mt-5 sm:-mt-8 text-lg sm:text-xl font-black uppercase tracking-[0.2em] text-accent-cyan"
                            >
                                New Arrival
                            </h2>
                            <p className="mt-2 text-sm text-noir-cloud">
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
                            <span
                                aria-hidden
                                className="pointer-events-none block select-none text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter text-white/[0.07]"
                            >
                                Best Sellers
                            </span>
                            <h2
                                id="best-sellers-heading"
                                className="-mt-5 sm:-mt-8 text-lg sm:text-xl font-black uppercase tracking-[0.2em] text-accent-cyan"
                            >
                                Customer Favorites
                            </h2>
                            <p className="mt-2 text-sm text-noir-cloud">
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
                            <span
                                aria-hidden
                                className="pointer-events-none block select-none text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter text-white/[0.07]"
                            >
                                For The City
                            </span>
                            <h2
                                id="for-the-city-heading"
                                className="-mt-5 sm:-mt-8 text-lg sm:text-xl font-black uppercase tracking-[0.2em] text-accent-cyan"
                            >
                                Brooklyn Originals
                            </h2>
                            <p className="mt-2 text-sm text-noir-cloud">
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
