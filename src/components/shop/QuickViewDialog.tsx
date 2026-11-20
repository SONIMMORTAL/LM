"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { ArrowUpRight, Check, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { PrintfulProductDetails } from "@/lib/printful";
import { colorFront } from "@/lib/merch-mockups";
import {
    extractRackOptions,
    formatRackPrice,
    resolveColorHex,
    type RackProductItem,
} from "@/lib/shop-rack-catalog";
import { cn } from "@/lib/utils";

interface QuickViewDialogProps {
    item: RackProductItem | null;
    onClose: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Native modal dialog / mobile sheet for quick garment inspection, color & size selection,
 * and instant cart addition directly from the showroom clothing rack.
 */
export function QuickViewDialog({ item, onClose }: QuickViewDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (item && !dialog.open) {
            dialog.showModal();
        } else if (!item && dialog.open) {
            dialog.close();
        }
    }, [item]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === dialogRef.current) {
                    onClose();
                }
            }}
            aria-label={item ? `${item.product.name} quick view` : "Product quick view"}
            className={cn(
                "rack-qv bg-transparent p-0 border-0 outline-none shadow-none",
                "m-auto w-[min(780px,calc(100vw-2rem))] max-h-[90dvh]",
                "max-md:m-0 max-md:mt-auto max-md:w-full max-md:max-w-full max-md:max-h-[88dvh]"
            )}
        >
            {item && <QuickViewContent key={item.product.id} item={item} onClose={onClose} />}
        </dialog>
    );
}

