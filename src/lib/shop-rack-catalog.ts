import type { PrintfulProduct, PrintfulProductDetails } from "@/lib/printful";

export type RackCategory = "All" | "Hoodies" | "Tees" | "Outerwear" | "Shorts";

export type HangerStyle = "hoodie" | "shirt" | "clips";

export interface RackGarmentMeta {
    category: Exclude<RackCategory, "All">;
    hanger: HangerStyle;
    cutoutSrc: string;
    sortOrder: number;
    /** Vertical adjustment (% of frame) so collars, hoods, or waistbands meet the hanger cleanly. */
    topOffsetClass: string;
    shortTitle?: string;
}

export interface RackProductItem {
    product: PrintfulProduct;
    details: PrintfulProductDetails | null;
    meta: RackGarmentMeta;
    priceRangeLabel: string;
    defaultPrice: number;
    currency: string;
    colors: string[];
    sizes: string[];
}

export const RACK_CATEGORIES: readonly RackCategory[] = [
    "All",
    "Hoodies",
    "Tees",
    "Outerwear",
    "Shorts",
] as const;

/**
 * Curated hanger-rack mapping for Loaf Records' flat-lay clothing pieces.
 * Non-clothing accessories (phone cases, backpacks, shoes, pillows) and model-only
 * photos are intentionally excluded so every piece hangs flat on a uniform rail.
 * `sortOrder` alternates light, vibrant orange/blue/cream, and black silhouettes.
 */
export const RACK_GARMENT_CONFIG: Record<number, RackGarmentMeta> = {
    401420024: {
        category: "Hoodies",
        hanger: "hoodie",
        cutoutSrc: "/shop-rack/401420024.webp",
        sortOrder: 1,
        topOffsetClass: "translate-y-[1%]",
    },
    391523559: {
        category: "Hoodies",
        hanger: "hoodie",
        cutoutSrc: "/shop-rack/391523559.webp",
        sortOrder: 2,
        topOffsetClass: "translate-y-[1%]",
    },
    391525654: {
        category: "Tees",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391525654.webp",
        sortOrder: 3,
        topOffsetClass: "translate-y-[1.5%]",
    },
    391563208: {
        category: "Outerwear",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391563208.webp",
        sortOrder: 4,
        topOffsetClass: "translate-y-[1.5%]",
    },
    391575964: {
        category: "Outerwear",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391575964.webp",
        sortOrder: 5,
        topOffsetClass: "translate-y-[1.5%]",
    },
    391530590: {
        category: "Tees",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391530590.webp",
        sortOrder: 6,
        topOffsetClass: "translate-y-[1.5%]",
    },
    391557994: {
        category: "Hoodies",
        hanger: "hoodie",
        cutoutSrc: "/shop-rack/391557994.webp",
        sortOrder: 7,
        topOffsetClass: "translate-y-[1%]",
    },
    391192180: {
        category: "Tees",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391192180.webp",
        sortOrder: 8,
        topOffsetClass: "translate-y-[1.5%]",
    },
    401419646: {
        category: "Hoodies",
        hanger: "hoodie",
        cutoutSrc: "/shop-rack/401419646.webp",
        sortOrder: 9,
        topOffsetClass: "translate-y-[1%]",
    },
    391353874: {
        category: "Tees",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391353874.webp",
        sortOrder: 10,
        topOffsetClass: "translate-y-[1.5%]",
    },
    391526526: {
        category: "Outerwear",
        hanger: "hoodie",
        cutoutSrc: "/shop-rack/391526526.webp",
        sortOrder: 11,
        topOffsetClass: "translate-y-[1%]",
    },
    391356431: {
        category: "Tees",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391356431.webp",
        sortOrder: 12,
        topOffsetClass: "translate-y-[1.5%]",
    },
    401419855: {
        category: "Tees",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/401419855.webp",
        sortOrder: 13,
        topOffsetClass: "translate-y-[1.5%]",
    },
    391615024: {
        category: "Tees",
        hanger: "shirt",
        cutoutSrc: "/shop-rack/391615024.webp",
        sortOrder: 14,
        topOffsetClass: "translate-y-[1.5%]",
    },
    391559749: {
        category: "Shorts",
        hanger: "clips",
        cutoutSrc: "/shop-rack/391559749.webp",
        sortOrder: 15,
        topOffsetClass: "translate-y-[1.5%]",
    },
};

