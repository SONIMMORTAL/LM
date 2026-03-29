import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface GeoLocation {
    country: string;
    countryCode: string;
    city: string;
    regionName: string;
}

async function getGeoLocation(ip: string): Promise<GeoLocation | null> {
    // Don't lookup private/localhost IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return null;
    }

    try {
        // Using ip-api.com (free tier: 45 requests/minute)
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,regionName,city`);
        if (!res.ok) return null;

        const data = await res.json();
        if (data.status === 'fail') return null;

        return {
            country: data.country || 'Unknown',
            countryCode: data.countryCode || '',
            city: data.city || 'Unknown',
            regionName: data.regionName || '',
        };
    } catch (error) {
        console.error('Geo lookup failed:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!isSupabaseConfigured()) {
            return NextResponse.json({ error: 'Not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { page, referrer } = body;

        if (!page) {
            return NextResponse.json({ error: 'Page is required' }, { status: 400 });
        }

        // Get client IP
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';

        // Get user agent
        const userAgent = request.headers.get('user-agent') || '';

        // Get geo location
        const geo = await getGeoLocation(ip);

        // Insert page view
        const { error } = await supabase
            .from('page_views')
            .insert([{
                page,
                country: geo?.country || null,
                country_code: geo?.countryCode || null,
                city: geo?.city || null,
                region: geo?.regionName || null,
                ip: ip !== 'unknown' ? ip : null,
                user_agent: userAgent || null,
                referrer: referrer || null,
            }]);

        if (error) {
            console.error('Failed to track page view:', error);
            return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
