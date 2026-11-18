import {
    getPrintfulProduct,
    getPrintfulProducts,
    type PrintfulProductDetails,
} from "@/lib/printful";
import { RACK_GARMENT_CONFIG } from "@/lib/shop-rack-catalog";
import { ClothingRack } from "@/components/shop/ClothingRack";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    alternates: { canonical: "/shop" },
    title: "Shop — Official Merch",
    description:
        "Browse the official Loaf Records merch store. Limited edition apparel, vinyl, accessories, and more from Shadow The Great. Worldwide shipping.",
    openGraph: {
        url: "/shop",
        images: [
            {
                url: "/og/og-default.jpg",
                width: 1200,
                height: 630,
                alt: "Loaf Records official merch",
            },
        ],
        title: "Shop | Loaf Records — Official Merch",
        description:
            "Limited edition apparel, vinyl, accessories, and more from Shadow The Great.",
        type: "website",
        siteName: "Loaf Records",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: "Shop | Loaf Records — Official Merch",
        description:
            "Limited edition apparel, vinyl, accessories, and more from Shadow The Great.",
    },
};

export default async function ShopPage() {
    const products = await getPrintfulProducts();
    const rackProducts = products.filter(
        (product) => !product.is_ignored && Boolean(RACK_GARMENT_CONFIG[product.id])
    );

    const detailEntries = await Promise.all(
        rackProducts.map(async (product) => {
            const details = await getPrintfulProduct(product.id);
            return [product.id, details] as const;
        })
    );

    const detailsById: Record<number, PrintfulProductDetails> = {};
    for (const [id, details] of detailEntries) {
        if (details) {
            detailsById[id] = details;
        }
    }

    return <ClothingRack products={products} detailsById={detailsById} />;
}
