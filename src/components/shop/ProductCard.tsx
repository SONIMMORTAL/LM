"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { PrintfulProduct, PrintfulProductDetails } from "@/lib/printful";
import useSWR from "swr";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
    product: PrintfulProduct;
}

const colorMap: Record<string, string> = {
    black: "bg-black border-white/20",
    white: "bg-white border-black/20",
    red: "bg-red-600 border-transparent",
    blue: "bg-blue-600 border-transparent",
    grey: "bg-zinc-500 border-transparent",
    gray: "bg-zinc-500 border-transparent",
    charcoal: "bg-zinc-800 border-transparent",
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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    
    // Lazy load detailed product data for Quick Add
    const { data: details, error } = useSWR<PrintfulProductDetails>(
        `/api/products/${product.id}`, 
        fetcher,
        { revalidateOnFocus: false }
    );

    const sync_variants = details?.sync_variants || [];

    // Get unique colors and sizes
    const colors = Array.from(
        new Set(sync_variants.map((v) => v.color).filter(Boolean))
    ) as string[];

    const sizes = Array.from(
        new Set(sync_variants.map((v) => v.size).filter(Boolean))
    ) as string[];

    // Selected state
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // Track button states for Quick Add
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Initialize selections once details load
    useEffect(() => {
        if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
        if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    }, [colors, sizes, selectedColor, selectedSize]);

    // Sync selected size if color changes
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const availableSizes = sync_variants
            .filter((v) => v.color === color)
            .map((v) => v.size)
            .filter(Boolean) as string[];

        if (availableSizes.length > 0 && (!selectedSize || !availableSizes.includes(selectedSize))) {
            setSelectedSize(availableSizes[0]);
        }
    };

    // Find active variant
    const activeVariant =
        sync_variants.find((v) => {
            const colorMatch = !selectedColor || v.color === selectedColor;
            const sizeMatch = !selectedSize || v.size === selectedSize;
            return colorMatch && sizeMatch;
        }) || sync_variants[0];

    // Reset success checkmark after 2 seconds
    useEffect(() => {
        if (isAdded) {
            const timer = setTimeout(() => setIsAdded(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isAdded]);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation();

        if (!activeVariant || !details) return;

        setIsAdding(true);

        setTimeout(() => {
            addToCart({
                productId: details.sync_product.id,
                variantId: activeVariant.id,
                name: details.sync_product.name,
                variantName: activeVariant.name,
                price: parseFloat(activeVariant.retail_price),
                currency: activeVariant.currency,
                quantity: 1,
                thumbnail:
                    activeVariant.files?.find((f) => f.type === "mockup")?.preview_url ||
                    details.sync_product.thumbnail_url ||
                    activeVariant.product?.image ||
                    activeVariant.files?.find((f) => f.type === "preview")?.preview_url || "/placeholder.svg",
            });
            setIsAdding(false);
            setIsAdded(true);
        }, 600);
    };

    // Format currency
    const formatPrice = (price: string, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(parseFloat(price));
    };

    // Get active image
    const activeImage =
        activeVariant?.files?.find((f) => f.type === "mockup")?.preview_url ||
        product.thumbnail_url ||
        activeVariant?.product?.image ||
        activeVariant?.files?.find((f) => f.type === "preview")?.preview_url;

    // Check if name is white/light
    const isLightProduct = (name: string) => {
        const t = name.toLowerCase();
        return ["white", "snow", "ash", "heather grey", "silver", "canvas", "mug", "sticker", "poster", "cream", "beige"].some(
            (k) => t.includes(k)
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="h-full"
        >
            <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-noir-smoke bg-noir-void transition-all duration-300 hover:border-accent-cyan/30 hover:shadow-glow-sm">
                <Link href={`/shop/product/${product.id}`} className="block relative z-10 flex-grow">
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-noir-charcoal to-noir-slate">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/0 via-white/0 to-purple-500/0 opacity-0 group-hover:opacity-100 group-hover:from-accent-cyan/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none z-20 mix-blend-overlay" />
                        
                        <Image
                            src={activeImage || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isLightProduct(product.name) ? 'mix-blend-multiply opacity-90' : ''}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        {!details && !error && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    <CardContent className="pt-5 pb-2 space-y-2">
                        <h3 className="font-bold text-lg text-foreground line-clamp-1">{product.name}</h3>
                        <Badge variant="outline" className="text-accent-cyan border-accent-cyan/30 font-mono">
                            {activeVariant ? formatPrice(activeVariant.retail_price, activeVariant.currency) : "Loading..."}
                        </Badge>
                    </CardContent>
                </Link>

                <CardFooter className="pt-2 pb-5 flex-col items-stretch space-y-4 relative z-20 border-t border-white/5 mt-auto">
                    {details ? (
                        <>
                            <div className="flex flex-col gap-3">
                                {colors.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map((color) => {
                                            const twColor = colorMap[color.toLowerCase()] || "bg-zinc-700 border-transparent";
                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => handleColorChange(color)}
                                                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                                                        selectedColor === color
                                                            ? "border-accent-cyan scale-110 shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                                                            : "border-transparent hover:scale-110 opacity-70 hover:opacity-100"
                                                    } ${twColor}`}
                                                    title={color}
                                                    aria-label={`Select ${color}`}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {sizes.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
                                                    selectedSize === size
                                                        ? "bg-accent-cyan text-noir-void border-accent-cyan font-bold shadow-glow-sm"
                                                        : "bg-transparent text-noir-cloud border-noir-smoke hover:border-accent-cyan/50 hover:text-white"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleQuickAdd}
                                disabled={isAdding || isAdded || !activeVariant}
                                variant={isAdded ? "default" : "secondary"}
                                className={`w-full py-6 font-bold transition-all ${isAdded ? "bg-green-500 hover:bg-green-600 text-white" : "hover:bg-accent-cyan hover:text-black"}`}
                            >
                                <AnimatePresence mode="wait">
                                    {isAdding ? (
                                        <motion.div key="adding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </motion.div>
                                    ) : isAdded ? (
                                        <motion.div key="added" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <Check className="w-5 h-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="default" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <ShoppingBag className="w-4 h-4" />
                                            <span>QUICK ADD</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </>
                    ) : (
                        <div className="h-[120px] w-full flex items-center justify-center border border-dashed border-noir-smoke rounded-lg text-noir-ash text-sm">
                            Loading options...
                        </div>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
