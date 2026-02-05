"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { PrintfulProduct } from "@/lib/printful";
import ExpandableCards, { Card } from "@/components/ui/ExpandableCards";

interface ShopGridProps {
    products: PrintfulProduct[];
}

// Map logical categories based on keywords in title
export function getCategory(product: PrintfulProduct): string {
    const t = product.name.toLowerCase();
    // Strict checks for specific albums first
    if ((t.includes("knowledge born") && t.includes("album")) ||
        (t.includes("more life") && t.includes("album")) ||
        t.includes("shinobi warz")) return "Vinyl";

    if (t.includes("vinyl") || t.includes(" lp")) return "Vinyl";
    if (t.includes("hoodie") || t.includes("shirt") || t.includes("tee") || t.includes("sweat") || t.includes("jacket")) return "Apparel";
    if (t.includes("cap") || t.includes("hat") || t.includes("beanie") || t.includes("bag") || t.includes("backpack")) return "Accessories";
    if (t.includes("mug") || t.includes("pillow") || t.includes("blanket") || t.includes("towel")) return "Home";
    if (t.includes("poster") || t.includes("print") || t.includes("canvas") || t.includes("sticker")) return "Art";
    return "Apparel"; // Default
}

const categories = ["All", "Apparel", "Accessories", "Vinyl", "Home", "Art"];

export function ShopGrid({ products }: ShopGridProps) {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredProducts = activeCategory === "All"
        ? products
        : products.filter(p => getCategory(p) === activeCategory);

    // Transform products to Cards
    const expandableCards: Card[] = filteredProducts.map(p => {
        // Safely access price, handling missing variants (products list doesn't have variants)
        // Price will be displayed on the product detail page
        return {
            id: p.id,
            title: p.name,
            image: p.thumbnail_url,
            content: "Official Merch",
            price: "View Details",
            actionUrl: `/shop/product/${p.id}`
        };
    });

    return (
        <section className="px-1 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Category Filter */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap px-2">
                    {categories.map((category) => (
                        <motion.button
                            key={category}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(category)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium transition-all
                              ${activeCategory === category
                                    ? "bg-accent-cyan text-noir-void"
                                    : "bg-noir-slate text-noir-cloud hover:text-foreground"
                                }
                            `}
                        >
                            {category}
                        </motion.button>
                    ))}
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="w-full">
                        <ExpandableCards
                            cards={expandableCards}
                            className="min-h-[500px]"
                        />
                    </div>
                ) : (
                    <div className="text-center py-20 text-noir-cloud">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No products found in this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
