import { cookies } from 'next/headers';

// Simple admin authentication using a password
// For production, consider using Supabase Auth with proper user management

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'loafrecords1@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shadow2026';
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TOKEN = 'authenticated';

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
    return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

// Keep for backwards compatibility
export async function verifyAdminPassword(password: string): Promise<boolean> {
    return password === ADMIN_PASSWORD;
}

export async function createAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function destroyAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session?.value === SESSION_TOKEN;
}
