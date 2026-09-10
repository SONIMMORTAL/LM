import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "VIP Access",
    description:
        "Early drops, unreleased music, and first word on Loaf Records releases. Request access.",
    openGraph: {
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records crew around the decks" },
        ],
        title: "VIP Access — Loaf Records",
        description: "Early drops, unreleased music, and first word on Loaf Records releases.",
        type: "website",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: "VIP Access — Loaf Records",
        description: "Early drops, unreleased music, and first word on releases.",
    },
    alternates: { canonical: "/vip" },
    // A gated area is not something search engines should be indexing.
    robots: { index: false, follow: true },
};

export default function VipLayout({ children }: { children: React.ReactNode }) {
    return children;
}
