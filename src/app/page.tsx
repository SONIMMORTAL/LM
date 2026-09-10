import HomeClient from "@/components/home/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Loaf Records",
    description:
        "The official home of Loaf Records. Music, merch, and films from Brooklyn, NY.",
    openGraph: {
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records crew around the decks" },
        ],
        title: "Loaf Records",
        description:
            "The official home of Loaf Records. Music, merch, and films from Brooklyn, NY.",
        type: "website",
        siteName: "Loaf Records",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: "Loaf Records",
        description:
            "The official home of Loaf Records. Music, merch, and films from Brooklyn, NY.",
    },
};

export default function Home() {
    return <HomeClient />;
}
