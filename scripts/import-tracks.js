// Import all tracks from Supabase Storage into the tracks database table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function parseTrackName(filename) {
    // Remove file extension
    const name = filename.replace(/\.(mp3|wav|m4a|ogg|flac)$/i, '');

    // Remove track number prefix (e.g., "1.", "2.", "01.", "10.")
    const withoutNumber = name.replace(/^\d+\.?\s*/, '').trim();

    // Check for " - " separator (TITLE - ARTIST)
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

async function importTracks() {
    console.log('Fetching tracks from storage...\n');

    // List all items at the root level of music bucket
    const { data: rootItems, error: rootError } = await supabase.storage
        .from('music')
        .list('', { limit: 100 });

    if (rootError) {
        console.error('Error listing root:', rootError);
        return;
    }

    const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];
    const tracksToInsert = [];

    // Process files at root level (id !== null means it's a file, not a folder)
    const rootFiles = rootItems.filter(item => item.id !== null);
    const audioFiles = rootFiles.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext && audioExtensions.includes(ext);
    });

    console.log(`Found ${audioFiles.length} audio files at root level:`);

    for (const file of audioFiles) {
        const { title, artist } = parseTrackName(file.name);

        // Get public URL - files are at root, no folder prefix
        const { data: { publicUrl } } = supabase.storage
            .from('music')
            .getPublicUrl(file.name);

        tracksToInsert.push({
            title,
            artist,
            album: 'The Commission',  // Default album name
            audio_url: publicUrl,
            price: 1.00,
            plays: 0
        });

        console.log(`  ✓ "${title}" by ${artist}`);
    }

    if (tracksToInsert.length === 0) {
        console.log('\nNo tracks to import!');
        return;
    }

    console.log(`\n\nImporting ${tracksToInsert.length} tracks to database...`);

    // First, clear existing tracks to avoid duplicates
    const { error: deleteError } = await supabase
        .from('tracks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.error('Error clearing existing tracks:', deleteError);
        return;
    }

    console.log('Cleared existing tracks.');

    // Insert all tracks
    const { data, error: insertError } = await supabase
        .from('tracks')
        .insert(tracksToInsert)
        .select();

    if (insertError) {
        console.error('Error inserting tracks:', insertError);
        return;
    }

    console.log(`\n✅ Successfully imported ${data.length} tracks!`);
    console.log('\nTracks in database:');
    data.forEach((t, i) => console.log(`  ${i + 1}. ${t.title} - ${t.artist} (${t.album})`));
}

importTracks().catch(console.error);
