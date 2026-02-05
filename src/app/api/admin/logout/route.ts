import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/supabase/admin-auth';

export async function POST() {
    await destroyAdminSession();
    return NextResponse.json({ success: true });
}
