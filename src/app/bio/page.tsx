import Link from "next/link";
import { Music2, Play } from "lucide-react";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { StreetBackdrop } from "@/components/layout/StreetBackdrop";
import { ArtistBio } from "@/components/home/ArtistBio";

const DESCRIPTION =
    "Shadow The Great is an independent underground hip-hop artist, producer and director from Bushwick, Brooklyn — a psalm writer and the founder of Loaf Records. Live from The Dungeon to the world.";

export const metadata: Metadata = {
    alternates: { canonical: "/bio" },
    title: "Bio | Shadow The Great",
    description: DESCRIPTION,
    openGraph: {
        url: "/bio",
        images: [{ url: "/og/og-default.jpg", width: 1200, height: 630, alt: "Shadow The Great — Loaf Records" }],
        title: "Shadow The Great — Bio",
        description: DESCRIPTION,
        type: "profile",
        siteName: "Loaf Records",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: "Shadow The Great — Bio",
        description: DESCRIPTION,
    },
};

// Person structured data, built only from the facts on the page
const artistJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/bio#artist`,
    name: "Shadow The Great",
    url: `${SITE_URL}/bio`,
    description: DESCRIPTION,
    jobTitle: ["Hip-hop artist", "Producer", "Director"],
    homeLocation: { "@type": "Place", name: "Bushwick, Brooklyn, New York" },
    worksFor: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Loaf Records", url: SITE_URL },
};

export default function BioPage() {
    return (
        <StreetBackdrop>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(artistJsonLd) }}
            />
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
