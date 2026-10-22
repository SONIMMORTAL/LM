import HomeClient from "@/components/home/HomeClient";
import { HomeOverview } from "@/components/home/HomeOverview";
import { getTracks } from "@/lib/tracks-server";
import { absoluteUrl } from "@/lib/site";
import { getChannelUploads } from "@/lib/youtube-feed";
import type { Metadata } from "next";

export const revalidate = 300;

const TITLE = "Loaf Records | Home of Loaf Muzik";
const DESCRIPTION =
    "Explore Loaf Records, the Brooklyn independent hip-hop label founded by Shadow The Great and Oso Dope. Stream albums, shop merch, and watch Loaf Films music videos.";

export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
        url: "/",
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records crew around the decks" },
        ],
        title: TITLE,
        description: DESCRIPTION,
        type: "website",
        siteName: "Loaf Records",
        locale: "en_US",
    },
    twitter: {
        images: [{ url: "/og/og-default.jpg", alt: "The Loaf Records crew around the decks" }],
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
    },
};

// Use the same entities and facts as the visible label overview and artist bio.
const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": absoluteUrl("/#organization"),
            name: "Loaf Records",
            url: absoluteUrl(),
            logo: absoluteUrl("/loaf-records-logo.png"),
            description: DESCRIPTION,
            founder: [
                { "@id": absoluteUrl("/bio#artist") },
                {
                    "@type": "Person",
                    "@id": absoluteUrl("/bio#oso-dope"),
                    name: "Oso Dope",
                    jobTitle: ["Hip-hop artist", "Musician"],
                    worksFor: { "@id": absoluteUrl("/#organization") },
                },
            ],
            foundingLocation: { "@type": "Place", name: "Brooklyn, New York" },
            sameAs: [
                "https://instagram.com/loafrecords",
                "https://www.youtube.com/@LoafRecords",
                "https://www.facebook.com/loafrecords",
            ],
        },
        {
            "@type": "Person",
            "@id": absoluteUrl("/bio#artist"),
            name: "Shadow The Great",
            url: absoluteUrl("/bio"),
            jobTitle: ["Hip-hop artist", "Producer", "Director"],
            worksFor: { "@id": absoluteUrl("/#organization") },
        },
        {
            "@type": "WebSite",
            "@id": absoluteUrl("/#website"),
            name: "Loaf Records",
            url: absoluteUrl(),
            inLanguage: "en-US",
            publisher: { "@id": absoluteUrl("/#organization") },
        },
        {
            "@type": "WebPage",
            "@id": absoluteUrl("/#webpage"),
            url: absoluteUrl(),
            name: TITLE,
            description: DESCRIPTION,
            inLanguage: "en-US",
            isPartOf: { "@id": absoluteUrl("/#website") },
            about: { "@id": absoluteUrl("/#organization") },
            primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl("/og/og-default.jpg") },
        },
    ],
};

export default async function Home() {
    const [tracks, uploads] = await Promise.all([
        getTracks().catch(() => []),
        getChannelUploads(),
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c") }}
            />
            <HomeClient initialTracks={tracks} newRelease={uploads[0]} />
            {/* Desktop only: on phones the landing is the whole page */}
            <div className="hidden lg:block">
                <HomeOverview />
            </div>
        </>
    );
}
