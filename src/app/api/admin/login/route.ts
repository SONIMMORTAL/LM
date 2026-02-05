import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession } from '@/lib/supabase/admin-auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (await verifyAdminCredentials(email, password)) {
            await createAdminSession();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
