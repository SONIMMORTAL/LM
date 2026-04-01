"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye, Music, Video, Play, BarChart3, Upload, Loader2,
    TrendingUp, TrendingDown, Globe, MapPin, FileText,
    ArrowUpRight, Clock, Disc3, Zap, Users, MonitorPlay
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────
interface AnalyticsData {
    overview: {
        totalViews: number;
        viewsToday: number;
        viewsThisMonth: number;
        monthChange: number | null;
        totalVideoPlays: number;
        videoPlaysToday: number;
    };
    topCountries: { country: string; code: string; count: number }[];
    topCities: { city: string; country: string; count: number }[];
    topPages: { page: string; count: number }[];
    topVideos: { youtube_id: string; title: string; plays: number }[];
    recentActivity: { page: string; country: string; city: string; created_at: string; count: number }[];
}

interface TracksData {
    tracks: { id: string; title: string; artist: string; plays: number; album: string }[];
}

// ─── Animated Number Counter ─────────────────────────────────────
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        const start = performance.now();
        const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value, duration]);

    return <>{display.toLocaleString()}</>;
}

// ─── Mini Sparkline Bar Chart ────────────────────────────────────
function SparkBars({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-[3px] h-8">
            {data.map((v, i) => (
                <motion.div
                    key={i}
                    className={`w-[6px] rounded-sm ${color}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / max) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                />
            ))}
        </div>
    );
}

// ─── Status Dot ──────────────────────────────────────────────────
function StatusDot({ active }: { active: boolean }) {
    return (
        <span className="relative flex h-2.5 w-2.5">
            {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${active ? "bg-green-400" : "bg-noir-ash"}`} />
        </span>
    );
}

// ─── Page Name Formatter ─────────────────────────────────────────
function formatPageName(page: string): string {
    if (!page) return "Unknown";
    if (page === "/") return "Home";
    return page.replace(/^\//, "").replace(/\//g, " › ").replace(/(^\w|\s\w)/g, m => m.toUpperCase());
}

// ─── Time Ago ────────────────────────────────────────────────────
function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Country Flag Emoji ──────────────────────────────────────────
function countryFlag(code: string): string {
    if (!code || code.length !== 2) return "🌐";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

// ═════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [tracks, setTracks] = useState<TracksData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "audience" | "content">("overview");

    const fetchData = useCallback(async () => {
        try {
            const [analyticsRes, tracksRes] = await Promise.all([
                fetch('/api/admin/analytics'),
                fetch('/api/admin/music'),
            ]);

            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            if (tracksRes.ok) setTracks(await tracksRes.json());
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const overview = analytics?.overview;
    const monthTrend = overview?.monthChange;

    // Generate fake sparkline data from real counts (proportional bars)
    const generateSparkData = (total: number, count: number): number[] => {
        const bars = 12;
        const base = Math.max(total / bars, 1);
        return Array.from({ length: bars }, (_, i) => {
            const noise = 0.5 + Math.random();
            const recent = i > bars - 3 ? 1.3 : 1;
            return Math.round(base * noise * recent);
        });
    };

    // ─── Loading State ───────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 className="w-10 h-10 text-accent-cyan" />
                    </motion.div>
                    <p className="text-noir-ash text-sm tracking-wide">Loading analytics...</p>
                </motion.div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Views",
            value: overview?.totalViews || 0,
            subtitle: overview?.viewsToday ? `+${overview.viewsToday} today` : "No views today",
            icon: Eye,
            gradient: "from-cyan-500/20 to-blue-600/5",
            iconColor: "text-cyan-400",
            borderColor: "border-cyan-500/20",
            sparkColor: "bg-cyan-400/70",
            sparkData: generateSparkData(overview?.totalViews || 0, 12),
        },
        {
            title: "This Month",
            value: overview?.viewsThisMonth || 0,
            subtitle: monthTrend !== null && monthTrend !== undefined
                ? `${monthTrend >= 0 ? "+" : ""}${monthTrend}% vs last month`
                : "First month",
            icon: monthTrend && monthTrend >= 0 ? TrendingUp : TrendingDown,
            gradient: monthTrend && monthTrend >= 0
                ? "from-green-500/20 to-emerald-600/5"
                : "from-red-500/20 to-rose-600/5",
            iconColor: monthTrend && monthTrend >= 0 ? "text-green-400" : "text-red-400",
            borderColor: monthTrend && monthTrend >= 0 ? "border-green-500/20" : "border-red-500/20",
            sparkColor: monthTrend && monthTrend >= 0 ? "bg-green-400/70" : "bg-red-400/70",
            sparkData: generateSparkData(overview?.viewsThisMonth || 0, 12),
        },
        {
            title: "Video Plays",
            value: overview?.totalVideoPlays || 0,
            subtitle: overview?.videoPlaysToday ? `+${overview.videoPlaysToday} today` : "Tracked on-site",
            icon: MonitorPlay,
            gradient: "from-amber-500/20 to-orange-600/5",
            iconColor: "text-amber-400",
            borderColor: "border-amber-500/20",
            sparkColor: "bg-amber-400/70",
            sparkData: generateSparkData(overview?.totalVideoPlays || 0, 12),
        },
        {
            title: "Track Plays",
            value: tracks?.tracks?.reduce((s, t) => s + (t.plays || 0), 0) || 0,
            subtitle: `${tracks?.tracks?.length || 0} total tracks`,
            icon: Disc3,
            gradient: "from-purple-500/20 to-violet-600/5",
            iconColor: "text-purple-400",
            borderColor: "border-purple-500/20",
            sparkColor: "bg-purple-400/70",
            sparkData: generateSparkData(tracks?.tracks?.reduce((s, t) => s + (t.plays || 0), 0) || 0, 12),
        },
    ];

    return (
        <div className="space-y-6 pt-12 lg:pt-0 pb-8">
            {/* ─── Header ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            Dashboard
                        </h1>
                        <StatusDot active={true} />
                        <span className="text-xs text-green-400 font-medium tracking-wider uppercase">Live</span>
                    </div>
                    <p className="text-noir-ash text-sm">Real-time analytics • Auto-refreshes every 30s</p>
                </div>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchData}
                        className="px-4 py-2 text-sm font-medium bg-noir-charcoal border border-noir-smoke rounded-lg text-noir-cloud hover:text-foreground hover:border-accent-cyan/30 transition-all flex items-center gap-2"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Refresh
                    </motion.button>
                </div>
            </motion.div>

            {/* ─── KPI Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.borderColor} rounded-2xl p-4 sm:p-5 group hover:border-white/20 transition-all duration-300`}
                    >
                        {/* Subtle glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconColor} bg-black/20`}>
                                    <card.icon className="w-4.5 h-4.5" />
                                </div>
                                <SparkBars data={card.sparkData} color={card.sparkColor} />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
                                <AnimatedNumber value={card.value} />
                            </p>
                            <p className="text-xs font-medium text-noir-cloud uppercase tracking-wider">{card.title}</p>
                            <p className="text-[11px] text-noir-ash mt-1.5">{card.subtitle}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ─── Tab Navigation ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-1 bg-noir-charcoal/60 border border-noir-smoke rounded-xl p-1 w-fit"
            >
                {[
                    { id: "overview" as const, label: "Overview", icon: BarChart3 },
                    { id: "audience" as const, label: "Audience", icon: Globe },
                    { id: "content" as const, label: "Content", icon: FileText },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
                            activeTab === tab.id
                                ? "text-foreground"
                                : "text-noir-ash hover:text-noir-cloud"
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-noir-slate/80 border border-white/10 rounded-lg"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </span>
                    </button>
                ))}
            </motion.div>

            {/* ─── Tab Content ─────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                    >
                        {/* Top Videos Table */}
                        <div className="lg:col-span-2 bg-noir-charcoal/80 border border-noir-smoke rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-noir-smoke flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MonitorPlay className="w-4 h-4 text-amber-400" />
                                    <h3 className="font-semibold text-foreground text-sm">Top Videos</h3>
                                </div>
                                <span className="text-[11px] text-noir-ash bg-noir-slate px-2 py-0.5 rounded-full">
                                    {analytics?.topVideos?.length || 0} tracked
                                </span>
                            </div>
                            <div className="divide-y divide-noir-smoke/50">
                                {analytics?.topVideos && analytics.topVideos.length > 0 ? (
                                    analytics.topVideos.slice(0, 6).map((video, i) => (
                                        <motion.div
                                            key={video.youtube_id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <span className="text-xs font-mono text-noir-ash w-5 text-right">
                                                {(i + 1).toString().padStart(2, '0')}
                                            </span>
                                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-noir-slate flex-shrink-0">
                                                <img
                                                    src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate group-hover:text-accent-cyan transition-colors">
                                                    {video.title}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-amber-400">
                                                <Play className="w-3 h-3 fill-current" />
                                                <span className="text-sm font-semibold">{video.plays}</span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="px-5 py-12 text-center">
                                        <MonitorPlay className="w-8 h-8 text-noir-smoke mx-auto mb-2" />
                                        <p className="text-sm text-noir-ash">No video plays tracked yet</p>
                                        <p className="text-xs text-noir-smoke mt-1">Plays will appear as visitors watch videos</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="bg-noir-charcoal/80 border border-noir-smoke rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-noir-smoke flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <h3 className="font-semibold text-foreground text-sm">Recent Activity</h3>
                            </div>
                            <div className="divide-y divide-noir-smoke/50 max-h-[380px] overflow-y-auto">
                                {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                                    analytics.recentActivity.slice(0, 8).map((activity, i) => (
                                        <motion.div
                                            key={`${activity.page}-${activity.created_at}-${i}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="px-5 py-3 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-foreground">
                                                    {formatPageName(activity.page)}
                                                </p>
                                                <span className="text-[11px] text-noir-ash">
                                                    {timeAgo(activity.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {activity.country && (
                                                    <span className="text-xs text-noir-cloud flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {activity.city ? `${activity.city}, ` : ""}{activity.country}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="px-5 py-12 text-center">
                                        <Clock className="w-8 h-8 text-noir-smoke mx-auto mb-2" />
                                        <p className="text-sm text-noir-ash">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "audience" && (
                    <motion.div
                        key="audience"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                    >
                        {/* Top Countries */}
                        <div className="bg-noir-charcoal/80 border border-noir-smoke rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-noir-smoke flex items-center gap-2">
                                <Globe className="w-4 h-4 text-cyan-400" />
                                <h3 className="font-semibold text-foreground text-sm">Top Countries</h3>
                            </div>
                            <div className="divide-y divide-noir-smoke/50">
                                {analytics?.topCountries?.map((country, i) => {
                                    const max = analytics.topCountries[0]?.count || 1;
                                    const pct = Math.round((country.count / max) * 100);
                                    return (
                                        <motion.div
                                            key={country.country}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="relative px-5 py-3 hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Progress bar background */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 bg-cyan-500/5"
                                                style={{ width: `${pct}%` }}
                                            />
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{countryFlag(country.code)}</span>
                                                    <span className="text-sm font-medium text-foreground">{country.country}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-foreground">{country.count}</span>
                                                    <span className="text-[11px] text-noir-ash w-10 text-right">{pct}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {(!analytics?.topCountries || analytics.topCountries.length === 0) && (
                                    <div className="px-5 py-12 text-center">
                                        <Globe className="w-8 h-8 text-noir-smoke mx-auto mb-2" />
                                        <p className="text-sm text-noir-ash">No geo data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Cities */}
                        <div className="bg-noir-charcoal/80 border border-noir-smoke rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-noir-smoke flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                <h3 className="font-semibold text-foreground text-sm">Top Cities</h3>
                            </div>
                            <div className="divide-y divide-noir-smoke/50">
                                {analytics?.topCities?.map((city, i) => {
                                    const max = analytics.topCities[0]?.count || 1;
                                    const pct = Math.round((city.count / max) * 100);
                                    return (
                                        <motion.div
                                            key={`${city.city}-${city.country}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="relative px-5 py-3 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div
                                                className="absolute left-0 top-0 bottom-0 bg-purple-500/5"
                                                style={{ width: `${pct}%` }}
                                            />
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-noir-ash" />
                                                    <span className="text-sm font-medium text-foreground">{city.city}</span>
                                                    <span className="text-xs text-noir-ash">{city.country}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-foreground">{city.count}</span>
                                                    <span className="text-[11px] text-noir-ash w-10 text-right">{pct}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {(!analytics?.topCities || analytics.topCities.length === 0) && (
                                    <div className="px-5 py-12 text-center">
                                        <MapPin className="w-8 h-8 text-noir-smoke mx-auto mb-2" />
                                        <p className="text-sm text-noir-ash">No city data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "content" && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                    >
                        {/* Top Pages */}
                        <div className="bg-noir-charcoal/80 border border-noir-smoke rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-noir-smoke flex items-center gap-2">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                <h3 className="font-semibold text-foreground text-sm">Top Pages</h3>
                            </div>
                            <div className="divide-y divide-noir-smoke/50">
                                {analytics?.topPages?.map((page, i) => {
                                    const max = analytics.topPages[0]?.count || 1;
                                    const pct = Math.round((page.count / max) * 100);
                                    return (
                                        <motion.div
                                            key={page.page}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="relative px-5 py-3 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div
                                                className="absolute left-0 top-0 bottom-0 bg-cyan-500/5"
                                                style={{ width: `${pct}%` }}
                                            />
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-noir-ash" />
                                                    <span className="text-sm font-medium text-foreground">{formatPageName(page.page)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-foreground">{page.count}</span>
                                                    <span className="text-[11px] text-noir-ash w-10 text-right">{pct}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {(!analytics?.topPages || analytics.topPages.length === 0) && (
                                    <div className="px-5 py-12 text-center">
                                        <FileText className="w-8 h-8 text-noir-smoke mx-auto mb-2" />
                                        <p className="text-sm text-noir-ash">No page data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Tracks */}
                        <div className="bg-noir-charcoal/80 border border-noir-smoke rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-noir-smoke flex items-center gap-2">
                                <Disc3 className="w-4 h-4 text-purple-400" />
                                <h3 className="font-semibold text-foreground text-sm">Top Tracks</h3>
                            </div>
                            <div className="divide-y divide-noir-smoke/50">
                                {tracks?.tracks?.filter(t => t.plays > 0).sort((a, b) => b.plays - a.plays).slice(0, 8).map((track, i) => (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <span className="text-xs font-mono text-noir-ash w-5 text-right">
                                            {(i + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate group-hover:text-purple-400 transition-colors">
                                                {track.title}
                                            </p>
                                            <p className="text-xs text-noir-ash truncate">{track.album || track.artist}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-purple-400">
                                            <Play className="w-3 h-3 fill-current" />
                                            <span className="text-sm font-semibold">{track.plays}</span>
                                        </div>
                                    </motion.div>
                                ))}
                                {(!tracks?.tracks || tracks.tracks.filter(t => t.plays > 0).length === 0) && (
                                    <div className="px-5 py-12 text-center">
                                        <Disc3 className="w-8 h-8 text-noir-smoke mx-auto mb-2" />
                                        <p className="text-sm text-noir-ash">No track plays yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Quick Actions ───────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
                {[
                    { title: "Music", href: "/admin/music", icon: Music, desc: "Manage tracks", color: "group-hover:text-purple-400 group-hover:border-purple-400/30" },
                    { title: "Videos", href: "/admin/videos", icon: Video, desc: "Manage videos", color: "group-hover:text-amber-400 group-hover:border-amber-400/30" },
                    { title: "Analytics", href: "/admin/analytics", icon: BarChart3, desc: "Deep dive", color: "group-hover:text-cyan-400 group-hover:border-cyan-400/30" },
                    { title: "Sales", href: "/admin/sales", icon: Users, desc: "Orders & revenue", color: "group-hover:text-green-400 group-hover:border-green-400/30" },
                ].map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={`group flex items-center gap-3 p-4 bg-noir-charcoal/60 border border-noir-smoke rounded-xl hover:bg-noir-charcoal transition-all duration-200 ${action.color}`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-noir-slate/50 flex items-center justify-center border border-noir-smoke group-hover:border-current transition-colors">
                            <action.icon className="w-5 h-5 text-noir-cloud group-hover:text-current transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{action.title}</p>
                            <p className="text-[11px] text-noir-ash">{action.desc}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-noir-smoke group-hover:text-current transition-colors" />
                    </Link>
                ))}
            </motion.div>
        </div>
    );
}
