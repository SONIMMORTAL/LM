require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const desiredOrder = [
    "Burly (prod. by Tuamie)",
    "Break Bread Freestyle (prod. by Tuamie)",
    "7 Oceans Freestyle (prod. by Tuamie)",
    "Archie (prod. by King illa)",
    "Corners (prod. by Coyote Beatz)",
    "Hustle Freestyle (feat. Rah Tha Ruler)",
    "Fountain Freestyle (feat. Rah Tha Ruler)",
    "Book of Doe Freestyle (prod. by Doe)",
    "Freestyle (prod. by Pepito)"
];

async function fixOrder() {
    let date = new Date('2026-01-01T01:00:00Z');
    
    for (const title of desiredOrder) {
        const isoString = date.toISOString();
        const { error } = await supabase
            .from('tracks')
            .update({ created_at: isoString })
            .eq('album', 'Lord Knows')
            .eq('title', title);
        
        if (error) {
            console.error(`Failed to update ${title}:`, error);
        } else {
            console.log(`Updated ${title} -> ${isoString}`);
        }
        
        // increment by 1 minute
        date.setMinutes(date.getMinutes() + 1);
    }
    
    console.log("Done updating created_at for Lord Knows tracks.");
}
fixOrder();
