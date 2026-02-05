import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse .env.local manually
const envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAlbums() {
    // Update all tracks that have null album to THE COMMISSION
    const { data, error } = await supabase
        .from('tracks')
        .update({ album: 'THE COMMISSION' })
        .is('album', null)
        .select();

    if (error) {
        console.error('Error updating albums:', error);
        return;
    }

    console.log(`Updated ${data?.length || 0} tracks to album "THE COMMISSION"`);

    // Show all tracks
    const { data: tracks } = await supabase
        .from('tracks')
        .select('title, album')
        .order('title');

    console.log('\nAll tracks:');
    tracks?.forEach(t => console.log(`  - ${t.title} (${t.album})`));
}

updateAlbums();
