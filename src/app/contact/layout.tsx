import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact — Bookings, Press & Inquiries",
    description: "Get in touch with Loaf Records for bookings, features, press inquiries, licensing, and business opportunities. Based in Brooklyn, NY.",
    openGraph: {
        title: "Contact — Loaf Records",
        description: "Bookings, press inquiries, and business opportunities. Brooklyn, NY.",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Contact — Loaf Records",
        description: "Bookings, press, and business inquiries.",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
