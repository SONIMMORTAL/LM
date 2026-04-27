import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function addMunchies() {
    const tracksToInsert = [
        { title: "Ahhh Haa", artist: "Shadow The Great", album: "Munchies", plays: 0 },
        { title: "Waves", artist: "Rah Tha Ruler", album: "Munchies", plays: 0 },
        { title: "4 Dilla (prod. by Tuamie)", artist: "Shadow The Great", album: "Munchies", plays: 0 },
        { title: "Brownsvillan (prod. by Tuamie)", artist: "Shadow The Great & Gallo", album: "Munchies", plays: 0 },
        { title: "Runnin", artist: "AR Immortal", album: "Munchies", plays: 0 },
        { title: "Full Court Press", artist: "Shadow The Great, AR, Rah, Rell", album: "Munchies", plays: 0 },
        { title: "Set it Off", artist: "Rah Tha Ruler", album: "Munchies", plays: 0 },
        { title: "Zoot", artist: "Shadow The Great", album: "Munchies", plays: 0 },
        { title: "Peace (prod. by Tuamie)", artist: "Shadow The Great", album: "Munchies", plays: 0 }
    ];

    const { data, error } = await supabase
        .from('tracks')
        .insert(tracksToInsert)
        .select();

    if (error) {
        console.error('Error inserting tracks:', error);
        return;
    }

    console.log(`Inserted ${data?.length || 0} tracks for album "Munchies"`);
}

addMunchies();
