require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: dbTracks } = await supabase
        .from('tracks')
        .select('*')
        .eq('album', 'Darkside')
        .order('created_at', { ascending: true });
    
    dbTracks.forEach((t, i) => {
        console.log(`${i + 1}. ${t.title}`);
    });
}
check();
