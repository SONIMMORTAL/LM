import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        if (!isSupabaseConfigured()) {
            return NextResponse.json({ error: 'Not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { youtube_id, video_title } = body;

        if (!youtube_id) {
            return NextResponse.json({ error: 'youtube_id is required' }, { status: 400 });
        }

        // Log the play event into video_plays table
        const { error } = await supabase
            .from('video_plays')
            .insert([{
                youtube_id,
                video_title: video_title || null,
            }]);

        if (error) {
            console.error('Failed to log video play:', error);
            return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Video play tracking error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
