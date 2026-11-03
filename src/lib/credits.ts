/**
 * Who's on a song, read from the catalogue's titles and artist fields. The catalogue
 * writes features two ways: in the title, "Abel (feat. Rah Tha Ruler & Gradis Nice)", or in
 * the artist, "Shadow The Great feat. Grandpadre , Paydro". This pulls both apart into
 * a clean title and a list of names, so a song can be found by anyone on it.
 */

import { isFeatured, listNames } from "./crew.ts";

export interface TrackCredits {
    /** The title with the feature credit taken out */
    title: string;
    /** Whose song it is */
    main: string;
    /** Everyone else credited, in the order given */
    featured: string[];
}

const FEAT_IN_TITLE = /\s*[([]\s*(?:feat\.?|ft\.?|featuring)\s+([^)\]]+)[)\]]/i;
const FEAT_IN_ARTIST = /^(.*?)\s+(?:feat\.?|ft\.?|featuring)\s+(.+)$/i;

function splitNames(list: string): string[] {
    return list
        .split(/\s*(?:,|&|\s+and\s+|\s+x\s+)\s*/i)
        .map((name) => name.replace(/^[.\s]+|[.\s]+$/g, ""))
        .filter(Boolean);
}

function sameName(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * @param albumArtist When the album belongs to someone other than the track's artist
 * field (Live From The Dungeon is Loaf Muzik's, though its rows say Shadow The Great),
 * the album's artist is the main one and the title's feature list says who's on it.
 */
export function trackCredits(track: { title: string; artist: string }, albumArtist?: string): TrackCredits {
    // "- Proceed" → "Proceed": some rows keep the dash from their file name
    let title = track.title.replace(/^[-–—\s]+/, "").trim();
    const names: string[] = [];

    const inTitle = title.match(FEAT_IN_TITLE);
    if (inTitle) {
        names.push(...splitNames(inTitle[1]));
        title = title.replace(FEAT_IN_TITLE, "").replace(/\s{2,}/g, " ").trim();
    }

    let main = track.artist.trim();
    const inArtist = main.match(FEAT_IN_ARTIST);
    if (inArtist) {
        main = inArtist[1].trim();
        names.push(...splitNames(inArtist[2]));
    }
    if (albumArtist) main = albumArtist;

    const featured: string[] = [];
    for (const name of names) {
        if (!sameName(name, main) && !featured.some((seen) => sameName(seen, name))) featured.push(name);
    }
    return { title, main, featured };
}

/** Whether a name is credited on the song, as its artist or a feature */
export function isCredited(credits: TrackCredits, name: string): boolean {
    return sameName(credits.main, name) || credits.featured.some((featured) => sameName(featured, name));
}

/** "Abel (feat. Rah Tha Ruler & Gradis Nice)", tidied */
export function creditedTitle(credits: TrackCredits): string {
    if (credits.featured.length === 0) return credits.title;
    return `${credits.title} (feat. ${listNames(credits.featured)})`;
}

/**
 * A catalogue row as the site shows it: anyone not to be featured (lib/crew NOT_FEATURED)
 * taken out of its feature credits, and the rest of the title left as it was. The rows
 * themselves keep every name; only what the site serves changes.
 */
export function withoutUnfeatured<T extends { title: string; artist: string }>(track: T): T {
    const title = track.title.replace(FEAT_IN_TITLE, (credit: string, list: string) => {
        const names = splitNames(list);
        const kept = names.filter(isFeatured);
        if (kept.length === names.length) return credit;
        return kept.length ? ` (feat. ${listNames(kept)})` : "";
    });

    let artist = track.artist;
    const inArtist = artist.match(FEAT_IN_ARTIST);
    if (inArtist) {
        const names = splitNames(inArtist[2]);
        const kept = names.filter(isFeatured);
        if (kept.length !== names.length) artist = kept.length ? `${inArtist[1]} feat. ${kept.join(", ")}` : inArtist[1];
    }

    return title === track.title && artist === track.artist ? track : { ...track, title: title.trim(), artist };
}
