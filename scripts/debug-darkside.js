require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: dbTracks } = await supabase.from('tracks').select('*').eq('album', 'Darkside');
    console.log("DB Tracks:", dbTracks ? dbTracks.length : 0);

    // List darkside bucket
    const { data: files } = await supabase.storage.from('darkside').list();
    if (files) {
        console.log("Storage Files:", files.map(f => f.name));
    } else {
        console.log("No files in darkside bucket");
    }
}
check();
