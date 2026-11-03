import Link from "next/link";
import { notFound } from "next/navigation";
import { Music2, Play } from "lucide-react";
import type { Metadata } from "next";
import { StreetBackdrop } from "@/components/layout/StreetBackdrop";
import { ArtistProfile } from "@/components/artists/ArtistProfile";
import { CREW, crewMemberBySlug, listNames } from "@/lib/crew";
import { artistAlbumCredits, artistCollaborators } from "@/lib/discography";
import { absoluteUrl } from "@/lib/site";
import {
    WEBSITE_ID,
    breadcrumbNode,
    jsonLd,
    loafMuzikNode,
    organizationNode,
    personId,
    personNode,
} from "@/lib/structured-data";
import { getTracks, getVideoTapeTracklists } from "@/lib/tracks-server";
import { VIDEO_TAPES } from "@/lib/video-tapes";
import { getChannelUploads } from "@/lib/youtube-feed";

// Catalogue and channel feed are both cached upstream
export const revalidate = 300;
export const dynamicParams = false;

interface PageProps {
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
    return CREW.filter((member) => member.hasPage).map((member) => ({ slug: member.slug }));
}

function pageMember(slug: string) {
    const member = crewMemberBySlug(slug);
    return member?.hasPage ? member : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const member = pageMember((await params).slug);
    if (!member) return {};

    const albums = artistAlbumCredits(member.name, await getTracks().catch(() => []));
    const songs = albums.filter((credit) => !credit.lead).flatMap((credit) => credit.songs.map((song) => song.title));
    const own = albums.filter((credit) => credit.lead).map((credit) => credit.album.name);
    const hear = own.length
        ? ` Albums: ${listNames(own)}.`
        : songs.length
          ? ` Hear ${member.name} on ${listNames([...songs.slice(0, 4), "more"])}.`
          : "";
    const title = `${member.name} — Loaf Muzik | Loaf Records`;
    const description = `${member.summary}${hear}`;
    const path = `/artists/${member.slug}`;

    return {
        title: { absolute: title },
        description,
        alternates: { canonical: path },
        openGraph: {
            url: path,
            title,
            description,
            type: "profile",
            siteName: "Loaf Records",
            images: [{ url: "/og/og-default.jpg", width: 1200, height: 630, alt: `${member.name}, Loaf Muzik` }],
        },
        twitter: { card: "summary_large_image", title, description, images: ["/og/og-default.jpg"] },
    };
}

export default async function ArtistPage({ params }: PageProps) {
    const member = pageMember((await params).slug);
    if (!member) notFound();

    const [tracks, uploads, tapeTracklists] = await Promise.all([
        getTracks().catch(() => []),
        getChannelUploads(),
        getVideoTapeTracklists().catch(() => ({}) as Record<string, string[]>),
    ]);

    const albums = artistAlbumCredits(member.name, tracks);
    const tapes = VIDEO_TAPES.filter((tape) => tape.artist === member.name).map((tape) => ({
        ...tape,
        trackCount: tapeTracklists[tape.name]?.length ?? 0,
    }));
    const name = member.name.toLowerCase();
    const videos = uploads.filter((upload) => upload.title.toLowerCase().includes(name)).slice(0, 8);
    const collaborators = artistCollaborators(member.name, albums).slice(0, 18);

    const path = `/artists/${member.slug}`;
    const structuredData = jsonLd([
        {
            "@type": "ProfilePage",
            "@id": absoluteUrl(`${path}#page`),
            url: absoluteUrl(path),
            name: `${member.name} — Loaf Muzik`,
            isPartOf: { "@id": WEBSITE_ID },
            mainEntity: { "@id": personId(member) },
        },
        personNode(member),
        loafMuzikNode(),
        organizationNode(),
        breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Loaf Muzik", path: "/bio" },
            { name: member.name, path },
        ]),
    ]);

    return (
        <StreetBackdrop>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
            <div className="min-h-screen pt-24 pb-16">
                <ArtistProfile
                    member={member}
                    albums={albums}
                    tapes={tapes}
                    videos={videos}
                    collaborators={collaborators}
                />

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
