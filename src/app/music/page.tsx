import { getTracks } from "@/lib/tracks-server";
import { MusicPageClient } from "@/components/music/MusicPageClient";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Music | Loaf Records — Official Releases",
    description: "Listen to the official discography of Shadow The Great and Loaf Records releases. Stream tracks, view official videos, and buy digital albums.",
    openGraph: {
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
        url: "https://loafrecords.com/music",
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
            { "@type": "MusicAlbum", name: "Lost City", url: "https://loafrecords.com/music/lost-city" },
            { "@type": "MusicAlbum", name: "The Commission", url: "https://loafrecords.com/music/the-commission" },
            { "@type": "MusicAlbum", name: "Darkside", url: "https://loafrecords.com/music/darkside" },
            { "@type": "MusicAlbum", name: "Munchies", url: "https://loafrecords.com/music/munchies" },
            { "@type": "MusicAlbum", name: "Lord Knows", url: "https://loafrecords.com/music/lord-knows" },
            { "@type": "MusicAlbum", name: "More Life", url: "https://loafrecords.com/music/more-life" },
            { "@type": "MusicAlbum", name: "Live From The Dungeon", url: "https://loafrecords.com/music/live-from-the-dungeon" },
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
