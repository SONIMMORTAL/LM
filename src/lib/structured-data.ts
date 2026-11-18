/**
 * The schema.org entities search engines and AI answer engines read off every page: the
 * label, the collective, its members and the albums. Each has one @id wherever it
 * appears, so the pages add up to one connected picture rather than a pile of strangers
 * who share a name. Built from lib/crew and lib/discography, the same facts the pages show.
 */

import { absoluteUrl } from "./site.ts";
import {
    CREW,
    LOAF_FAQ,
    LOAF_MUZIK,
    LOAF_RECORDS,
    PRESS,
    crewMemberPath,
    findCrewMember,
    type CrewMember,
} from "./crew.ts";
import { albumSameAs, type AlbumRelease } from "./discography.ts";
import type { TrackCredits } from "./credits.ts";

type Node = Record<string, unknown>;

export const ORGANIZATION_ID = absoluteUrl("/#organization");
export const WEBSITE_ID = absoluteUrl("/#website");
export const LOAF_MUZIK_ID = absoluteUrl("/bio#loaf-muzik");

export function personId(member: CrewMember): string {
    return absoluteUrl(member.hasPage ? `/artists/${member.slug}#person` : `/bio#${member.slug}`);
}

export function albumId(album: AlbumRelease): string {
    return absoluteUrl(`/music/${album.slug}#album`);
}

const ref = (id: string) => ({ "@id": id });

/** A credited name: the crew's own entity when it's one of them, a plain name otherwise */
export function artistRef(name: string): Node {
    if (name.toLowerCase() === LOAF_MUZIK.name.toLowerCase()) return ref(LOAF_MUZIK_ID);
    const member = findCrewMember(name);
    return member ? ref(personId(member)) : { "@type": "Person", name };
}

const place = (name: string) => ({ "@type": "Place", name });

export function organizationNode(): Node {
    return {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: LOAF_RECORDS.name,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/loaf-records-logo.png"),
        description: LOAF_RECORDS.summary,
        founder: CREW.filter((member) => member.founder).map((member) => ref(personId(member))),
        foundingLocation: place(LOAF_RECORDS.location),
        sameAs: LOAF_RECORDS.sameAs,
    };
}

export function websiteNode(): Node {
    return {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: LOAF_RECORDS.name,
        alternateName: ["Loaf Records — Home of Loaf Muzik", "loafrecords.shop"],
        url: absoluteUrl("/"),
        inLanguage: "en-US",
        publisher: ref(ORGANIZATION_ID),
        about: [ref(ORGANIZATION_ID), ref(LOAF_MUZIK_ID)],
    };
}

export function loafMuzikNode(albums: AlbumRelease[] = []): Node {
    return {
        "@type": "MusicGroup",
        "@id": LOAF_MUZIK_ID,
        name: LOAF_MUZIK.name,
        alternateName: LOAF_MUZIK.alternateNames,
        url: absoluteUrl("/bio"),
        description: LOAF_MUZIK.summary,
        genre: LOAF_MUZIK.genres,
        foundingLocation: place(LOAF_MUZIK.location),
        member: CREW.map((member) => ref(personId(member))),
        ...(albums.length ? { album: albums.map((album) => ref(albumId(album))) } : {}),
        sameAs: LOAF_MUZIK.sameAs,
        subjectOf: PRESS.map((article) => ({
            "@type": "Article",
            headline: article.title,
            url: article.url,
            publisher: { "@type": "Organization", name: article.outlet },
        })),
    };
}

export function personNode(member: CrewMember): Node {
    return {
        "@type": "Person",
        "@id": personId(member),
        name: member.name,
        ...(member.alternateNames.length ? { alternateName: member.alternateNames } : {}),
        url: absoluteUrl(crewMemberPath(member)),
        description: member.summary,
        jobTitle: member.roles,
        ...(member.homeLocation ? { homeLocation: place(member.homeLocation) } : {}),
        memberOf: [ref(LOAF_MUZIK_ID), ...(member.founder ? [ref(ORGANIZATION_ID)] : [])],
        ...(member.founder ? { worksFor: ref(ORGANIZATION_ID) } : {}),
        ...(member.sameAs.length ? { sameAs: member.sameAs } : {}),
    };
}

/** Everyone: the label, the collective and each member */
export function crewGraph(albums: AlbumRelease[] = []): Node[] {
    return [organizationNode(), loafMuzikNode(albums), ...CREW.map(personNode)];
}

export function albumNode(album: AlbumRelease, songs: TrackCredits[]): Node {
    const url = absoluteUrl(`/music/${album.slug}`);
    return {
        "@type": "MusicAlbum",
        "@id": albumId(album),
        name: album.name,
        url,
        image: absoluteUrl(encodeURI(album.cover)),
        byArtist: artistRef(album.artist),
        recordLabel: ref(ORGANIZATION_ID),
        albumReleaseType: "https://schema.org/AlbumRelease",
        genre: LOAF_MUZIK.genres,
        ...(album.released ? { datePublished: album.released } : {}),
        ...(album.producer ? { producer: artistRef(album.producer) } : {}),
        ...(album.about ? { description: album.about.join(" ") } : {}),
        ...(album.listen ? { sameAs: albumSameAs(album) } : {}),
        numTracks: songs.length,
        track: {
            "@type": "ItemList",
            numberOfItems: songs.length,
            itemListElement: songs.map((song, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "MusicRecording",
                    name: song.title,
                    byArtist: [song.main, ...song.featured].map(artistRef),
                    inAlbum: ref(albumId(album)),
                    url,
                },
            })),
        },
        ...(album.price > 0
            ? {
                  offers: {
                      "@type": "Offer",
                      price: album.price,
                      priceCurrency: "USD",
                      availability: "https://schema.org/InStock",
                      url,
                  },
              }
            : {}),
    };
}

export function faqNode(id: string): Node {
    return {
        "@type": "FAQPage",
        "@id": id,
        mainEntity: LOAF_FAQ.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
    };
}

/** Home › … › this page */
export function breadcrumbNode(trail: Array<{ name: string; path: string }>): Node {
    return {
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
        })),
    };
}

/** For a <script type="application/ld+json">: safe to drop into the HTML as it is */
export function jsonLd(nodes: Node[]): string {
    return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
