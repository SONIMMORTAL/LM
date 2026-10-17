require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const desiredTracks = [
    {
        id: '84d97152-4350-4c84-ab1c-9a94df42efbe',
        title: 'Intro (feat. Coyote Beatz & Nathan Morais)',
        artist: 'Shadow The Great',
    },
    {
        id: 'cbd44bad-fc8d-4fde-97d9-0a9948c8f9cd',
        title: 'Chess (feat. King illa)',
        artist: 'Shadow The Great',
    },
    {
        id: 'fb53bc4c-32bd-4f6e-903c-c6c1cb23dc64',
        title: 'Pray (feat. King illa)',
        artist: 'Shadow The Great',
    },
    {
        id: 'f9091000-4273-437c-9224-6b1b3dbf5b64',
        title: 'Juice (feat. Grandpadre & Kid Sanchez)',
        artist: 'Shadow The Great',
    },
    {
        id: '0c866637-bfa0-49cf-8345-caf420a423f4',
        title: 'Live and Direct (feat. Grandpadre & Laron)',
        artist: 'Shadow The Great',
    },
    {
        id: '5b66a551-fd7b-4cd2-a1b7-659236eba304',
        title: 'Drop Gems (feat. Coyote Beatz)',
        artist: 'Shadow The Great',
    },
    {
        id: '23507047-30cc-468c-ac1a-8ab76cb3b16b',
        title: 'Whoa (feat. Coyote Beatz)',
        artist: 'Shadow The Great',
    },
    {
        id: '9c5ec0ce-4b3f-424f-bddf-c7c45bfeab87',
        title: 'Abel (feat. Rah Tha Ruler & Gradis Nice)',
        artist: 'Shadow The Great',
    },
    {
        id: 'f30da024-41a3-4979-875b-93fd1a40597f',
        title: 'Hands High (feat. Rah Tha Ruler & Gradis Nice)',
        artist: 'Shadow The Great',
    },
    {
        id: '3cc43ff0-1327-403f-ac7e-f3e4d3f7587e',
        title: 'interlude for God (feat. Grandpadre & Coyote Beatz)',
        artist: 'Shadow The Great',
    },
    {
        id: '6bad3b52-9b98-48c9-bbdb-d90dd9117b83',
        title: 'Reject (feat. King illa)',
        artist: 'Shadow The Great',
    },
    {
        id: 'efcb8387-80d0-46a3-b90b-be98768a3fb2',
        title: 'Words from the wise (feat. Rah Tha Ruler & King illa)',
        artist: 'Shadow The Great',
    },
    {
        id: 'd2fffbb5-fc50-4652-9136-500b2692acf6',
        title: 'Gucciyanna (feat. Kollie)',
        artist: 'Shadow The Great',
    },
];

async function fixCommissionOrder() {
    let date = new Date('2026-01-01T00:00:00Z');

    for (const track of desiredTracks) {
        const isoString = date.toISOString();
        const { error } = await supabase
            .from('tracks')
            .update({
                title: track.title,
                artist: track.artist,
                album: 'The Commission',
                created_at: isoString,
            })
            .eq('id', track.id);

        if (error) {
            console.error(`Failed to update ${track.title}:`, error);
        } else {
            console.log(`Updated ${track.title} -> ${isoString}`);
        }

        date.setMinutes(date.getMinutes() + 1);
    }

    console.log('Done updating titles, artists, and created_at for The Commission tracks.');
}

fixCommissionOrder();
