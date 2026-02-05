"use client";

import Link from "next/link";
import { Eye, Music, Video, DollarSign, TrendingUp, Play, BarChart3, Settings, Upload, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardStats {
    totalViews: number;
    viewsToday: number;
    tracksCount: number;
    videosCount: number;
    trackPlays: number;
    videoViews: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch analytics
                const analyticsRes = await fetch('/api/admin/analytics');
                const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

                // Fetch tracks
                const tracksRes = await fetch('/api/admin/music');
                const tracksData = tracksRes.ok ? await tracksRes.json() : { tracks: [] };

                // Fetch videos
                const videosRes = await fetch('/api/admin/videos');
                const videosData = videosRes.ok ? await videosRes.json() : { videos: [] };

                const tracks = tracksData.tracks || [];
                const videos = videosData.videos || [];

                setStats({
                    totalViews: analyticsData?.overview?.totalViews || 0,
                    viewsToday: analyticsData?.overview?.viewsToday || 0,
                    tracksCount: tracks.length,
                    videosCount: videos.length,
                    trackPlays: tracks.reduce((sum: number, t: { plays: number }) => sum + (t.plays || 0), 0),
                    videoViews: videos.reduce((sum: number, v: { views: number }) => sum + (v.views || 0), 0),
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        {
            title: "Total Page Views",
            value: stats?.totalViews?.toLocaleString() || "0",
            change: stats?.viewsToday ? `+${stats.viewsToday} today` : "Loading...",
            icon: Eye,
            color: "text-accent-cyan bg-accent-cyan/10"
        },
        {
            title: "Track Plays",
            value: stats?.trackPlays?.toLocaleString() || "0",
            change: `${stats?.tracksCount || 0} tracks`,
            icon: Play,
            color: "text-accent-magenta bg-accent-magenta/10"
        },
        {
            title: "Video Views",
            value: stats?.videoViews?.toLocaleString() || "0",
            change: `${stats?.videosCount || 0} videos`,
            icon: Video,
            color: "text-accent-gold bg-accent-gold/10"
        },
        {
            title: "Content",
            value: loading ? "..." : ((stats?.tracksCount || 0) + (stats?.videosCount || 0)).toString(),
            change: "Total uploads",
            icon: Upload,
            color: "text-green-400 bg-green-400/10"
        },
    ];

    const quickActions = [
        { title: "Music Manager", href: "/admin/music", icon: Music, description: "Manage tracks and albums" },
        { title: "Video Manager", href: "/admin/videos", icon: Video, description: "Manage videos and uploads" },
        { title: "Analytics", href: "/admin/analytics", icon: BarChart3, description: "View engagement metrics" },
        { title: "Settings", href: "/admin", icon: Settings, description: "Dashboard settings" },
    ];

    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-noir-ash text-sm">Welcome back! Here's your real-time stats.</p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4 animate-pulse">
                            <div className="w-10 h-10 bg-noir-slate rounded-lg mb-3" />
                            <div className="w-16 h-6 bg-noir-slate rounded mb-1" />
                            <div className="w-20 h-4 bg-noir-slate rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div key={stat.title} className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-noir-ash">{stat.title}</p>
                            <p className="text-xs text-noir-cloud mt-1">{stat.change}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-cyan" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="p-4 bg-noir-slate/50 rounded-lg hover:bg-noir-slate transition-colors group"
                        >
                            <action.icon className="w-6 h-6 text-accent-cyan mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-medium text-foreground">{action.title}</p>
                            <p className="text-xs text-noir-ash mt-1">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-magenta/10 border border-accent-cyan/20 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">📊 Real Data Only</h3>
                <p className="text-sm text-noir-cloud">
                    All statistics shown are organic and tracked in real-time. Page views include visitor country and city data.
                    Visit the Analytics page for detailed geographic breakdowns and engagement metrics.
                </p>
            </div>

            {/* Database Setup Reminder */}
            {!loading && stats?.totalViews === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                    <h3 className="font-semibold text-amber-500 mb-2">⚠️ Database Setup Required</h3>
                    <p className="text-sm text-noir-cloud mb-3">
                        Run the schema.sql file in your Supabase SQL editor to create the necessary tables for tracking analytics, tracks, and videos.
                    </p>
                    <code className="text-xs bg-noir-slate px-2 py-1 rounded text-accent-cyan">
                        supabase/schema.sql
                    </code>
                </div>
            )}
        </div>
    );
}
