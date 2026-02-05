import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/supabase/admin-auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
    try {
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isSupabaseConfigured()) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Get total page views all time
        const { count: totalViews } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true });

        // Get views today
        const { count: viewsToday } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // Get views this month
        const { count: viewsThisMonth } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thisMonth.toISOString());

        // Get views last month for comparison
        const { count: viewsLastMonth } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', lastMonth.toISOString())
            .lt('created_at', thisMonth.toISOString());

        // Get country breakdown
        const { data: countryData } = await supabase
            .from('page_views')
            .select('country, country_code')
            .not('country', 'is', null);

        // Count by country
        const countryCounts: Record<string, { count: number; code: string }> = {};
        countryData?.forEach((row) => {
            if (row.country) {
                if (!countryCounts[row.country]) {
                    countryCounts[row.country] = { count: 0, code: row.country_code || '' };
                }
                countryCounts[row.country].count++;
            }
        });

        const topCountries = Object.entries(countryCounts)
            .map(([country, data]) => ({
                country,
                code: data.code,
                count: data.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Get city breakdown
        const { data: cityData } = await supabase
            .from('page_views')
            .select('city, country')
            .not('city', 'is', null);

        const cityCounts: Record<string, { count: number; country: string }> = {};
        cityData?.forEach((row) => {
            if (row.city) {
                if (!cityCounts[row.city]) {
                    cityCounts[row.city] = { count: 0, country: row.country || '' };
                }
                cityCounts[row.city].count++;
            }
        });

        const topCities = Object.entries(cityCounts)
            .map(([city, data]) => ({
                city,
                country: data.country,
                count: data.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Get page breakdown
        const { data: pageData } = await supabase
            .from('page_views')
            .select('page');

        const pageCounts: Record<string, number> = {};
        pageData?.forEach((row) => {
            if (row.page) {
                pageCounts[row.page] = (pageCounts[row.page] || 0) + 1;
            }
        });

        const topPages = Object.entries(pageCounts)
            .map(([page, count]) => ({ page, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Get recent activity (last 7 days by day)
        const recentActivity: { date: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const { count } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', dayStart.toISOString())
                .lt('created_at', dayEnd.toISOString());

            recentActivity.push({
                date: dayStart.toISOString().split('T')[0],
                count: count || 0,
            });
        }

        // Calculate month-over-month change
        const monthChange = viewsLastMonth && viewsLastMonth > 0
            ? Math.round(((viewsThisMonth || 0) - viewsLastMonth) / viewsLastMonth * 100)
            : null;

        return NextResponse.json({
            overview: {
                totalViews: totalViews || 0,
                viewsToday: viewsToday || 0,
                viewsThisMonth: viewsThisMonth || 0,
                monthChange,
            },
            topCountries,
            topCities,
            topPages,
            recentActivity,
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
