import HomeClient from "@/components/home/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Loaf Records",
    description:
        "The official home of Loaf Records. Music, merch, and films from Brooklyn, NY.",
    openGraph: {
        title: "Loaf Records",
        description:
            "The official home of Loaf Records. Music, merch, and films from Brooklyn, NY.",
        type: "website",
        siteName: "Loaf Records",
    },
    twitter: {
        card: "summary_large_image",
        title: "Loaf Records",
        description:
            "The official home of Loaf Records. Music, merch, and films from Brooklyn, NY.",
    },
};

export default function Home() {
    return <HomeClient />;
}
