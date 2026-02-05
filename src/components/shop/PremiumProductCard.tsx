"use client";

import { CardContainer, CardBody, CardItem } from "@/components/ui/ThreeDCard";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { PrintfulProduct } from "@/lib/printful";

// Map logical categories based on keywords in title
// Map logical categories based on keywords in title
function getCategory(product: PrintfulProduct): string {
    const t = product.name.toLowerCase();
    if (t.includes("vinyl") || t.includes("record") || t.includes("lp")) return "Vinyl";
    if (t.includes("hoodie") || t.includes("shirt") || t.includes("tee") || t.includes("sweat") || t.includes("jacket")) return "Apparel";
    if (t.includes("cap") || t.includes("hat") || t.includes("beanie") || t.includes("bag") || t.includes("backpack")) return "Accessories";
    if (t.includes("mug") || t.includes("pillow") || t.includes("blanket") || t.includes("towel")) return "Home";
    if (t.includes("poster") || t.includes("print") || t.includes("canvas") || t.includes("sticker")) return "Art";
    return "Apparel";
}

// Check if product is likely light-colored/white based on name
function isLightProduct(name: string): boolean {
    const t = name.toLowerCase();
    const lightKeywords = ["white", "snow", "ash", "heather grey", "silver", "canvas", "mug", "sticker", "poster", "cream", "beige"];
    return lightKeywords.some(keyword => t.includes(keyword));
}

export function PremiumProductCard({ product, index }: { product: PrintfulProduct; index: number }) {
    const category = getCategory(product);

    return (
        <CardContainer className="inter-var w-full h-full">
            <CardBody className="bg-noir-void relative group/card dark:hover:shadow-2xl dark:hover:shadow-accent-cyan/[0.1] border-noir-smoke w-full h-auto rounded-xl p-6 border flex flex-col justify-between overflow-hidden">
                {/* Spotlight Gradient Background for better product visibility */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-zinc-800 dark:to-zinc-950 z-0 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col h-full justify-between">


                    {/* Header: Category & Name */}
                    <CardItem
                        translateZ="50"
                        className="text-xl font-bold text-foreground dark:text-white truncate"
                    >
                        {product.name}
                    </CardItem>
                    <CardItem
                        as="p"
                        translateZ="60"
                        className="text-accent-cyan max-w-sm mt-2 text-xs font-bold tracking-widest uppercase"
                    >
                        {category}
                    </CardItem>

                    {/* Image Section */}
                    <CardItem translateZ="100" className="w-full mt-4 flex-grow selection:bg-none relative">
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl group transition-all duration-500">
                            {/* Holographic Overlay - The "2027" Look */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/0 via-white/0 to-purple-500/0 group-hover:from-accent-cyan/10 group-hover:via-white/5 group-hover:to-purple-500/10 z-20 pointer-events-none transition-all duration-500 mix-blend-overlay" />

                            <Link href={`/shop/product/${product.id}`} className="block h-full w-full relative z-10">
                                {product.thumbnail_url ? (
                                    <Image
                                        src={product.thumbnail_url}
                                        height={1000}
                                        width={1000}
                                        className={`
                                      h-full w-full object-cover rounded-xl transition-all duration-500 group-hover:scale-110
                                      ${isLightProduct(product.name) ? 'mix-blend-normal' : 'mix-blend-multiply contrast-125'}
                                    `}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="h-full w-full bg-noir-slate flex items-center justify-center rounded-xl">
                                        <ShoppingBag className="w-12 h-12 text-noir-cloud opacity-50" />
                                    </div>
                                )}
                            </Link>
                        </div>
                    </CardItem>

                    {/* Footer: Action Button */}
                    <div className="flex justify-between items-center mt-8">
                        <CardItem
                            translateZ={20}
                            as="div"
                            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                        >
                            <Link href={`/shop/product/${product.id}`}>
                                View Details →
                            </Link>
                        </CardItem>
                        <CardItem
                            translateZ={20}
                            as="button"
                            className="px-4 py-2 rounded-xl bg-accent-cyan text-noir-void text-xs font-bold hover:bg-white hover:text-black transition-colors"
                        >
                            <Link href={`/shop/product/${product.id}`}>
                                Check it out
                            </Link>
                        </CardItem>
                    </div>
                </div>
            </CardBody>
        </CardContainer>
    );
}
