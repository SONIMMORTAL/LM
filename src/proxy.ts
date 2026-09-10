import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next 16 renamed `middleware.ts` to `proxy.ts`. This file MUST live inside
 * `src/` because the project uses a src directory — a copy at the repo root is
 * silently ignored, which is how the /admin gate below went unenforced.
 *
 * Security headers are NOT set here. They live in next.config.ts `headers()`
 * so they also cover static assets, which this matcher deliberately skips.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Gate /admin behind the admin session cookie, but never the login page
    // itself or there would be no way in.
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const session = request.cookies.get('admin_session');

        if (session?.value !== 'authenticated') {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
