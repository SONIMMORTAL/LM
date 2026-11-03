import { getTracks } from "@/lib/tracks-server";
import { AlbumDetailsClient } from "@/components/music/AlbumDetailsClient";
import { albumBySlug, albumDescription, albumTrackCredits } from "@/lib/discography";
import { LOAF_MUZIK, crewMemberPath, findCrewMember } from "@/lib/crew";
import { albumNode, breadcrumbNode, jsonLd, loafMuzikNode, personNode } from "@/lib/structured-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Catalogue is cached in tracks-server and revalidated on admin edits.
export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string }>;
}

/** Where the album's artist name links: their page, or the collective's bio */
function artistPath(artist: string): string | undefined {
    if (artist === LOAF_MUZIK.name) return "/bio";
    const member = findCrewMember(artist);
    return member ? crewMemberPath(member) : undefined;
}

function artistNode(artist: string) {
    if (artist === LOAF_MUZIK.name) return [loafMuzikNode()];
    const member = findCrewMember(artist);
    return member ? [personNode(member)] : [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const album = albumBySlug(slug);
    if (!album) return {};

    const songs = albumTrackCredits(album, await getTracks().catch(() => []));
    const title = `${album.name} | ${album.artist} — Loaf Records`;
    const description = albumDescription(album, songs);

    return {
        title: { absolute: title },
        description,
        alternates: { canonical: `/music/${album.slug}` },
        openGraph: {
            url: `/music/${album.slug}`,
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
    const album = albumBySlug(slug);
    if (!album) {
        notFound();
    }

    const allTracks = await getTracks();
    const albumTracks = allTracks.filter(t => t.album === album.name);
    const songs = albumTrackCredits(album, albumTracks);

    // The album, everyone on it and where it sits in the site, for search engines
    const structuredData = jsonLd([
        albumNode(album, songs),
        ...artistNode(album.artist),
        breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Music", path: "/music" },
            { name: album.name, path: `/music/${album.slug}` },
        ]),
    ]);

    return (
        <div className="min-h-screen pt-24 pb-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

            <AlbumDetailsClient
                albumName={album.name}
                artist={album.artist}
                artistHref={artistPath(album.artist)}
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
