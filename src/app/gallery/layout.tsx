import type { Metadata } from "next";

/**
 * The gallery page is a client component, so its metadata lives here — without
 * it the route fell back to the root title and told search engines and every
 * shared link that it was the store.
 */
export const metadata: Metadata = {
    title: "Gallery — Behind The Scenes",
    description:
        "Photographs from the Loaf Records archive. Trailer and box truck pieces, blackbook pages, and the crew behind them.",
    openGraph: {
        title: "Gallery — Behind The Scenes",
        description: "Photographs from the Loaf Records archive.",
        type: "website",
        images: [
            {
                url: "/og/og-gallery.jpg",
                width: 1200,
                height: 630,
                alt: "A writer up a stepladder painting a blue and magenta piece along a trailer at dusk",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Gallery — Loaf Records",
        description: "Photographs from the Loaf Records archive.",
        images: ["/og/og-gallery.jpg"],
    },
    alternates: { canonical: "/gallery" },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
