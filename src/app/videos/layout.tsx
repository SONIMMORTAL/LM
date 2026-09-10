import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Videos — Official Music Videos & Live Performances",
    description: "Watch official music videos, live performances, and behind-the-scenes content from Shadow The Great and Loaf Records. Straight from Brooklyn.",
    openGraph: {
        title: "Videos — Official Music Videos & Live Performances",
        description: "Watch official music videos and live performances from Shadow The Great.",
        type: "website",
        images: [{ url: "/og/og-videos.jpg", width: 1200, height: 630, alt: "The Loaf Records screening room" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Videos — Shadow The Great",
        description: "Official music videos, live performances, and Loaf TV.",
        images: ["/og/og-videos.jpg"],
    },
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
    return children;
}
