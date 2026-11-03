/**
 * The albums with a page of their own at /music/<slug>: how each page looks, and the
 * release facts the structured data and /llms.txt give search engines. The songs
 * themselves come from the catalogue (lib/tracks-server); the tapes that only play as
 * full YouTube uploads are in lib/video-tapes.
 */

import { isFeatured, listNames } from "./crew.ts";
import { isCredited, trackCredits, type TrackCredits } from "./credits.ts";

export interface AlbumRelease {
    slug: string;
    /** Must match the `album` column in the catalogue exactly */
    name: string;
    /** Whose album it is, as shown on the page */
    artist: string;
    cover: string;
    gradient: string;
    accentColor: string;
    youtubeId?: string;
    price: number;
    /** ISO date, where it's on the record */
    released?: string;
    producer?: string;
    /** The release's own pages elsewhere */
    sameAs?: string[];
}

export const ALBUM_RELEASES: AlbumRelease[] = [
    {
        slug: "lost-city",
        name: "Lost City",
        artist: "Shadow The Great",
        cover: "/LC1.jpg",
        gradient: "from-blue-900/20 via-cyan-900/10 to-slate-900/20",
        accentColor: "cyan",
        price: 9.99,
        producer: "Ruggz",
    },
    {
        slug: "the-commission",
        name: "The Commission",
        artist: "Shadow The Great",
        cover: "/THE COMMISSION.png",
        gradient: "from-amber-500/20 via-orange-600/10 to-red-900/20",
        accentColor: "amber",
        price: 9.99,
    },
    {
        slug: "more-life",
        name: "More Life",
        artist: "Shadow The Great",
        cover: "/MORE LIFE VINYL.jpg",
        gradient: "from-rose-500/20 via-pink-600/10 to-purple-900/20",
        accentColor: "rose",
        price: 9.99,
    },
    {
        slug: "live-from-the-dungeon",
        name: "Live From The Dungeon",
        artist: "Loaf Muzik",
        cover: "/LFTD.jpg",
        gradient: "from-emerald-500/20 via-green-600/10 to-teal-900/20",
        accentColor: "emerald",
        price: 9.99,
        released: "2015-10-01",
        sameAs: ["https://loafmuzik.bandcamp.com/album/live-from-the-dungeon"],
    },
];

export function albumBySlug(slug: string): AlbumRelease | undefined {
    return ALBUM_RELEASES.find((album) => album.slug === slug.toLowerCase());
}

export function albumByName(name: string | null | undefined): AlbumRelease | undefined {
    return ALBUM_RELEASES.find((album) => album.name === name);
}

/** Enough of a catalogue row to credit it */
export interface CatalogueTrack {
    title: string;
    artist: string;
    album: string | null;
}

/** An album's songs in running order, with who's on each (leaving out anyone not to be featured) */
export function albumTrackCredits(album: AlbumRelease, tracks: CatalogueTrack[]): TrackCredits[] {
    // Loaf Muzik's album: its rows name Shadow The Great as the artist, and their titles say who's on them
    const albumArtist = album.artist === "Loaf Muzik" ? album.artist : undefined;
    return tracks
        .filter((track) => track.album === album.name)
        .map((track) => trackCredits(track, albumArtist))
        .map((song) => ({ ...song, featured: song.featured.filter(isFeatured) }));
}

/** Everyone on an album other than its own artist, most-credited first */
export function albumGuests(credits: TrackCredits[]): string[] {
    const counts = new Map<string, { name: string; count: number }>();
    for (const song of credits) {
        for (const name of song.featured) {
            const key = name.toLowerCase();
            const entry = counts.get(key) ?? { name, count: 0 };
            entry.count += 1;
            counts.set(key, entry);
        }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).map((entry) => entry.name);
}

/** The album page's description: who made it, who's on it and what's on it */
export function albumDescription(album: AlbumRelease, credits: TrackCredits[]): string {
    const year = album.released ? ` (${album.released.slice(0, 4)})` : "";
    const guests = albumGuests(credits).slice(0, 4);
    const withGuests = guests.length ? `, with ${listNames(guests)}` : "";
    const producer = album.producer ? ` Produced by ${album.producer}.` : "";
    const songs = credits.slice(0, 3).map((song) => song.title);
    const songList = songs.length ? ` ${credits.length} tracks including ${listNames(songs)}.` : "";
    return `${album.name}${year} by ${album.artist}${withGuests}.${producer}${songList} Stream it free and buy the download on Loaf Records.`;
}

/** One album as it touches an artist: all of it when it's theirs, or the songs they're on */
export interface ArtistAlbumCredit {
    album: AlbumRelease;
    /** Their own album */
    lead: boolean;
    songs: TrackCredits[];
    /** How many tracks the album has in all */
    total: number;
}

export function artistAlbumCredits(name: string, tracks: CatalogueTrack[]): ArtistAlbumCredit[] {
    const lower = name.toLowerCase();
    return ALBUM_RELEASES.flatMap((album) => {
        const credits = albumTrackCredits(album, tracks);
        const lead = album.artist.toLowerCase() === lower;
        const songs = lead ? credits : credits.filter((song) => isCredited(song, name));
        return songs.length ? [{ album, lead, songs, total: credits.length }] : [];
    });
}

/** Everyone they share songs with, most often first */
export function artistCollaborators(name: string, albums: ArtistAlbumCredit[]): string[] {
    const lower = name.toLowerCase();
    const counts = new Map<string, { name: string; count: number }>();
    const count = (who: string) => {
        const key = who.toLowerCase();
        if (key === lower) return;
        const entry = counts.get(key) ?? { name: who, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
    };
    for (const credit of albums) {
        if (credit.album.producer) count(credit.album.producer);
        for (const song of credit.songs) [song.main, ...song.featured].forEach(count);
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).map((entry) => entry.name);
}
