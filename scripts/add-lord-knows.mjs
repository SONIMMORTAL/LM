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

async function addLordKnows() {
    const tracksToInsert = [
        { title: "Burly (prod. by Tuamie)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "Break Bread Freestyle (prod. by Tuamie)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "7 Oceans Freestyle (prod. by Tuamie)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "Archie (prod. by King illa)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "Corners (prod. by Coyote Beatz)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "Hustle Freestyle (feat. Rah Tha Ruler)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "Fountain Freestyle (feat. Rah Tha Ruler)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "Book of Doe Freestyle (prod. by Doe)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 },
        { title: "Freestyle (prod. by Pepito)", artist: "Shadow The Great", album: "Lord Knows", plays: 0 }
    ];

    const { data, error } = await supabase
        .from('tracks')
        .insert(tracksToInsert)
        .select();

    if (error) {
        console.error('Error inserting tracks:', error);
        return;
    }

    console.log(`Inserted ${data?.length || 0} tracks for album "Lord Knows"`);
}

addLordKnows();
