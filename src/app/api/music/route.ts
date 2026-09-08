import { NextResponse } from 'next/server';
import { getTracks } from '@/lib/tracks-server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const tracks = await getTracks();
        return NextResponse.json({ tracks });
    } catch (error) {
        console.error('API music route error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
