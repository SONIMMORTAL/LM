import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/supabase/admin-auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isServiceRoleConfigured()) {
            return NextResponse.json({ error: 'Server configuration error: Service Role Key missing' }, { status: 500 });
        }

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File | null;
        const title = formData.get('title') as string;
        const artist = formData.get('artist') as string;
        const duration = formData.get('duration') as string;
        const soundcloudUrl = formData.get('soundcloud_url') as string;
        const album = formData.get('album') as string;
        const price = formData.get('price') as string;

        if (!title || !artist) {
            return NextResponse.json({ error: 'Title and artist are required' }, { status: 400 });
        }

        let audioUrl = null;

        // Upload audio file if provided
        if (audioFile && audioFile.size > 0) {
            const fileExt = audioFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `tracks/${fileName}`;

            // Use supabaseAdmin to bypass RLS for upload
            const { error: uploadError } = await supabaseAdmin.storage
                .from('music')
                .upload(filePath, audioFile, {
                    contentType: audioFile.type,
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return NextResponse.json({ error: 'Failed to upload audio file. Ensure "music" bucket exists.' }, { status: 500 });
            }

            // Get public URL (standard client is fine for this if bucket is public)
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('music')
                .getPublicUrl(filePath);

            audioUrl = publicUrl;
        }

        // Insert track record using admin client
        const { data, error } = await supabaseAdmin
            .from('tracks')
            .insert([{
                title,
                artist,
                duration: duration || null,
                audio_url: audioUrl,
                soundcloud_url: soundcloudUrl || null,
                album: album || null,
                price: price ? parseFloat(price) : null,
            }])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to save track' }, { status: 500 });
        }

        return NextResponse.json({ success: true, track: data });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        if (!isSupabaseConfigured()) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        // Public read access is allowed via RLS, so generic client is fine
        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
        }

        return NextResponse.json({ tracks: data });
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isServiceRoleConfigured()) {
            return NextResponse.json({ error: 'Server configuration error: Service Role Key missing' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
        }

        // Use supabaseAdmin to bypass RLS
        const { error } = await supabaseAdmin
            .from('tracks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
