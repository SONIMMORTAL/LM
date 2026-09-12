import { SITE_URL } from "@/lib/site";
import { getTracks } from "@/lib/tracks-server";
import { MusicPageClient } from "@/components/music/MusicPageClient";
import type { Metadata } from "next";

// Catalogue is cached in tracks-server and revalidated on admin edits.
export const revalidate = 300;

export const metadata: Metadata = {
    title: "Music | Loaf Records — Official Releases",
    description: "Listen to the official discography of Shadow The Great and Loaf Records releases. Stream tracks, view official videos, and buy digital albums.",
    openGraph: {
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records DJ booth" },
        ],
        title: "Music | Loaf Records — Official Releases",
        description: "Official releases from Shadow The Great and Loaf Records. Stream catalog, buy digital downloads.",
        type: "website",
        siteName: "Loaf Records",
    },
};

export default async function MusicPage() {
    // Fetch tracks directly on the server
    const tracks = await getTracks();

    // MusicGroup JSON-LD for the artist hub
    const musicGroupJsonLd = {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        name: "Shadow The Great",
        url: `${SITE_URL}/music`,
        genre: ["Hip-Hop", "Rap", "East Coast"],
        description: "Shadow The Great is a Brooklyn-born recording artist, songwriter, and founder of Loaf Records.",
        foundingLocation: {
            "@type": "Place",
            name: "Brooklyn, New York",
        },
        member: {
            "@type": "Person",
            name: "Shadow The Great",
            roleName: "Lead Artist",
        },
        album: [
            { "@type": "MusicAlbum", name: "Lost City", url: `${SITE_URL}/music/lost-city` },
            { "@type": "MusicAlbum", name: "The Commission", url: `${SITE_URL}/music/the-commission` },
            { "@type": "MusicAlbum", name: "More Life", url: `${SITE_URL}/music/more-life` },
            { "@type": "MusicAlbum", name: "Live From The Dungeon", url: `${SITE_URL}/music/live-from-the-dungeon` },
        ],
        sameAs: [
            "https://www.youtube.com/@LoafRecords",
            "https://www.instagram.com/shadowthegreat",
        ],
    };

    return (
        <>
            {/* MusicGroup JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(musicGroupJsonLd) }}
            />
            <MusicPageClient initialTracks={tracks} />
        </>
    );
}
