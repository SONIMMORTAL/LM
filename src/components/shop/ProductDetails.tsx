"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag,
    ChevronLeft,
    Check,
    Loader2,
    Ruler,
    Truck,
    RefreshCw,
    Info,
    ChevronDown,
    X
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { PrintfulProductDetails } from "@/lib/printful";
import { toast } from "react-hot-toast";

interface ProductDetailsProps {
    product: PrintfulProductDetails;
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

// Size Charts Data
interface SizeChart {
    headers: string[];
    rows: string[][];
}

const sizeCharts: Record<string, SizeChart> = {
    apparel: {
        headers: ["Size", "Chest Width (in)", "Body Length (in)", "Sleeve Length (in)"],
        rows: [
            ["S", "34 - 36", "28", "8.25"],
            ["M", "38 - 40", "29", "8.60"],
            ["L", "42 - 44", "30", "9.10"],
            ["XL", "46 - 48", "31", "9.60"],
            ["2XL", "50 - 52", "32", "10.20"]
        ]
    },
    shoes: {
        headers: ["US Men", "US Women", "EU Size", "Foot Length (in)"],
        rows: [
            ["7", "8.5", "40", "10.2"],
            ["8", "9.5", "41", "10.5"],
            ["9", "10.5", "42.5", "10.8"],
            ["10", "11.5", "44", "11.2"],
            ["11", "12.5", "45", "11.5"]
        ]
    },
    default: {
        headers: ["Metric", "Fit Details"],
        rows: [
            ["Standard", "One size fits most, adjustable features included."],
            ["Shipping", "Worldwide flat-rate tracking provided."]
        ]
    }
};

export function ProductDetails({ product }: ProductDetailsProps) {
    const { addToCart } = useCart();
    const { sync_product, sync_variants } = product;

    // Get unique colors and sizes
    const colors = Array.from(
        new Set(sync_variants.map((v) => v.color).filter(Boolean))
    ) as string[];

    const sizes = Array.from(
        new Set(sync_variants.map((v) => v.size).filter(Boolean))
    ) as string[];

    // State variables
    const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null);
    const [activeImage, setActiveImage] = useState<string>(sync_product.thumbnail_url);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
    const [openSpecTab, setOpenSpecTab] = useState<string | null>("fabric");

    // Button states
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [showSticky, setShowSticky] = useState(false);

    // Get all unique preview images across variants
    const allPreviewImages = Array.from(
        new Set(
            sync_variants.flatMap((v) =>
                v.files
                    ?.filter((f) => f.type === "mockup" || f.type === "preview")
                    .map((f) => f.preview_url)
                    .filter(Boolean)
            )
        )
    ) as string[];

    const images = Array.from(
        new Set([sync_product.thumbnail_url, ...allPreviewImages])
    ).filter(Boolean) as string[];

    // Sync selected size if color changes (ensures color/size combination exists)
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const availableSizes = sync_variants
            .filter((v) => v.color === color)
            .map((v) => v.size)
            .filter(Boolean) as string[];

