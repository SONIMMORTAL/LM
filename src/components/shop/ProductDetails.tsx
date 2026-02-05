"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { PrintfulProductDetails } from "@/lib/printful";
import BasicDropdown from "@/components/ui/BasicDropdown";
import { toast } from "react-hot-toast";

interface ProductDetailsProps {
    product: PrintfulProductDetails;
}

export function ProductDetails({ product }: ProductDetailsProps) {
    const { addToCart } = useCart();
    const { sync_product, sync_variants } = product;

    const [selectedVariantId, setSelectedVariantId] = useState<number>(sync_variants[0]?.id);
    const selectedVariant = sync_variants.find(v => v.id === selectedVariantId) || sync_variants[0];

    // Transform variants for dropdown
    const dropdownItems = sync_variants.map(v => {
        // clean up name: remove product name prefix if present
        let label = v.name;
        if (label.startsWith(sync_product.name + " - ")) {
            label = label.replace(sync_product.name + " - ", "");
        } else if (label.startsWith(sync_product.name)) {
            label = label.replace(sync_product.name, "").trim();
            if (label.startsWith("-")) label = label.substring(1).trim();
        }

        return {
            id: v.id,
            label: label,
        };
    });

    const handleVariantChange = (item: { id: string | number }) => {
        setSelectedVariantId(Number(item.id));
    };

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        addToCart({
            productId: sync_product.id,
            variantId: selectedVariant.id,
            name: sync_product.name,
            variantName: selectedVariant.name,
            price: parseFloat(selectedVariant.retail_price),
            currency: selectedVariant.currency,
            quantity: 1,
            thumbnail: sync_product.thumbnail_url
        });

        toast.success("Added to cart");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Link href="/shop" className="inline-flex items-center gap-2 text-noir-cloud hover:text-accent-cyan transition-colors mb-6 sm:mb-8 text-sm sm:text-base">
                <ChevronLeft className="w-4 h-4" />
                Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                {/* Image Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-noir-charcoal to-noir-slate border border-white/5"
                >
                    {sync_product.thumbnail_url ? (
                        <Image
                            src={sync_product.thumbnail_url}
                            alt={sync_product.name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShoppingBag className="w-16 sm:w-20 h-16 sm:h-20 text-noir-ash/50" />
                        </div>
                    )}
                </motion.div>

                {/* Details Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6 sm:space-y-8"
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4 text-white leading-tight">
                            {sync_product.name}
                        </h1>
                        <div className="text-xl sm:text-2xl font-medium text-accent-cyan">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedVariant?.currency || 'USD' }).format(parseFloat(selectedVariant?.retail_price || "0"))}
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <label className="text-xs sm:text-sm font-medium text-noir-cloud uppercase tracking-wider">
                            Select Option
                        </label>
                        <div className="w-full sm:max-w-xs">
                            <BasicDropdown
                                label="Choose Size / Color"
                                items={dropdownItems}
                                selectedId={selectedVariantId}
                                onChange={handleVariantChange}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-noir-smoke">
                        <button
                            onClick={handleAddToCart}
                            className="w-full py-3 sm:py-4 bg-accent-cyan text-noir-void font-bold uppercase tracking-wider rounded-xl hover:bg-accent-cyanMuted transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-glow-md text-sm sm:text-base"
                        >
                            <ShoppingBag className="w-4 sm:w-5 h-4 sm:h-5" />
                            Add to Cart
                        </button>
                        <p className="text-center text-xs text-noir-cloud mt-3 sm:mt-4">
                            Worldwide shipping available.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
