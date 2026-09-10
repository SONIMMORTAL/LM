import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact — Bookings, Press & Inquiries",
    description: "Get in touch with Loaf Records for bookings, features, press inquiries, licensing, and business opportunities. Based in Brooklyn, NY.",
    openGraph: {
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records crew around the decks" },
        ],
        title: "Contact — Loaf Records",
        description: "Bookings, press inquiries, and business opportunities. Brooklyn, NY.",
        type: "website",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary",
        title: "Contact — Loaf Records",
        description: "Bookings, press, and business inquiries.",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
