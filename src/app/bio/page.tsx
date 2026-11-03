import Link from "next/link";
import { Music2, Play } from "lucide-react";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { LOAF_MUZIK } from "@/lib/crew";
import { ALBUM_RELEASES } from "@/lib/discography";
import { LOAF_MUZIK_ID, WEBSITE_ID, breadcrumbNode, crewGraph, faqNode, jsonLd } from "@/lib/structured-data";
import { StreetBackdrop } from "@/components/layout/StreetBackdrop";
import { ArtistBio } from "@/components/home/ArtistBio";

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
            <div className="min-h-screen pt-24 pb-16">
                <ArtistBio />

                {/* Where to go next — the work itself */}
                <nav aria-label="Hear and watch" className="px-3 sm:px-4 max-w-2xl mx-auto mt-1 grid grid-cols-2 gap-2.5">
                    <Link
                        href="/music"
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-4 font-mono text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-[0.98] transition-transform"
                    >
                        <Music2 className="w-4 h-4" />
                        <span>Hear The Music</span>
                    </Link>
                    <Link
                        href="/videos"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-accent-cyan/50 bg-accent-cyan/10 py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent-cyan hover:bg-accent-cyan hover:text-black active:scale-[0.98] transition-colors"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Watch The Videos</span>
                    </Link>
                </nav>
            </div>
        </StreetBackdrop>
    );
}
