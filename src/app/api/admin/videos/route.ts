import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/supabase/admin-auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/admin';

// Extract YouTube ID from various URL formats
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/ // Just the ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isServiceRoleConfigured()) {
            return NextResponse.json({ error: 'Server configuration error: Service Role Key missing' }, { status: 500 });
        }

        const formData = await request.formData();
        const videoFile = formData.get('video') as File | null;
        const title = formData.get('title') as string;
        const youtubeUrl = formData.get('youtube_url') as string;
        const description = formData.get('description') as string;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        let videoUrl = null;
        let youtubeId = null;
        let thumbnailUrl = null;

        // Either YouTube URL or video file, YouTube preferred
        if (youtubeUrl) {
            youtubeId = extractYouTubeId(youtubeUrl);
            if (!youtubeId) {
                return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
            }
            thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
        } else if (videoFile && videoFile.size > 0) {
            // Upload video file using admin client
            const fileExt = videoFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('videos')
                .upload(filePath, videoFile, {
                    contentType: videoFile.type,
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return NextResponse.json({ error: 'Failed to upload video file. Ensure "videos" bucket exists.' }, { status: 500 });
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('videos')
                .getPublicUrl(filePath);

            videoUrl = publicUrl;
        } else {
            return NextResponse.json({ error: 'Either YouTube URL or video file is required' }, { status: 400 });
        }

        // Insert video record using admin client
        const { data, error } = await supabaseAdmin
            .from('videos')
            .insert([{
                title,
                youtube_id: youtubeId,
                video_url: videoUrl,
                description: description || null,
                thumbnail_url: thumbnailUrl,
            }])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to save video' }, { status: 500 });
        }

        return NextResponse.json({ success: true, video: data });
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

        // Public read is fine via standard client
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
        }

        return NextResponse.json({ videos: data });
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
            return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
        }

        // Use admin client for deletion
        const { error } = await supabaseAdmin
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
