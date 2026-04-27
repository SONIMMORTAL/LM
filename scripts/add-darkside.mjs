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

async function addDarkside() {
    const tracksToInsert = [
        { title: "Mayne Tayne (prod. by Tuamie)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Who is it (prod. by Tuamie)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Locked up (feat. Rah Tha Ruler, Dj Ruggz)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Hitmonlee (feat. AR Immortal)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Break Bread (prod. by Tuamie)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Song Cry (prod. by Just Blaze)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Slow Jamz (prod. by Kanye West)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Gun Hill Freestyle (feat. Casiel)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Role (prod. by Grandpadre)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Pootie (feat. AR Immortal & Rah Tha Ruler)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Call Away (prod. by PEPITO)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Bank Roll (prod. by PEPITO)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "30 Ball (feat. Rah Tha Ruler) [prod. by MIKI]", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "The Fire (prod. by Kanye West)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Neva Hurt U (prod. by Tuamie)", artist: "Shadow The Great", album: "Darkside", plays: 0 },
        { title: "Change (prod. by Coyote Beatz)", artist: "Shadow The Great", album: "Darkside", plays: 0 }
    ];

    const { data, error } = await supabase
        .from('tracks')
        .insert(tracksToInsert)
        .select();

    if (error) {
        console.error('Error inserting tracks:', error);
        return;
    }

    console.log(`Inserted ${data?.length || 0} tracks for album "Darkside"`);
}

addDarkside();
