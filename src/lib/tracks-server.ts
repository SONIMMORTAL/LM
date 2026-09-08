import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/admin';
import { ALBUMS, AlbumConfig } from '@/lib/albums';

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
    const allTracks: Track[] = [];
    const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];

    const getTrackNumber = (filename: string): number => {
        const match = filename.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 999;
    };

    for (const album of albumsToFetch) {
        console.log(`Fetching tracks for ${album.name} from bucket: ${album.bucket}, path: ${album.path || 'root'}`);

        const { data: files, error: filesError } = await supabaseAdmin.storage
            .from(album.bucket)
            .list(album.path || undefined, {
                limit: 100,
            });

        if (filesError) {
            console.error(`Error fetching tracks for ${album.name}:`, filesError);
            continue;
        }

        if (!files || files.length === 0) {
            console.log(`No files found for ${album.name}`);
            continue;
        }

        const sortedFiles = files
            .filter(file => {
                const ext = file.name.split('.').pop()?.toLowerCase();
                return ext && audioExtensions.includes(ext);
            })
            .sort((a, b) => getTrackNumber(a.name) - getTrackNumber(b.name));

        const tracks = sortedFiles.map((file, index) => {
            const { title, artist } = parseTrackName(file.name);
            const filePath = album.path ? `${album.path}/${file.name}` : file.name;

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from(album.bucket)
                .getPublicUrl(filePath);

            return {
                id: file.id || `${album.id}-${index}`,
                title,
                artist,
                duration: null,
                audio_url: publicUrl,
                soundcloud_url: null,
                album: album.name,
                price: 1.00,
                plays: 0
            };
        });

        allTracks.push(...tracks);
    }

    return allTracks;
}

export async function getTracks(): Promise<Track[]> {
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

        const fixAudioUrl = (url: string | null, albumName: string | null): string => {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }

            if (albumName === 'Lost City' && url.includes('LOST CITY')) {
                const filename = url.split('/').pop() || '';
                const mp3Filename = filename.replace(/\.wav$/i, '.mp3');
                return `https://bnjoouzcnxwdxcgcknoe.supabase.co/storage/v1/object/public/Music3/${encodeURIComponent(mp3Filename)}`;
            }

            const albumConfig = Object.values(ALBUMS).find(a => a.name === albumName);
            if (albumConfig) {
                const filename = url.split('/').pop() || '';
                const filePath = albumConfig.path ? `${albumConfig.path}/${filename}` : filename;
                return `https://bnjoouzcnxwdxcgcknoe.supabase.co/storage/v1/object/public/${albumConfig.bucket}/${encodeURIComponent(filePath)}`;
            }

            return url;
        };

        const formattedDbTracks = (dbTracks || [])
            .filter(track => track.album !== 'Lost City')
            .map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist,
                duration: track.duration,
                audio_url: fixAudioUrl(track.audio_url, track.album),
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
