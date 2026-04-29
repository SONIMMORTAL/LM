require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    for (const album of ['Lord Knows', 'Munchies']) {
        const { data: dbTracks } = await supabase
            .from('tracks')
            .select('title')
            .eq('album', album)
            .order('created_at', { ascending: true });
        console.log(`\n--- ${album} ---`);
        dbTracks.forEach((t, i) => console.log(`${i + 1}. ${t.title}`));
    }
}
check();