        if (
            availableSizes.length > 0 &&
            (!selectedSize || !availableSizes.includes(selectedSize))
        ) {
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

    // Automatically update the main image to the selected variant's image if available
    useEffect(() => {
        if (activeVariant) {
            const variantImg =
                activeVariant.files?.find((f) => f.type === "mockup")?.preview_url ||
                sync_product.thumbnail_url ||
                activeVariant.product?.image ||
                activeVariant.files?.find((f) => f.type === "preview")?.preview_url;
            if (variantImg) {
                setActiveImage(variantImg);
            }
        }
    }, [activeVariant, sync_product.thumbnail_url]);

    // Reset success checkmark after 2 seconds
    useEffect(() => {
        if (isAdded) {
            const timer = setTimeout(() => setIsAdded(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isAdded]);

    // Monitor scroll position to show sticky mobile add-to-cart panel
    useEffect(() => {
        const handleScroll = () => {
            setShowSticky(window.scrollY > 450);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAddToCart = () => {
        if (!activeVariant) return;

        setIsAdding(true);

        setTimeout(() => {
            addToCart({
                productId: sync_product.id,
                variantId: activeVariant.id,
                name: sync_product.name,
                variantName: activeVariant.name,
                price: parseFloat(activeVariant.retail_price),
                currency: activeVariant.currency,
                quantity: 1,
                thumbnail:
                    activeVariant.files?.find((f) => f.type === "mockup")?.preview_url ||
                    sync_product.thumbnail_url ||
                    activeVariant.product?.image ||
                    activeVariant.files?.find((f) => f.type === "preview")?.preview_url || "/placeholder.svg",
            });
            setIsAdding(false);
            setIsAdded(true);
        }, 600);
    };

    const formatPrice = (price: string, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(parseFloat(price));
    };

    // Get product metadata for spec sheets
    const getSpecs = (name: string) => {
        const t = name.toLowerCase();
        let fabric = "Premium lifestyle product designed by Loaf Records.";
        let care = "Machine wash cold, inside-out, gentle cycle with mild detergent. Tumble dry low or hang dry.";

        if (t.includes("hoodie") || t.includes("sweatshirt")) {
            fabric = "85% organic combed ring-spun cotton, 15% recycled polyester. Heavyweight fleece fabric (10.3 oz/yd² or 350 g/m²). Brushed interior for supreme comfort.";
            care = "Machine wash cold inside-out. Do not iron print. Line dry recommended.";
        } else if (t.includes("tee") || t.includes("shirt") || t.includes("top")) {
            fabric = "100% combed ring-spun cotton. Premium medium-heavyweight fabric (5.3 oz/yd² or 180 g/m²). Pre-shrunk for shape retention and durability.";
        } else if (t.includes("shoes") || t.includes("shoes")) {
            fabric = "High-quality canvas upper with custom printed artwork. Padded collar, soft foam comfort insole, and solid vulcanized rubber outsole.";
            care = "Clean spots gently with warm water and soft brush. Do not machine wash.";
        } else if (t.includes("backpack") || t.includes("bag")) {
            fabric = "100% water-resistant heavy polyester. Padded ergonomic back straps, spacious interior with padded 15\" laptop sleeve, and front zip pocket.";
        }

        return { fabric, care };
    };

    const specs = getSpecs(sync_product.name);
    const chartType = sync_product.name.toLowerCase().includes("shoes")
        ? "shoes"
        : sync_product.name.toLowerCase().match(/(hoodie|tee|shirt|top|sweatshirt|shorts|jacket)/)
        ? "apparel"
        : "default";
    const activeChart = sizeCharts[chartType];

    const isLightProduct = (name: string) => {
        const t = name.toLowerCase();
        return ["white", "snow", "ash", "heather grey", "silver", "canvas", "mug", "sticker", "poster", "cream", "beige"].some(
            (k) => t.includes(k)
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            {/* Back Button */}
            <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-noir-cloud hover:text-accent-cyan transition-colors mb-6 sm:mb-8 text-sm uppercase tracking-wider font-bold"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Shop
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Images Column (Left) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Main Showcase */}
                    <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-noir-charcoal to-noir-slate border border-noir-smoke flex items-center justify-center">
                        {activeImage ? (
                            <Image
                                src={activeImage}
                                alt={sync_product.name}
                                fill
                                className={`object-cover object-center ${
                                    isLightProduct(sync_product.name) ? "mix-blend-normal" : "mix-blend-multiply contrast-110"
                                }`}
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <ShoppingBag className="w-16 h-16 text-noir-smoke" />
                        )}
                    </div>

                    {/* Thumbnails list */}
                    {images.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-noir-smoke">
                            {images.map((img, i) => (
                                <button
                                    key={img}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-noir-charcoal border transition-all duration-200 ${
                                        activeImage === img
                                            ? "border-accent-cyan ring-1 ring-accent-cyan/30"
                                            : "border-noir-smoke opacity-70 hover:opacity-100"
                                    }`}
                                    type="button"
                                >
                                    <Image
                                        src={img}
                                        alt={`Product view ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Column (Right) */}
                <div className="lg:col-span-5 space-y-8">
                    <div>
                        <span className="text-accent-cyan text-xs font-bold tracking-[0.3em] uppercase block mb-2">
                            Official Release
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white leading-tight font-display mb-3">
                            {sync_product.name}
                        </h1>
                        <p className="text-2xl font-bold text-accent-cyan">
                            {activeVariant ? formatPrice(activeVariant.retail_price, activeVariant.currency) : "..."}
                        </p>
                    </div>

                    {/* Color Picker */}
                    {colors.length > 1 && (
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-noir-cloud uppercase tracking-widest block">
                                Color: <span className="text-white ml-1">{selectedColor}</span>
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {colors.map((color) => {
                                    const cKey = color.toLowerCase();
                                    const mappedClass = colorMap[cKey] || "bg-noir-slate border-white/20";
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => handleColorChange(color)}
                                            className={`h-8 w-8 rounded-full border transition-all duration-200 ${mappedClass} ${
                                                selectedColor === color
                                                    ? "ring-2 ring-accent-cyan ring-offset-4 ring-offset-noir-void scale-110"
                                                    : "opacity-80 hover:opacity-100 hover:scale-105"
                                            }`}
                                            title={color}
                                            type="button"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Size Picker */}
                    {sizes.length > 1 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-noir-cloud uppercase tracking-widest block">
                                    Size: <span className="text-white ml-1">{selectedSize}</span>
                                </span>
                                {chartType !== "default" && (
                                    <button
                                        onClick={() => setIsSizeChartOpen(true)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-cyan hover:underline uppercase tracking-wider"
                                        type="button"
                                    >
                                        <Ruler className="w-3.5 h-3.5" />
                                        Size Chart
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {sizes.map((size) => {
                                    const isAvailable = sync_variants.some(
                                        (v) => (!selectedColor || v.color === selectedColor) && v.size === size
                                    );
                                    return (
                                        <button
                                            key={size}
                                            disabled={!isAvailable}
                                            onClick={() => isAvailable && setSelectedSize(size)}
                                            className={`min-w-[48px] h-11 px-3 rounded-xl text-xs font-bold border tracking-wider transition-all uppercase flex items-center justify-center ${
                                                selectedSize === size
                                                    ? "bg-accent-cyan text-noir-void border-accent-cyan shadow-glow-sm"
                                                    : isAvailable
                                                    ? "border-noir-smoke text-white hover:border-accent-cyan/50 bg-noir-charcoal/30"
                                                    : "border-transparent text-noir-smoke/40 bg-noir-void cursor-not-allowed"
                                            }`}
                                            type="button"
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Actions Panel */}
                    <div className="space-y-4 pt-4 border-t border-noir-smoke">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || !activeVariant}
                            className={`w-full h-14 bg-accent-cyan text-noir-void font-bold uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-glow-md ${
                                isAdded ? "bg-green-600 text-white" : "hover:bg-accent-cyanMuted"
                            }`}
                            type="button"
                        >
                            {isAdding ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isAdded ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
                                    Add to Cart
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-noir-cloud tracking-wide">
                            Secure payment options. Flat-rate tracked shipping worldwide.
                        </p>
                    </div>

                    {/* Details / Specs Accordion */}
                    <div className="border-t border-noir-smoke pt-6 space-y-3">
                        {/* 1. Fabric Specifications */}
                        <div className="border-b border-noir-charcoal pb-3">
                            <button
                                onClick={() => setOpenSpecTab(openSpecTab === "fabric" ? null : "fabric")}
                                className="w-full flex items-center justify-between text-left py-2 font-bold text-sm uppercase tracking-widest text-white hover:text-accent-cyan transition-colors"
                                type="button"
                            >
                                <span className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-accent-cyan" />
                                    Material & Care
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${openSpecTab === "fabric" ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence initial={false}>
                                {openSpecTab === "fabric" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden mt-2 text-xs leading-relaxed text-noir-cloud space-y-2"
                                    >
                                        <p>{specs.fabric}</p>
                                        <p className="font-semibold text-white">Care guidelines:</p>
                                        <p>{specs.care}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 2. Shipping Info */}
                        <div className="border-b border-noir-charcoal pb-3">
                            <button
                                onClick={() => setOpenSpecTab(openSpecTab === "shipping" ? null : "shipping")}
                                className="w-full flex items-center justify-between text-left py-2 font-bold text-sm uppercase tracking-widest text-white hover:text-accent-cyan transition-colors"
                                type="button"
                            >
                                <span className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-accent-cyan" />
                                    Shipping Estimates
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${openSpecTab === "shipping" ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence initial={false}>
                                {openSpecTab === "shipping" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden mt-2 text-xs leading-relaxed text-noir-cloud space-y-2"
                                    >
                                        <p>Every product is printed and shipped on demand for ecological conservation.</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li><span className="text-white">Fulfillment:</span> 2–5 business days.</li>
                                            <li><span className="text-white">US Shipping:</span> 3–6 business days via USPS/DHL.</li>
                                            <li><span className="text-white">International:</span> 6–12 business days (custom duty details emailed).</li>
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. Returns and Refunds */}
                        <div className="pb-1">
                            <button
                                onClick={() => setOpenSpecTab(openSpecTab === "returns" ? null : "returns")}
                                className="w-full flex items-center justify-between text-left py-2 font-bold text-sm uppercase tracking-widest text-white hover:text-accent-cyan transition-colors"
                                type="button"
                            >
                                <span className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-accent-cyan" />
                                    Returns & Exchanges
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${openSpecTab === "returns" ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence initial={false}>
                                {openSpecTab === "returns" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden mt-2 text-xs leading-relaxed text-noir-cloud"
                                    >
                                        <p>
                                            Because products are custom-crafted per client, all sales are final. If your item arrives damaged, misprinted, or defective, contact customer support within 14 days of delivery for a free exchange or refund.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sizing Chart Modal */}
            <AnimatePresence>
                {isSizeChartOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSizeChartOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-noir-charcoal border border-noir-smoke rounded-2xl p-6 shadow-glow-md z-10 overflow-hidden"
                        >
                            <button
                                onClick={() => setIsSizeChartOpen(false)}
                                className="absolute top-4 right-4 text-noir-cloud hover:text-white transition-colors"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold text-white uppercase tracking-tight font-display mb-4">
                                {sync_product.name.split(" - ")[0]} Sizing Table
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-noir-smoke text-noir-cloud uppercase tracking-wider">
                                            {activeChart.headers.map((h) => (
                                                <th key={h} className="pb-3 pt-1 font-bold">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-noir-charcoal">
                                        {activeChart.rows.map((row, rIdx) => (
                                            <tr key={rIdx} className="text-white hover:bg-white/5">
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} className="py-3 font-semibold">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-[10px] text-noir-cloud mt-4 leading-relaxed">
                                Note: Sizes are flat measurements. Fit may vary slightly (+/- 1 inch) due to standard manufacturing tolerances.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sticky Mobile Add-to-Cart Panel */}
            <AnimatePresence>
                {showSticky && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-noir-void/90 backdrop-blur-xl border-t border-noir-smoke p-4 md:hidden flex items-center justify-between shadow-glow-sm"
                    >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-noir-charcoal border border-noir-smoke">
                                <Image
                                    src={activeImage || sync_product.thumbnail_url}
                                    alt={sync_product.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-xs uppercase tracking-tight text-white truncate">
                                    {sync_product.name}
                                </h4>
                                <p className="text-[10px] text-accent-cyan font-bold">
                                    {selectedColor ? `${selectedColor} / ` : ""}
                                    {selectedSize || "Original"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || !activeVariant}
                            className={`h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-glow-sm ${
                                isAdded ? "bg-green-600 text-white" : "bg-accent-cyan text-noir-void active:scale-95"
                            }`}
                            type="button"
                        >
                            {isAdding ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isAdded ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Added
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    {activeVariant ? formatPrice(activeVariant.retail_price, activeVariant.currency) : "Add"}
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
