/**
 * Releases that only exist as full-length YouTube uploads.
 *
 * Their tracklistings are in the `tracks` table, but no row has audio behind
 * it, so in the crate they could only show a list you couldn't play and a
 * button that sent you to the videos page anyway. They live on the videos page
 * instead, where the whole tape plays on the big screen.
 *
 * When a tape's audio files land in Supabase storage, delete its entry here and
 * add it to lib/albums.ts — it goes back in the crate and the page player, and
 * /music/<slug> stops redirecting.
 */
export interface VideoTape {
    /** The old /music/<slug> path, which now redirects to the videos page. */
    slug: string;
    /** Must match the `album` column in the tracks table exactly. */
    name: string;
    artist: string;
    cover: string;
    youtubeId: string;
}

export const VIDEO_TAPES: VideoTape[] = [
    {
        slug: "darkside",
        name: "Darkside",
        artist: "Shadow The Great",
        cover: "/darkside-cover.jpg",
        youtubeId: "6-9cYB0_E14",
    },
    {
        slug: "lord-knows",
        name: "Lord Knows",
        artist: "Shadow The Great",
        cover: "/lord-knows-cover.jpg",
        youtubeId: "QBaz7HbeJHk",
    },
    {
        slug: "munchies",
        name: "Munchies",
        artist: "Shadow The Great",
        cover: "/MUNCHIES COVER.jpeg",
        youtubeId: "rYld-JB5zLY",
    },
];

const TAPE_NAMES = new Set(VIDEO_TAPES.map((tape) => tape.name));

export function isVideoTapeAlbum(album: string | null | undefined): boolean {
    return !!album && TAPE_NAMES.has(album);
}
