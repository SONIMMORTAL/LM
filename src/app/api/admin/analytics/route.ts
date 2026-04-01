import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/supabase/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }



        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Get total page views all time
        const { count: totalViews } = await supabaseAdmin
            .from('page_views')
            .select('*', { count: 'exact', head: true });

        // Get views today
        const { count: viewsToday } = await supabaseAdmin
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // Get views this month
        const { count: viewsThisMonth } = await supabaseAdmin
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thisMonth.toISOString());

        // Get views last month for comparison
        const { count: viewsLastMonth } = await supabaseAdmin
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', lastMonth.toISOString())
            .lt('created_at', thisMonth.toISOString());

        // Get country breakdown
        const { data: countryData } = await supabaseAdmin
            .from('page_views')
            .select('country, country_code')
            .not('country', 'is', null);

        // Count by country
        const countryCounts: Record<string, { count: number; code: string }> = {};
        countryData?.forEach((row: { country: string; country_code: string }) => {
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
        const { data: cityData } = await supabaseAdmin
            .from('page_views')
            .select('city, country')
            .not('city', 'is', null);

        const cityCounts: Record<string, { count: number; country: string }> = {};
        cityData?.forEach((row: { city: string; country: string }) => {
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
        const { data: pageData } = await supabaseAdmin
            .from('page_views')
            .select('page');

        const pageCounts: Record<string, number> = {};
        pageData?.forEach((row: { page: string }) => {
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

            const { count } = await supabaseAdmin
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

        // Get total video plays tracked on the site
        const { count: totalVideoPlays } = await supabaseAdmin
            .from('video_plays')
            .select('*', { count: 'exact', head: true });

        // Get video plays today
        const { count: videoPlaysToday } = await supabaseAdmin
            .from('video_plays')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // Get top played videos
        const { data: videoPlayData } = await supabaseAdmin
            .from('video_plays')
            .select('youtube_id, video_title');

        const videoPlayCounts: Record<string, { count: number; title: string }> = {};
        videoPlayData?.forEach((row: { youtube_id: string; video_title: string }) => {
            if (row.youtube_id) {
                if (!videoPlayCounts[row.youtube_id]) {
                    videoPlayCounts[row.youtube_id] = { count: 0, title: row.video_title || row.youtube_id };
                }
                videoPlayCounts[row.youtube_id].count++;
            }
        });

        const topVideos = Object.entries(videoPlayCounts)
            .map(([youtube_id, data]) => ({
                youtube_id,
                title: data.title,
                plays: data.count,
            }))
            .sort((a, b) => b.plays - a.plays)
            .slice(0, 10);

        // ─── Daily Page Views (last 30 days) ──────────────────────────
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: dailyViewsRaw } = await supabaseAdmin
            .from('page_views')
            .select('created_at')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const dailyViewCounts: Record<string, number> = {};
        dailyViewsRaw?.forEach((row: { created_at: string }) => {
            const day = row.created_at.substring(0, 10); // YYYY-MM-DD
            dailyViewCounts[day] = (dailyViewCounts[day] || 0) + 1;
        });

        const dailyViews = [];
        for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().substring(0, 10);
            dailyViews.push({
                date: key,
                label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                views: dailyViewCounts[key] || 0,
            });
        }

        // ─── Daily Video Plays (last 30 days) ────────────────────────
        const { data: dailyPlaysRaw } = await supabaseAdmin
            .from('video_plays')
            .select('created_at')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const dailyPlayCounts: Record<string, number> = {};
        dailyPlaysRaw?.forEach((row: { created_at: string }) => {
            const day = row.created_at.substring(0, 10);
            dailyPlayCounts[day] = (dailyPlayCounts[day] || 0) + 1;
        });

        const dailyPlays = [];
        for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().substring(0, 10);
            dailyPlays.push({
                date: key,
                label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                plays: dailyPlayCounts[key] || 0,
            });
        }

        // ─── Hourly Heatmap (page views by day-of-week x hour) ───────
        const heatmapData: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
        dailyViewsRaw?.forEach((row: { created_at: string }) => {
            const dt = new Date(row.created_at);
            const dow = dt.getUTCDay(); // 0=Sun
            const hour = dt.getUTCHours();
            heatmapData[dow][hour]++;
        });

        return NextResponse.json({
            overview: {
                totalViews: totalViews || 0,
                viewsToday: viewsToday || 0,
                viewsThisMonth: viewsThisMonth || 0,
                monthChange,
                totalVideoPlays: totalVideoPlays || 0,
                videoPlaysToday: videoPlaysToday || 0,
            },
            topCountries,
            topCities,
            topPages,
            topVideos,
            recentActivity,
            dailyViews,
            dailyPlays,
            heatmapData,
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
