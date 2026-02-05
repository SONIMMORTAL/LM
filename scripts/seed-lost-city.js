const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Simple env parser
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys via manual parsing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedLostCity() {
    const dir = path.join(process.cwd(), 'public/LOST CITY');
    if (!fs.existsSync(dir)) {
        console.error('Directory not found:', dir);
        return;
    }

    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.wav'));
    console.log(`Found ${files.length} tracks.`);

    const tracks = files.map(filename => {
        // Clean filename for title
        // Remove leading numbers and dots: "1.Desperado.wav" -> "Desperado"
        // Remove extension
        let title = filename
            .replace(/^\d+\./, '') // Remove "1."
            .replace(/\.wav$/i, '') // Remove extension
            .trim();

        // Handle "YOUNG " -> "YOUNG"

        return {
            title: title,
            artist: 'Shadow The Great',
            album: 'Lost City',
            // Use relative public URL. encodeURIComponent handles spaces.
            audio_url: `/LOST CITY/${encodeURIComponent(filename)}`,
            price: 1.00,
            plays: 0
        };
    });

    console.log('Tracks to insert:', tracks);

    // Delete existing tracks for this album to avoid duplicates
    const { error: deleteError } = await supabase
        .from('tracks')
        .delete()
        .eq('album', 'Lost City');

    if (deleteError) {
        console.error('Error deleting old tracks:', deleteError);
    }

    const { data, error } = await supabase
        .from('tracks')
        .insert(tracks)
        .select();

    if (error) {
        console.error('Error inserting tracks:', error);
    } else {
        console.log(`Successfully inserted ${data.length} tracks.`);
    }
}

seedLostCity();