const COLOR_KEYWORD_HEX: ReadonlyArray<readonly [string, string]> = [
    ["black", "#141416"],
    ["white", "#F8F8FA"],
    ["ash", "#D4D4D8"],
    ["sport grey", "#9CA3AF"],
    ["heather", "#9CA3AF"],
    ["grey", "#71717A"],
    ["gray", "#71717A"],
    ["charcoal", "#3F3F46"],
    ["carolina", "#7BA7E1"],
    ["light blue", "#7BA7E1"],
    ["sky", "#7BA7E1"],
    ["navy", "#1E3A5F"],
    ["blue", "#2563EB"],
    ["burnt orange", "#EA7245"],
    ["orange", "#F97316"],
    ["maroon", "#6B1D2F"],
    ["burgundy", "#6B1D2F"],
    ["red", "#DC2626"],
    ["cream", "#EBE4D1"],
    ["natural", "#E6DFCE"],
    ["sand", "#DFD3BE"],
    ["beige", "#E8DFC8"],
    ["khaki", "#C3B091"],
    ["olive", "#4B5D44"],
    ["forest", "#254E3A"],
    ["green", "#15803D"],
    ["gold", "#D97706"],
    ["yellow", "#EAB308"],
    ["pink", "#EC4899"],
    ["purple", "#7C3AED"],
];

/** Map Printful color labels (e.g. "Carolina Blue", "Sport Grey") to display swatch hexes. */
export function resolveColorHex(colorName: string): string {
    const lower = colorName.toLowerCase();
    for (const [keyword, hex] of COLOR_KEYWORD_HEX) {
        if (lower.includes(keyword)) return hex;
    }
    return "#52525B";
}

export function formatRackPrice(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
    }).format(amount);
}

/** Extract unique colors, sizes, and price range from Printful product details. */
export function extractRackOptions(details: PrintfulProductDetails | null | undefined) {
    const variants = details?.sync_variants ?? [];
    const colors = Array.from(
        new Set(variants.map((v) => v.color).filter((c): c is string => Boolean(c)))
    );
    const sizes = Array.from(
        new Set(variants.map((v) => v.size).filter((s): s is string => Boolean(s)))
    );
    const numericPrices = variants
        .map((v) => Number.parseFloat(v.retail_price))
        .filter((n) => Number.isFinite(n) && n > 0);

    const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 0;
    const maxPrice = numericPrices.length > 0 ? Math.max(...numericPrices) : 0;
    const currency = variants[0]?.currency || "USD";

    let priceRangeLabel = "";
    if (minPrice > 0) {
        priceRangeLabel =
            minPrice !== maxPrice
                ? `${formatRackPrice(minPrice, currency)} – ${formatRackPrice(maxPrice, currency)}`
                : formatRackPrice(minPrice, currency);
    }

    return {
        colors,
        sizes,
        defaultPrice: minPrice,
        currency,
        priceRangeLabel,
    };
}

/** Combine live Printful catalog items with our hanger-rack metadata in rhythm order. */
export function mergeRackItems(
    products: PrintfulProduct[],
    detailsById: Record<number, PrintfulProductDetails>
): RackProductItem[] {
    return products
        .filter((product) => !product.is_ignored && Boolean(RACK_GARMENT_CONFIG[product.id]))
        .map((product) => {
            const meta = RACK_GARMENT_CONFIG[product.id];
            const details = detailsById[product.id] ?? null;
            const opts = extractRackOptions(details);
            return {
                product,
                details,
                meta,
                ...opts,
            };
        })
        .sort((a, b) => a.meta.sortOrder - b.meta.sortOrder);
}
