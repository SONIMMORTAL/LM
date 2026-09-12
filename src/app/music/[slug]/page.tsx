import { SITE_URL } from "@/lib/site";
import { getTracks } from "@/lib/tracks-server";
import { AlbumDetailsClient } from "@/components/music/AlbumDetailsClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Catalogue is cached in tracks-server and revalidated on admin edits.
export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string }>;
}

const ALBUM_METADATA: Record<string, {
    name: string;
    artist: string;
    cover: string;
    gradient: string;
    accentColor: string;
    youtubeId?: string;
    price: number;
}> = {
    "the-commission": {
        name: "The Commission",
        artist: "Shadow The Great",
        cover: "/THE COMMISSION.png",
        gradient: "from-amber-500/20 via-orange-600/10 to-red-900/20",
        accentColor: "amber",
        price: 9.99
    },
    "lost-city": {
        name: "Lost City",
        artist: "Shadow The Great",
        cover: "/LC1.jpg",
        gradient: "from-blue-900/20 via-cyan-900/10 to-slate-900/20",
        accentColor: "cyan",
        price: 9.99
    },
    "more-life": {
        name: "More Life",
        artist: "Shadow The Great",
        cover: "/MORE LIFE VINYL.jpg",
        gradient: "from-rose-500/20 via-pink-600/10 to-purple-900/20",
        accentColor: "rose",
        price: 9.99
    },
    "live-from-the-dungeon": {
        name: "Live From The Dungeon",
        artist: "Shadow The Great",
        cover: "/LFTD.jpg",
        gradient: "from-emerald-500/20 via-green-600/10 to-teal-900/20",
        accentColor: "emerald",
        price: 9.99
    }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const album = ALBUM_METADATA[slug.toLowerCase()];
    if (!album) return {};

    const title = `${album.name} | ${album.artist} — Loaf Records`;
    const description = `Listen to ${album.name} by ${album.artist} on Loaf Records. View official music videos, stream the tracklist, and buy digital album download.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: album.cover }],
            type: "music.album",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [album.cover],
        }
    };
}

export default async function AlbumReleasePage({ params }: PageProps) {
    const { slug } = await params;
    const album = ALBUM_METADATA[slug.toLowerCase()];
    if (!album) {
        notFound();
    }

    const allTracks = await getTracks();
    // Filter tracks by album name
    const albumTracks = allTracks.filter(t => t.album === album.name);

    // Formulate JSON-LD schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "MusicAlbum",
        "name": album.name,
        "image": `${SITE_URL}${album.cover}`, // fallback site domain
        "byArtist": {
            "@type": "MusicGroup",
            "name": album.artist
        },
        "numTracks": albumTracks.length,
        "offers": album.price > 0 ? {
            "@type": "Offer",
            "price": album.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": `${SITE_URL}/music/${slug}`
        } : undefined,
        "track": albumTracks.map((t, idx) => ({
            "@type": "MusicRecording",
            "name": t.title,
            "position": idx + 1,
            "byArtist": {
                "@type": "MusicGroup",
                "name": t.artist
            }
        }))
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Inject JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <AlbumDetailsClient
                albumName={album.name}
                artist={album.artist}
                cover={album.cover}
                gradient={album.gradient}
                accentColor={album.accentColor}
                youtubeId={album.youtubeId}
                price={album.price}
                tracks={albumTracks}
                allTracks={allTracks}
            />
        </div>
    );
}
