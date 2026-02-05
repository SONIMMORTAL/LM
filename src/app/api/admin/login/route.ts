import { NextResponse } from 'next/server';
import { verifyAdminPassword, createAdminSession } from '@/lib/supabase/admin-auth';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (await verifyAdminPassword(password)) {
            await createAdminSession();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
