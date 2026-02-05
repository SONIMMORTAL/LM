// Debug script to list all files in Supabase Storage
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllFiles() {
    console.log('Listing all files in music bucket...\n');

    // List root level
    const { data: root, error: rootError } = await supabase.storage
        .from('music')
        .list('', { limit: 100 });

    if (rootError) {
        console.error('Error listing root:', rootError);
        return;
    }

    console.log('Root level items:');
    root.forEach(item => {
        console.log(`  - ${item.name} (id: ${item.id}, metadata: ${JSON.stringify(item.metadata)})`);
    });

    // List each folder
    const folders = root.filter(f => f.id === null);
    console.log(`\nFound ${folders.length} folders`);

    for (const folder of folders) {
        console.log(`\n📁 ${folder.name}/`);

        const { data: files, error: filesError } = await supabase.storage
            .from('music')
            .list(folder.name, { limit: 100 });

        if (filesError) {
            console.error(`  Error: ${filesError.message}`);
            continue;
        }

        if (!files || files.length === 0) {
            console.log('  (empty)');
            continue;
        }

        files.forEach(file => {
            console.log(`  📄 ${file.name} (id: ${file.id})`);
        });
    }

    // Also try listing tracks folder if it exists
    console.log('\n📁 tracks/');
    const { data: tracks, error: tracksError } = await supabase.storage
        .from('music')
        .list('tracks', { limit: 100 });

    if (tracksError) {
        console.log(`  Error: ${tracksError.message}`);
    } else if (!tracks || tracks.length === 0) {
        console.log('  (empty or not found)');
    } else {
        tracks.forEach(file => {
            console.log(`  📄 ${file.name}`);
        });
    }
}

listAllFiles().catch(console.error);
