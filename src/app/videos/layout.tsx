import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Videos — Official Music Videos & Live Performances",
    description: "Watch official music videos, live performances, and behind-the-scenes content from Shadow The Great and Loaf Records. Brooklyn's raw, cinematic sound on screen.",
    openGraph: {
        title: "Videos — Official Music Videos & Live Performances",
        description: "Watch official music videos and live performances from Shadow The Great.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Videos — Shadow The Great",
        description: "Official music videos, live performances, and Loaf TV.",
    },
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
    return children;
}
