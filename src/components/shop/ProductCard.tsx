"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import useSWR from "swr";
import type { PrintfulProduct, PrintfulProductDetails } from "@/lib/printful";

interface ProductCardProps {
    product: PrintfulProduct;
    /** Position in its collection, stamped on the tile like the landing's lookbook. */
    index: number;
}

const colorMap: Record<string, string> = {
    black: "bg-black border-white/30",
    white: "bg-white border-black/20",
    red: "bg-red-600 border-transparent",
    blue: "bg-blue-600 border-transparent",
    grey: "bg-zinc-500 border-transparent",
    gray: "bg-zinc-500 border-transparent",
    charcoal: "bg-zinc-800 border-white/20",
    navy: "bg-blue-900 border-transparent",
    green: "bg-emerald-700 border-transparent",
    yellow: "bg-yellow-500 border-transparent",
    pink: "bg-pink-500 border-transparent",
    purple: "bg-purple-600 border-transparent",
    orange: "bg-orange-500 border-transparent",
    gold: "bg-amber-500 border-transparent",
    silver: "bg-slate-300 border-transparent",
    sand: "bg-[#e5d3b3] border-transparent",
    cream: "bg-[#fffdd0] border-transparent",
    beige: "bg-[#f5f5dc] border-transparent",
    khaki: "bg-[#c3b091] border-transparent",
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);

/**
 * A merch tile in the landing's lookbook style: the garment big on a light well so
 * dark pieces still read, a stamped drop number, the price, and the colours it comes in.
 * Size and colour are picked on the product page.
 */
export function ProductCard({ product, index }: ProductCardProps) {
    // Prices and colours load once the tile is close to the screen, so a long store
    // doesn't fire every product request at once on a slow phone
    const tileRef = useRef<HTMLAnchorElement>(null);
    const nearScreen = useInView(tileRef, { once: true, margin: "300px 0px" });
    const { data: details } = useSWR<PrintfulProductDetails>(
        nearScreen ? `/api/products/${product.id}` : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    const variants = details?.sync_variants ?? [];
    const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
    const prices = variants.map((v) => parseFloat(v.retail_price)).filter((p) => !Number.isNaN(p));
    const lowest = prices.length > 0 ? Math.min(...prices) : null;
    const priceVaries = prices.some((p) => p !== lowest);
    const currency = variants[0]?.currency || "USD";

    return (
        <Link
            ref={tileRef}
            href={`/shop/product/${product.id}`}
            className="group flex h-full flex-col rounded-2xl border border-white/15 bg-[#101219] p-2 sm:p-2.5 transition-colors hover:border-amber-400/60"
        >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-white">
                <Image
                    src={product.thumbnail_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 270px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                    aria-hidden
                    className="absolute top-2 left-2 rounded border border-amber-400/40 bg-black/85 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest text-amber-400"
                >
                    DROP // {String(index + 1).padStart(2, "0")}
                </span>
            </div>

            <h3 className="mt-2.5 line-clamp-2 text-xs sm:text-sm font-bold leading-tight text-white">
                {product.name}
            </h3>

            <div className="mt-auto pt-2">
                {colors.length > 1 && (
                    <div role="img" aria-label={`${colors.length} colours`} className="mb-1.5 flex items-center gap-1">
                        {colors.slice(0, 5).map((color) => (
                            <span
                                key={color}
                                title={color}
                                className={`h-2.5 w-2.5 rounded-full border ${colorMap[color.toLowerCase()] || "bg-zinc-700 border-white/20"}`}
                            />
                        ))}
                        {colors.length > 5 && (
                            <span className="font-mono text-[8px] text-noir-cloud">+{colors.length - 5}</span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between gap-2">
                    {lowest !== null ? (
                        <span className="font-mono text-sm font-bold text-amber-400">
                            {priceVaries && (
                                <>
                                    <span className="text-[8px] uppercase tracking-wider text-noir-cloud">From</span>{" "}
                                </>
                            )}
                            {formatPrice(lowest, currency)}
                        </span>
                    ) : (
                        <span aria-hidden className="h-3.5 w-14 animate-pulse rounded bg-white/10" />
                    )}
                    <span
                        aria-hidden
                        className="flex items-center gap-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-accent-cyan"
                    >
                        Cop <ArrowUpRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
