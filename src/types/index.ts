// Type definitions for Shadow The Great Digital Flagship

// ===== Track & Music Types =====
export interface Track {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    audioUrl: string;
    duration: number;
}

export interface Album {
    id: string;
    title: string;
    releaseDate: string;
    coverArt: string;
    tracks: Track[];
}

// ===== Shop Types =====
export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: ProductImage[];
    variants: ProductVariant[];
    category: ProductCategory;
    tags: string[];
    available: boolean;
}

export interface ProductImage {
    id: string;
    url: string;
    altText: string;
    width: number;
    height: number;
}

export interface ProductVariant {
    id: string;
    title: string;
    price: number;
    available: boolean;
    selectedOptions: { name: string; value: string }[];
}

export type ProductCategory =
    | "apparel"
    | "vinyl"
    | "accessories"
    | "limited-edition";

// ===== Content Types =====
export interface GalleryItem {
    id: string;
    title: string;
    description?: string;
    image: string;
    category: "photo" | "video" | "artwork";
    date: string;
}

export interface Event {
    id: string;
    title: string;
    venue: string;
    location: string;
    date: string;
    ticketUrl?: string;
    soldOut: boolean;
}

// ===== UI Types =====
export interface NavItem {
    label: string;
    href: string;
    isExternal?: boolean;
}

export interface SocialLink {
    platform: "instagram" | "twitter" | "spotify" | "youtube" | "tiktok";
    url: string;
}
