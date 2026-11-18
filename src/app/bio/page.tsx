import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { LOAF_MUZIK } from "@/lib/crew";
import { ALBUM_RELEASES } from "@/lib/discography";
import { LOAF_MUZIK_ID, WEBSITE_ID, breadcrumbNode, crewGraph, faqNode, jsonLd } from "@/lib/structured-data";
import { StreetBackdrop } from "@/components/layout/StreetBackdrop";
import { ArtistBio, BioActionButtons } from "@/components/home/ArtistBio";

const TITLE = "Loaf Muzik — Shadow The Great & Oso Dope | Loaf Records";
const DESCRIPTION =
    "Loaf Muzik (also written Loaf Music or Loaf Musik) is the independent hip-hop collective from Brooklyn, home to Shadow The Great and Oso Dope, who founded its label, Loaf Records.";

export const metadata: Metadata = {
    alternates: { canonical: "/bio" },
    title: { absolute: TITLE },
    description: DESCRIPTION,
    openGraph: {
        url: "/bio",
        images: [{ url: "/og/og-default.jpg", width: 1200, height: 630, alt: "Loaf Muzik — Loaf Records" }],
        title: TITLE,
        description: DESCRIPTION,
        type: "profile",
        siteName: "Loaf Records",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
    },
};

// The collective, the label and every member, with the questions the page answers
const structuredData = jsonLd([
    {
        "@type": "AboutPage",
        "@id": absoluteUrl("/bio#page"),
        url: absoluteUrl("/bio"),
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": LOAF_MUZIK_ID },
    },
    ...crewGraph(ALBUM_RELEASES.filter((album) => album.artist === LOAF_MUZIK.name)),
    faqNode(absoluteUrl("/bio#faq")),
    breadcrumbNode([
        { name: "Home", path: "/" },
        { name: "Loaf Muzik", path: "/bio" },
    ]),
]);

export default function BioPage() {
    return (
        <StreetBackdrop>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
            <div className="min-h-screen pt-20 lg:pt-24 pb-16">
                <ArtistBio />

                {/* Mobile bottom CTA row (desktop renders its actions directly in the hero spread) */}
                <BioActionButtons className="lg:hidden px-3 sm:px-4 max-w-2xl mx-auto mt-1 grid grid-cols-2 gap-2.5" />
            </div>
        </StreetBackdrop>
    );
}
