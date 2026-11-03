import { getTracks } from "@/lib/tracks-server";
import { MusicPageClient } from "@/components/music/MusicPageClient";
import { ALBUM_RELEASES } from "@/lib/discography";
import { LOAF_MUZIK, SHADOW_THE_GREAT } from "@/lib/crew";
import { absoluteUrl } from "@/lib/site";
import {
    LOAF_MUZIK_ID,
    WEBSITE_ID,
    albumId,
    artistRef,
    jsonLd,
    loafMuzikNode,
    personId,
    personNode,
} from "@/lib/structured-data";
import type { Metadata } from "next";

// Catalogue is cached in tracks-server and revalidated on admin edits.
export const revalidate = 300;

const TITLE = "Music — Shadow The Great & Loaf Muzik Albums";
const DESCRIPTION =
    "Stream every album from Shadow The Great and Loaf Muzik: Lost City, The Commission, More Life and Live From The Dungeon, with Oso Dope, Rah Tha Ruler, King illa and Grandpadre. Buy the downloads on Loaf Records.";

export const metadata: Metadata = {
    alternates: { canonical: "/music" },
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
        url: "/music",
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "The Loaf Records DJ booth" },
        ],
        title: `${TITLE} | Loaf Records`,
        description: DESCRIPTION,
        type: "website",
        siteName: "Loaf Records",
    },
};

// The discography as one list, each album pointing at its own page
const structuredData = jsonLd([
    {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/music#page"),
        url: absoluteUrl("/music"),
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        about: [{ "@id": personId(SHADOW_THE_GREAT) }, { "@id": LOAF_MUZIK_ID }],
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: ALBUM_RELEASES.length,
            itemListElement: ALBUM_RELEASES.map((album, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "MusicAlbum",
                    "@id": albumId(album),
                    name: album.name,
                    url: absoluteUrl(`/music/${album.slug}`),
                    byArtist: artistRef(album.artist),
                },
            })),
        },
    },
    personNode(SHADOW_THE_GREAT),
    loafMuzikNode(ALBUM_RELEASES.filter((album) => album.artist === LOAF_MUZIK.name)),
]);

export default async function MusicPage() {
    // Fetch tracks directly on the server
    const tracks = await getTracks();

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
            <MusicPageClient initialTracks={tracks} />
        </>
    );
}
