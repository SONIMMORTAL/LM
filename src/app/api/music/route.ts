
import { NextResponse } from 'next/server';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/admin';
import { ALBUMS } from '@/lib/albums';

interface Track {
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
    // Remove file extension
    const name = filename.replace(/\.(mp3|wav|m4a|ogg|flac)$/i, '');

    // Remove track number prefix (e.g., "1.", "2.", "01.", "10.")
    const withoutNumber = name.replace(/^\d+\.?\s*/, '').trim();

    // Check for " - " separator (artist - title or title - artist)
    if (withoutNumber.includes(' - ')) {
        const [part1, part2] = withoutNumber.split(' - ').map(s => s.trim());
        return { title: part1, artist: part2 || 'Shadow The Great' };
    }

    // Check for "feat." - everything after is the feature
    if (withoutNumber.toLowerCase().includes(' feat.') || withoutNumber.toLowerCase().includes(' feat ')) {
        const match = withoutNumber.match(/(.+?)\s+feat\.?\s*(.+)/i);
        if (match) {
            return {
                title: match[1].trim(),
                artist: `Shadow The Great feat. ${match[2].trim()}`
            };
        }
    }

    // Default: use the whole name as title
    return { title: withoutNumber, artist: 'Shadow The Great' };
}

// Fetch tracks from storage (fallback when database has no entries)
async function fetchTracksFromStorage(): Promise<Track[]> {
    const allTracks: Track[] = [];
    const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];

    // Helper to extract track number from filename
    const getTrackNumber = (filename: string): number => {
        const match = filename.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 999;
    };

    // Iterate through configured albums to fetch from correct buckets
    for (const album of Object.values(ALBUMS)) {
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

        // Sort files by track number numerically
        const sortedFiles = files
            .filter(file => {
                const ext = file.name.split('.').pop()?.toLowerCase();
                return ext && audioExtensions.includes(ext);
            })
            .sort((a, b) => getTrackNumber(a.name) - getTrackNumber(b.name));

        const tracks = sortedFiles.map((file, index) => {
            const { title, artist } = parseTrackName(file.name);

            // Construct the correct path for getPublicUrl
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
                album: album.name, // Ensure this matches frontend expected album names
                price: 1.00,
                plays: 0
            };
        });

        allTracks.push(...tracks);
    }

    return allTracks;
}

// Fetch tracks from storage for specific albums (used when DB is missing some albums)
async function fetchTracksFromStorageForAlbums(albumsToFetch: typeof ALBUMS[keyof typeof ALBUMS][]): Promise<Track[]> {
    const allTracks: Track[] = [];
    const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];

    // Helper to extract track number from filename
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

        // Sort files by track number numerically
        const sortedFiles = files
            .filter(file => {
                const ext = file.name.split('.').pop()?.toLowerCase();
                return ext && audioExtensions.includes(ext);
            })
            .sort((a, b) => getTrackNumber(a.name) - getTrackNumber(b.name));

        const tracks = sortedFiles.map((file, index) => {
            const { title, artist } = parseTrackName(file.name);

            // Construct the correct path for getPublicUrl
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

export async function GET() {
    try {
        if (!isServiceRoleConfigured()) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        // First, try to fetch tracks from the database
        const { data: dbTracks, error: dbError } = await supabaseAdmin
            .from('tracks')
            .select('*')
            .order('album', { ascending: true })
            .order('created_at', { ascending: true }); // Use created_at for track order

        if (dbError) {
            console.error('Database tracks error:', dbError);
            // Fall through to storage fallback
        }

        // Combine database tracks with storage tracks for albums missing from DB
        const allTracks: Track[] = [];

        // Helper to fix broken audio URLs (local paths instead of Supabase URLs)
        const fixAudioUrl = (url: string | null, albumName: string | null): string => {
            if (!url) return '';

            // If already a full URL, return as-is
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }

            // Lost City tracks have broken paths like "/LOST CITY/1.Desperado.wav"
            // Need to convert to Supabase URL from Music3 bucket
            if (albumName === 'Lost City' && url.includes('LOST CITY')) {
                // Extract just the filename
                const filename = url.split('/').pop() || '';
                // Convert .wav to .mp3 if needed (the bucket has .mp3 files)
                const mp3Filename = filename.replace(/\.wav$/i, '.mp3');
                return `https://bnjoouzcnxwdxcgcknoe.supabase.co/storage/v1/object/public/Music3/${encodeURIComponent(mp3Filename)}`;
            }

            // For other albums, try to construct URL from bucket config
            const albumConfig = Object.values(ALBUMS).find(a => a.name === albumName);
            if (albumConfig) {
                const filename = url.split('/').pop() || '';
                const filePath = albumConfig.path ? `${albumConfig.path}/${filename}` : filename;
                return `https://bnjoouzcnxwdxcgcknoe.supabase.co/storage/v1/object/public/${albumConfig.bucket}/${encodeURIComponent(filePath)}`;
            }

            return url;
        };

        // Add database tracks if available, fixing URLs
        // EXCLUDE Lost City from DB due to filename mismatches - always fetch from storage
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
        console.log(`Found ${formattedDbTracks.length} tracks in database (excluding Lost City)`);

        // Check which albums are missing from DB and fetch from storage
        // ALWAYS include Lost City to fetch from storage with correct filenames
        const dbAlbumNames = new Set(formattedDbTracks.map(t => t.album));
        const missingAlbums = Object.values(ALBUMS).filter(album =>
            !dbAlbumNames.has(album.name) || album.name === 'Lost City'
        );

        if (missingAlbums.length > 0) {
            console.log(`Fetching from storage: ${missingAlbums.map(a => a.name).join(', ')}`);
            const storageTracks = await fetchTracksFromStorageForAlbums(missingAlbums);
            console.log(`Found ${storageTracks.length} tracks in storage`);
            allTracks.push(...storageTracks);
        }

        return NextResponse.json({ tracks: allTracks });
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

