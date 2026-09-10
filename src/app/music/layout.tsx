import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Music — Shadow The Great Discography",
    description: "Stream the full discography of Shadow The Great. Albums include The Commission, Lost City, More Life, and Live From The Dungeon. Brooklyn hip-hop at its finest.",
    openGraph: {
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records DJ booth" },
        ],
        title: "Music — Shadow The Great Discography",
        description: "Stream the full discography of Shadow The Great. Brooklyn hip-hop at its finest.",
        type: "website",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: "Music — Shadow The Great Discography",
        description: "Stream the full discography. The Commission, Lost City, More Life & more.",
    },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
    return children;
}
