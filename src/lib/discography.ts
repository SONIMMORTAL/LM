/**
 * The albums with a page of their own at /music/<slug>: how each page looks, and the
 * release facts the structured data and /llms.txt give search engines. The songs
 * themselves come from the catalogue (lib/tracks-server), except for albums that only
 * stream elsewhere, which carry their tracklist here; the tapes that only play as full
 * YouTube uploads are in lib/video-tapes.
 */

import { isFeatured, isListedCollaborator, listNames } from "./crew.ts";
import type { ReleaseId } from "./releases.ts";
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
    /** The album's bio, a paragraph each: shown on its page and given to search engines */
    about?: string[];
    /** Where else it streams, shown as buttons on its page */
    listen?: Array<{ service: string; url: string }>;
    /**
     * For an album that isn't in the catalogue (it streams elsewhere, not on the site):
     * its songs as the streaming services credit them
     */
    tracklist?: Array<{ title: string; artist: string }>;
    /**
     * An album sold through the site and delivered by hand (lib/releases): its page plays a
     * 20-second preview of each track, in tracklist order, and sells it name-your-price
     */
    sale?: { release: ReleaseId; previews: string[] };
}

const GOD_IS_GOOD_TRACKS = [
    "Rasclat (feat. Rah Tha Ruler)",
    "Chaka",
    "All Good Remix",
    "Bape",
    "Daniels Flute",
    "Crunch Time (feat. Oso Dope)",
    "Locked In",
    "Inna Lude",
    "Keys",
    "Hear You",
    "Da Light",
    "Fly",
    "Reign",
    "Archie Story",
    "Save The PPL",
    "Tomorrow (feat. AR Immortal)",
    "Adam",
    "Watch This",
    "Air",
];

/** The preview files in public/previews/god-is-good: "06-crunch-time.mp3" */
const previewFile = (title: string, index: number) =>
    `/previews/god-is-good/${String(index + 1).padStart(2, "0")}-${title
        .replace(/\s*\(feat\..*$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.mp3`;

export const ALBUM_RELEASES: AlbumRelease[] = [
    {
        slug: "god-is-good",
        name: "God Is Good",
        artist: "Shadow The Great",
        cover: "/god-is-good-cover.jpg",
        gradient: "from-sky-500/20 via-amber-200/10 to-blue-900/20",
        accentColor: "sky",
        price: 10,
        producer: "Ruggz",
        about: [
            "Shadow The Great's new album, produced by Ruggz: 19 tracks from Brooklyn, with Rah Tha Ruler, Oso Dope and AR Immortal. Hear 20 seconds of every song, then name your price for the whole thing, from $10.",
        ],
        tracklist: GOD_IS_GOOD_TRACKS.map((title) => ({ title, artist: "Shadow The Great" })),
        sale: { release: "god-is-good", previews: GOD_IS_GOOD_TRACKS.map(previewFile) },
    },
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
        cover: "/more-life-cover-hd.jpg",
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
        about: [
            "Loaf Muzik's 2015 album, out October 1, 2015: Shadow The Great and Oso Dope, featuring Kidaf, over beats from Mr Green, AMOTBEATS, Incrediible, Laron, Captain Mudd, Stew Bird, King illa, Brous One, Tuamie, pdp and JUJ.",
        ],
        listen: [
            { service: "Bandcamp", url: "https://loafmuzik.bandcamp.com/album/live-from-the-dungeon" },
            { service: "Spotify", url: "https://open.spotify.com/album/1652egIQXv7qWWDbee7hxv" },
            { service: "Apple Music", url: "https://music.apple.com/us/album/live-from-the-dungeon/1605916855" },
            { service: "Deezer", url: "https://www.deezer.com/album/288696892" },
        ],
    },
    {
        slug: "knowledge-born",
        name: "Knowledge Born",
        artist: "Loaf Muzik",
        cover: "/knowledge-born.jpg",
        gradient: "from-yellow-400/20 via-amber-600/10 to-zinc-900/20",
        accentColor: "amber",
        price: 0,
        released: "2017-10-09",
        about: [
            "Loaf Muzik's 2017 album with Kidz in Brooklyn, out October 9, 2017 on Loaf Records: 16 tracks from Shadow The Great and Oso Dope, featuring Kidaf, with King illa on the outro.",
        ],
        listen: [
            { service: "Spotify", url: "https://open.spotify.com/album/1ElII7EKuJzMGRKtbwwknU" },
            { service: "Apple Music", url: "https://music.apple.com/us/album/knowledge-born/1589804145" },
            { service: "Deezer", url: "https://www.deezer.com/album/264871342" },
        ],
        // As Spotify, Apple Music and Deezer credit them
        tracklist: [
            { title: "1865 (feat. Shine Sinatra, Shadow The Great & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Words You Heard (feat. Oso Dope & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Timeless (feat. Shadow The Great, Kidaf & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Toast to the suckas (feat. Kidaf, Shadow The Great & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Rollin (feat. Shine Sinatra, Kidaf & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "What We Have (feat. Shadow The Great, Oso Dope & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "The Message (feat. Oso Dope, Shadow The Great, Shine Sinatra, Kidaf & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Hustlin (feat. Shadow The Great, Oso Dope & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Autopsy (feat. Shadow The Great, Shine Sinatra, Oso Dope, Kidaf & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Stay Immortal (feat. Shine Sinatra & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Justice (feat. Shadow The Great, Kidaf, Oso Dope, Shine Sinatra & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Broadway Junction (feat. Shadow The Great & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Old Earth (feat. Shadow The Great, Oso Dope, Kidaf, Shine Sinatra & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Born to be King (feat. Shadow The Great, Shine Sinatra, Kidaf, Oso Dope & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Man Down (feat. Shine Sinatra & Kidz in Brooklyn)", artist: "Loaf Muzik" },
            { title: "Outro (feat. King illa)", artist: "Loaf Muzik" },
        ],
    },
];

/** The album's pages elsewhere, for search engines */
export function albumSameAs(album: AlbumRelease): string[] {
    return (album.listen ?? []).map((link) => link.url);
}

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
    const rows = album.tracklist ?? tracks.filter((track) => track.album === album.name);
    return rows
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
    const where = album.sale
        ? " Hear 20-second previews and name your price, from $10, on Loaf Records."
        : album.tracklist
          ? ` Listen on ${listNames((album.listen ?? []).map((link) => link.service))}.`
          : " Stream it free and buy the download on Loaf Records.";
    return `${album.name}${year} by ${album.artist}${withGuests}.${producer}${songList}${where}`;
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
        if (key === lower || !isListedCollaborator(who)) return;
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
