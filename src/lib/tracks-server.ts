import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/admin';
import { ALBUMS, AlbumConfig } from '@/lib/albums';
import { streamUrlFor } from '@/lib/stream-token';
import { VIDEO_TAPES, isVideoTapeAlbum } from '@/lib/video-tapes';

export interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string | null;
    audio_url: string;
    soundcloud_url: string | null;
    album: string | null;
    price: number | null;
    plays: number;
}

/** Cache tag for the track catalogue — see revalidateTracks(). */
export const TRACKS_CACHE_TAG = 'tracks';

const TRACKS_CACHE_SECONDS = 300;

const SUPABASE_PUBLIC_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
    : '';

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function parseTrackName(filename: string): { title: string; artist: string } {
    const name = filename.replace(/\.(mp3|wav|m4a|ogg|flac)$/i, '');
    const withoutNumber = name.replace(/^\d+\.?\s*/, '').trim();

    if (withoutNumber.includes(' - ')) {
        const [part1, part2] = withoutNumber.split(' - ').map(s => s.trim());
        return { title: part1, artist: part2 || 'Shadow The Great' };
    }

    if (withoutNumber.toLowerCase().includes(' feat.') || withoutNumber.toLowerCase().includes(' feat ')) {
        const match = withoutNumber.match(/(.+?)\s+feat\.?\s*(.+)/i);
        if (match) {
            return {
                title: match[1].trim(),
                artist: `Shadow The Great feat. ${match[2].trim()}`
            };
        }
    }

    return { title: withoutNumber, artist: 'Shadow The Great' };
}

async function fetchTracksFromStorageForAlbums(albumsToFetch: AlbumConfig[]): Promise<Track[]> {
    const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];

    const getTrackNumber = (filename: string): number => {
        const match = filename.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 999;
    };

    // One round-trip per album, all in flight at once. These used to run in a
    // sequential await loop, which put every album's latency on the critical
    // path of the music page render.
    const perAlbum = await Promise.all(albumsToFetch.map(async (album): Promise<Track[]> => {
        const { data: files, error: filesError } = await supabaseAdmin.storage
            .from(album.bucket)
            .list(album.path || undefined, {
                limit: 100,
            });

        if (filesError) {
            console.error(`Error fetching tracks for ${album.name}:`, filesError);
            return [];
        }

        if (!files || files.length === 0) {
            return [];
        }

        const sortedFiles = files
            .filter(file => {
                const ext = file.name.split('.').pop()?.toLowerCase();
                return ext && audioExtensions.includes(ext);
            })
            .sort((a, b) => getTrackNumber(a.name) - getTrackNumber(b.name));

        return sortedFiles.map((file, index) => {
            const { title, artist } = parseTrackName(file.name);
            const filePath = album.path ? `${album.path}/${file.name}` : file.name;

            return {
                id: file.id || `${album.id}-${index}`,
                title,
                artist,
                duration: null,
                audio_url: streamUrlFor(album.bucket, filePath),
                soundcloud_url: null,
                album: album.name,
                price: 1.00,
                plays: 0
            };
        });
    }));

    return perAlbum.flat();
}

/**
 * Resolve whatever the `tracks` table has stored in `audio_url` into a
 * streaming URL. Anything that points at our own Supabase storage goes through
 * the signed /api/stream route; genuinely external links (SoundCloud and the
 * like) are left as they are.
 */
function toStreamUrl(url: string | null, albumName: string | null): string {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
        if (SUPABASE_PUBLIC_PREFIX && url.startsWith(SUPABASE_PUBLIC_PREFIX)) {
            const rest = url.slice(SUPABASE_PUBLIC_PREFIX.length);
            const slash = rest.indexOf('/');
            if (slash > 0) {
                return streamUrlFor(
                    safeDecode(rest.slice(0, slash)),
                    safeDecode(rest.slice(slash + 1))
                );
            }
        }
        return url;
    }

    if (albumName === 'Lost City' && url.includes('LOST CITY')) {
        const filename = (url.split('/').pop() || '').replace(/\.wav$/i, '.mp3');
        return streamUrlFor('Music3', safeDecode(filename));
    }

    const albumConfig = Object.values(ALBUMS).find(a => a.name === albumName);
    if (albumConfig) {
        const filename = safeDecode(url.split('/').pop() || '');
        const filePath = albumConfig.path ? `${albumConfig.path}/${filename}` : filename;
        return streamUrlFor(albumConfig.bucket, filePath);
    }

    return url;
}

async function loadTracks(): Promise<Track[]> {
    try {
        if (!isServiceRoleConfigured()) {
            console.warn('Supabase service role is not configured');
            return [];
        }

        const { data: dbTracks, error: dbError } = await supabaseAdmin
            .from('tracks')
            .select('*')
            .order('album', { ascending: true })
            .order('created_at', { ascending: true });

        if (dbError) {
            console.error('Database tracks error:', dbError);
        }

        const allTracks: Track[] = [];

        const formattedDbTracks = (dbTracks || [])
            .filter(track => track.album !== 'Lost City')
            .map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist,
                duration: track.duration,
                audio_url: toStreamUrl(track.audio_url, track.album),
                soundcloud_url: track.soundcloud_url,
                album: track.album,
                price: track.price ? parseFloat(track.price) : null,
                plays: track.plays || 0
            }));

        allTracks.push(...formattedDbTracks);

        const dbAlbumNames = new Set(formattedDbTracks.map(t => t.album));
        const missingAlbums = Object.values(ALBUMS).filter(album =>
            !dbAlbumNames.has(album.name) || album.name === 'Lost City'
        );

        if (missingAlbums.length > 0) {
            const storageTracks = await fetchTracksFromStorageForAlbums(missingAlbums);
            allTracks.push(...storageTracks);
        }

        return allTracks;
    } catch (error) {
        console.error('getTracks server-side helper error:', error);
        return [];
    }
}

/**
 * The catalogue changes only when the admin edits it, so serve it from the
 * data cache rather than re-listing every storage bucket on each request.
 * Admin writes call revalidateTracks() to publish immediately.
 */
const getCachedTracks = unstable_cache(loadTracks, ['tracks-catalogue'], {
    revalidate: TRACKS_CACHE_SECONDS,
    tags: [TRACKS_CACHE_TAG],
});

/**
 * The playable catalogue: what the crate, the album pages and the page player
 * share. Their track indexes must line up, so they all read from here.
 *
 * Video tapes are left out — none of their rows has audio, so in the player's
 * list they were silent entries that next and shuffle could land on.
 */
export async function getTracks(): Promise<Track[]> {
    const tracks = await getCachedTracks();
    return tracks.filter((track) => !isVideoTapeAlbum(track.album));
}

/** Each video tape's track titles, in running order, keyed by album name. */
export async function getVideoTapeTracklists(): Promise<Record<string, string[]>> {
    const tracks = await getCachedTracks();
    return Object.fromEntries(
        VIDEO_TAPES.map((tape) => [
            tape.name,
            tracks.filter((track) => track.album === tape.name).map((track) => track.title),
        ])
    );
}

/** Publish admin catalogue edits without waiting for the cache window. */
export function revalidateTracks() {
    // Drop the cached catalogue, then the rendered pages built from it.
    revalidateTag(TRACKS_CACHE_TAG, 'max');
    revalidatePath('/music');
    revalidatePath('/music/[slug]', 'page');
    revalidatePath('/videos');
}
