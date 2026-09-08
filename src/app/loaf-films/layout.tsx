import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Loaf Films | Cinematic Music Video Production — Brooklyn, NY",
    description: "Loaf Films is a Brooklyn-based music video and commercial production company by Loaf Records. Cinema-grade visuals for independent and label-signed artists. Bronze, Silver, and Gold packages available.",
    openGraph: {
        title: "Loaf Films | Cinematic Music Video Production",
        description: "Brooklyn-born cinematic execution. We shoot raw, concept-driven music videos and commercial films that reflect visual soul.",
        type: "website",
        siteName: "Loaf Records",
    },
    twitter: {
        card: "summary_large_image",
        title: "Loaf Films | Cinematic Music Video Production",
        description: "Brooklyn-born cinematic execution. We shoot raw, concept-driven music videos and commercial films.",
    },
};

// JSON-LD structured data for Loaf Films (Organization + Service + VideoObject)
const loafFilmsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            name: "Loaf Films",
            url: "https://loafrecords.com/loaf-films",
            description: "Loaf Films is the cinematic production arm of Loaf Records, specializing in music videos and commercial films for independent artists.",
            foundingLocation: {
                "@type": "Place",
                name: "Brooklyn, New York",
            },
            parentOrganization: {
                "@type": "Organization",
                name: "Loaf Records",
                url: "https://loafrecords.com",
            },
            knowsAbout: [
                "Music Video Production",
                "Commercial Film Production",
                "Color Grading",
                "Cinematography",
            ],
        },
        {
            "@type": "Service",
            name: "Bronze Video Production Package",
            provider: { "@type": "Organization", name: "Loaf Films" },
            description: "Perfect for indie artists & single releases. 1 location, 4 hours shooting, 1080p cinema-grade camera, basic editing & color grading.",
            offers: {
                "@type": "Offer",
                price: "1500.00",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: "https://loafrecords.com/loaf-films#booking",
            },
        },
        {
            "@type": "Service",
            name: "Silver Video Production Package",
            provider: { "@type": "Organization", name: "Loaf Films" },
            description: "Bestseller. The standard for official music videos. 2 locations, full day shoot, dual-camera 4K setup, advanced color grading, social media teaser.",
            offers: {
                "@type": "Offer",
                price: "3000.00",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: "https://loafrecords.com/loaf-films#booking",
            },
        },
        {
            "@type": "Service",
            name: "Gold Video Production Package",
            provider: { "@type": "Organization", name: "Loaf Films" },
            description: "Fully cinematic. High production value commercial scale. Pre-production, unlimited locations, 3-person crew, RED/Arri/Sony FX cameras, VFX, Dolby color grading.",
            offers: {
                "@type": "Offer",
                price: "6000.00",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: "https://loafrecords.com/loaf-films#booking",
            },
        },
        {
            "@type": "VideoObject",
            name: "Shadow The Great - Lost City (Directed by Sage Wolf)",
            description: "Official music video for 'Lost City' by Shadow The Great, directed by Sage Wolf. A Loaf Films production.",
            thumbnailUrl: "https://img.youtube.com/vi/OOx9QAeRo8E/maxresdefault.jpg",
            uploadDate: "2025-01-01",
            contentUrl: "https://www.youtube.com/watch?v=OOx9QAeRo8E",
            embedUrl: "https://www.youtube.com/embed/OOx9QAeRo8E",
            productionCompany: { "@type": "Organization", name: "Loaf Films" },
        },
        {
            "@type": "VideoObject",
            name: "Abel - Rah Tha Ruler & Shadow The Great (Directed by Loaf Films)",
            description: "Official music video for 'Abel' by Rah Tha Ruler & Shadow The Great. A Loaf Films production.",
            thumbnailUrl: "https://img.youtube.com/vi/41Zx0etfnkM/maxresdefault.jpg",
            uploadDate: "2025-01-01",
            contentUrl: "https://www.youtube.com/watch?v=41Zx0etfnkM",
            embedUrl: "https://www.youtube.com/embed/41Zx0etfnkM",
            productionCompany: { "@type": "Organization", name: "Loaf Films" },
        },
    ],
};

export default function LoafFilmsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Loaf Films JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(loafFilmsJsonLd) }}
            />
            {children}
        </>
    );
}
