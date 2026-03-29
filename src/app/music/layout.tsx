import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Music — Shadow The Great Discography",
    description: "Stream the full discography of Shadow The Great. Albums include The Commission, Lost City, More Life, and Live From The Dungeon. Brooklyn hip-hop at its finest.",
    openGraph: {
        title: "Music — Shadow The Great Discography",
        description: "Stream the full discography of Shadow The Great. Brooklyn hip-hop at its finest.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Music — Shadow The Great Discography",
        description: "Stream the full discography. The Commission, Lost City, More Life & more.",
    },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
    return children;
}
