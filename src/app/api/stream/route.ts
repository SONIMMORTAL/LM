import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyStreamToken } from '@/lib/stream-token';

// Never cache: every hit mints a fresh signed URL.
export const dynamic = 'force-dynamic';

// Long enough that seeking to the end of a ten-minute track still works on a
// link minted when playback started.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 2;

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('t');

    if (!token) {
        return new NextResponse('Missing token', { status: 400 });
    }

    const payload = verifyStreamToken(token);

    if (!payload) {
        return new NextResponse('Invalid or expired token', { status: 403 });
    }

    const { data, error } = await supabaseAdmin.storage
        .from(payload.bucket)
        .createSignedUrl(payload.path, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
        console.error(`Stream signing failed for ${payload.bucket}/${payload.path}:`, error);
        return new NextResponse('Not found', { status: 404 });
    }

    // 302 rather than proxying the bytes: Supabase serves the range requests
    // that <audio> seeking depends on, and we stay off the serverless egress.
    return NextResponse.redirect(data.signedUrl, {
        status: 302,
        headers: { 'Cache-Control': 'private, no-store' },
    });
}
