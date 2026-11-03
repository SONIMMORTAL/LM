import HomeClient from "@/components/home/HomeClient";
import { HomeOverview } from "@/components/home/HomeOverview";
import { getTracks } from "@/lib/tracks-server";
import { absoluteUrl } from "@/lib/site";
import { getChannelUploads } from "@/lib/youtube-feed";
import { LOAF_MUZIK } from "@/lib/crew";
import { ALBUM_RELEASES } from "@/lib/discography";
import { LOAF_MUZIK_ID, ORGANIZATION_ID, WEBSITE_ID, crewGraph, jsonLd, websiteNode } from "@/lib/structured-data";
import type { Metadata } from "next";

export const revalidate = 300;

const TITLE = "Loaf Records | Home of Loaf Muzik";
const DESCRIPTION =
    "Loaf Records, home of Loaf Muzik: the Brooklyn hip-hop label founded by Shadow The Great and Oso Dope. Stream the albums, shop merch and watch Loaf Films videos.";

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

// The label, the collective and its members, read from the same facts as the bio
const structuredData = jsonLd([
    ...crewGraph(ALBUM_RELEASES.filter((album) => album.artist === LOAF_MUZIK.name)),
    websiteNode(),
    {
        "@type": "WebPage",
        "@id": absoluteUrl("/#webpage"),
        url: absoluteUrl(),
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en-US",
        isPartOf: { "@id": WEBSITE_ID },
        about: [{ "@id": ORGANIZATION_ID }, { "@id": LOAF_MUZIK_ID }],
        primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl("/og/og-default.jpg") },
    },
]);

export default async function Home() {
    const [tracks, uploads] = await Promise.all([
        getTracks().catch(() => []),
        getChannelUploads(),
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: structuredData }}
            />
            <HomeClient initialTracks={tracks} newRelease={uploads[0]} />
            {/* Desktop only: on phones the landing is the whole page */}
            <div className="hidden lg:block">
                <HomeOverview />
            </div>
        </>
    );
}
