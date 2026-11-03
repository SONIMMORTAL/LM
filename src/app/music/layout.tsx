import type { Metadata } from "next";

const DESCRIPTION =
    "Stream every album from Shadow The Great and Loaf Muzik: Lost City, The Commission, More Life and Live From The Dungeon.";

export const metadata: Metadata = {
    title: "Music — Shadow The Great & Loaf Muzik Albums",
    description: DESCRIPTION,
    openGraph: {
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records DJ booth" },
        ],
        title: "Music — Shadow The Great & Loaf Muzik Albums",
        description: DESCRIPTION,
        type: "website",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: "Music — Shadow The Great & Loaf Muzik Albums",
        description: DESCRIPTION,
    },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
    return children;
}
