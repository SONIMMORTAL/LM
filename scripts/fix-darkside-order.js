require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const desiredOrder = [
    "Mayne Tayne (prod. by Tuamie)",
    "Who is it (prod. by Tuamie)",
    "Locked up (feat. Rah Tha Ruler, Dj Ruggz)",
    "Hitmonlee (feat. AR Immortal)",
    "Break Bread (prod. by Tuamie)",
    "Song Cry (prod. by Just Blaze)",
    "Slow Jamz (prod. by Kanye West)",
    "Gun Hill Freestyle (feat. Casiel)",
    "Role (prod. by Grandpadre)",
    "Pootie (feat. AR Immortal & Rah Tha Ruler)",
    "Call Away (prod. by PEPITO)",
    "Bank Roll (prod. by PEPITO)",
    "30 Ball (feat. Rah Tha Ruler) [prod. by MIKI]",
    "The Fire (prod. by Kanye West)",
    "Neva Hurt U (prod. by Tuamie)",
    "Change (prod. by Coyote Beatz)"
];

async function fixOrder() {
    let date = new Date('2026-01-01T00:00:00Z');
    
    for (const title of desiredOrder) {
        const isoString = date.toISOString();
        const { error } = await supabase
            .from('tracks')
            .update({ created_at: isoString })
            .eq('album', 'Darkside')
            .eq('title', title);
        
        if (error) {
            console.error(`Failed to update ${title}:`, error);
        } else {
            console.log(`Updated ${title} -> ${isoString}`);
        }
        
        // increment by 1 minute
        date.setMinutes(date.getMinutes() + 1);
    }
    
    console.log("Done updating created_at for Darkside tracks.");
}
fixOrder();
