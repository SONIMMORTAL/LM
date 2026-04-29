require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const desiredOrder = [
    "Ahhh Haa",
    "Waves",
    "4 Dilla (prod. by Tuamie)",
    "Brownsvillan (prod. by Tuamie)",
    "Runnin",
    "Full Court Press",
    "Set it Off",
    "Zoot",
    "Peace (prod. by Tuamie)"
];

async function fixOrder() {
    let date = new Date('2026-01-01T02:00:00Z');
    
    for (const title of desiredOrder) {
        const isoString = date.toISOString();
        const { error } = await supabase
            .from('tracks')
            .update({ created_at: isoString })
            .eq('album', 'Munchies')
            .eq('title', title);
        
        if (error) {
            console.error(`Failed to update ${title}:`, error);
        } else {
            console.log(`Updated ${title} -> ${isoString}`);
        }
        
        // increment by 1 minute
        date.setMinutes(date.getMinutes() + 1);
    }
    
    console.log("Done updating created_at for Munchies tracks.");
}
fixOrder();