function QuickViewContent({ item, onClose }: { item: RackProductItem; onClose: () => void }) {
    const { addToCart } = useCart();

    const { data: fetchedDetails, isLoading } = useSWR<PrintfulProductDetails>(
        !item.details ? `/api/products/${item.product.id}` : null,
        fetcher
    );

    const details = item.details ?? fetchedDetails ?? null;
    const { colors, sizes } = useMemo(() => extractRackOptions(details), [details]);
    const variants = useMemo(() => details?.sync_variants ?? [], [details]);

    const [selectedColor, setSelectedColor] = useState<string | null>(() => colors[0] ?? null);
    const [selectedSize, setSelectedSize] = useState<string | null>(() => sizes[0] ?? null);
    const [justAdded, setJustAdded] = useState(false);

    // Sync initial selection if variants arrived asynchronously via SWR
    const activeColor = selectedColor && colors.includes(selectedColor) ? selectedColor : (colors[0] ?? null);
    const availableSizesForColor = useMemo(() => {
        if (!activeColor) return sizes;
        const subset = variants
            .filter((v) => v.color === activeColor)
            .map((v) => v.size)
            .filter((s): s is string => Boolean(s));
        return subset.length > 0 ? Array.from(new Set(subset)) : sizes;
    }, [activeColor, sizes, variants]);

    const activeSize =
        selectedSize && availableSizesForColor.includes(selectedSize)
            ? selectedSize
            : (availableSizesForColor[0] ?? null);

    const activeVariant = useMemo(() => {
        return (
            variants.find(
                (v) =>
                    (!activeColor || v.color === activeColor) &&
                    (!activeSize || v.size === activeSize)
            ) ??
            variants[0] ??
            null
        );
    }, [variants, activeColor, activeSize]);

    const unitPrice = activeVariant
        ? Number.parseFloat(activeVariant.retail_price)
        : item.defaultPrice;

    // Show our clean transparent hanger cutout for the primary colorway, and switch
    // to Printful's variant mockup when the user toggles into a secondary colorway.
    const defaultColor = colors[0] ?? null;
    const isDefaultColor = !activeColor || activeColor === defaultColor;
    const variantPreviewUrl = activeVariant?.files?.find(
        (f) => f.type === "preview" || f.type === "mockup"
    )?.preview_url;
    // Where Printful's previews show the unprinted side, we have our own front for every colour
    const ownFront = colorFront(item.product.id, activeColor);
    const previewSrc =
        ownFront ?? (!isDefaultColor && variantPreviewUrl ? variantPreviewUrl : item.meta.cutoutSrc);

    const handleAddToCart = () => {
        if (!activeVariant || !Number.isFinite(unitPrice) || unitPrice <= 0) return;

        addToCart({
            productId: item.product.id,
            variantId: activeVariant.id,
            name: item.product.name,
            variantName:
                [activeColor, activeSize].filter(Boolean).join(" / ") || activeVariant.name,
            price: unitPrice,
            currency: activeVariant.currency || item.currency || "USD",
            quantity: 1,
            thumbnail: ownFront || variantPreviewUrl || item.product.thumbnail_url || item.meta.cutoutSrc,
        });

        setJustAdded(true);
        setTimeout(() => {
            onClose();
        }, 420);
    };

    return (
        <div className="relative overflow-y-auto max-h-[88dvh] rounded-2xl max-md:rounded-b-none max-md:rounded-t-3xl bg-[#FBF9F5] text-[#18181B] border border-black/10 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <button
                type="button"
                onClick={onClose}
                aria-label="Close quick view"
                className="absolute right-3.5 top-3.5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[#18181B] transition-colors hover:bg-[#18181B] hover:text-white cursor-pointer"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
                {/* Garment stage well */}
                <div className="relative flex items-center justify-center bg-[#EFECE4] p-6 md:p-8 min-h-[260px] md:min-h-[420px]">
                    <div className="relative aspect-[3/4] w-full max-w-[230px] md:max-w-[260px]">
                        <Image
                            src={previewSrc}
                            alt={item.product.name}
                            fill
                            sizes="(max-width: 768px) 60vw, 260px"
                            className="object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.14)]"
                        />
                    </div>
                </div>

                {/* Spec & Purchase panel */}
                <div className="flex flex-col justify-between gap-5 p-6 md:p-7">
                    <div className="space-y-4">
                        <div className="pr-10">
                            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                Loaf Wear · {item.meta.category}
                            </span>
                            <h2 className="mt-1 font-display text-2xl md:text-3xl leading-[0.98] tracking-[0.02em] text-[#18181B] uppercase">
                                {item.product.name}
                            </h2>
                            <p className="mt-2 font-mono text-lg font-medium text-[#18181B]">
                                {unitPrice > 0
                                    ? formatRackPrice(unitPrice, activeVariant?.currency || item.currency)
                                    : isLoading
                                      ? "Loading price…"
                                      : item.priceRangeLabel || "See details"}
                            </p>
                        </div>

                        {/* Colorway selector */}
                        {colors.length > 0 && (
                            <div className="space-y-2">
                                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                    Color: <strong className="text-[#18181B]">{activeColor}</strong>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => {
                                        const isSelected = color === activeColor;
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                className={cn(
                                                    "inline-flex h-11 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-all cursor-pointer",
                                                    isSelected
                                                        ? "border-[#18181B] bg-[#18181B] text-white"
                                                        : "border-black/15 bg-white text-[#18181B] hover:border-black/40"
                                                )}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/20"
                                                    style={{ backgroundColor: resolveColorHex(color) }}
                                                />
                                                <span>{color}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Size selector */}
                        {sizes.length > 0 && (
                            <div className="space-y-2">
                                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                    Size: <strong className="text-[#18181B]">{activeSize}</strong>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size) => {
                                        const inColor = availableSizesForColor.includes(size);
                                        const isSelected = size === activeSize;
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                disabled={!inColor}
                                                onClick={() => setSelectedSize(size)}
                                                className={cn(
                                                    "inline-flex min-h-[44px] min-w-[46px] items-center justify-center rounded-lg border px-3 font-mono text-xs uppercase transition-all",
                                                    !inColor && "opacity-35 cursor-not-allowed line-through",
                                                    inColor && "cursor-pointer",
                                                    isSelected
                                                        ? "border-[#18181B] bg-[#18181B] text-white"
                                                        : "border-black/15 bg-white text-[#18181B] hover:border-black/45"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-black/10">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!activeVariant || unitPrice <= 0}
                            className={cn(
                                "flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-mono uppercase tracking-[0.16em] text-white transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed",
                                justAdded ? "bg-emerald-700" : "bg-[#18181B] hover:bg-black"
                            )}
                        >
                            {justAdded ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    <span>Added to Bag</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="h-4 w-4" />
                                    <span>Add to Bag</span>
                                </>
                            )}
                        </button>

                        <Link
                            href={`/shop/product/${item.product.id}`}
                            onClick={onClose}
                            className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-black/20 bg-white px-4 py-3 text-xs font-mono uppercase tracking-[0.14em] text-[#18181B] transition-colors hover:border-black/60"
                        >
                            <span>Full Specs</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
