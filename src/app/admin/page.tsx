"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye, Music, Video, Play, BarChart3, Loader2,
    TrendingUp, TrendingDown, Globe, MapPin, FileText,
    ArrowUpRight, Clock, Disc3, Zap, Users, MonitorPlay,
    RefreshCw, Activity
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

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
    dailyViews: { date: string; label: string; views: number }[];
    dailyPlays: { date: string; label: string; plays: number }[];
    heatmapData: number[][];
}

interface TracksData {
    tracks: { id: string; title: string; artist: string; plays: number; album: string }[];
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

// ── Animated Counter ─────────────────────────────────────────────
function AnimCounter({ value, duration = 900 }: { value: number; duration?: number }) {
    const [display, setDisplay] = React.useState(0);
    React.useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [value, duration]);
    return <>{display.toLocaleString()}</>;
}

// ── Status Dot ───────────────────────────────────────────────────
function StatusDot({ status }: { status: "online" | "warning" | "error" }) {
    const colors = { online: "bg-green-400", warning: "bg-amber-400", error: "bg-red-400" };
    return (
        <span className="relative flex h-2 w-2">
            {status === "online" && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`} />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[status]}`} />
        </span>
    );
}

// ── Gauge ────────────────────────────────────────────────────────
function Gauge({ value, max = 100, label, size = 100, color = "var(--accent-cyan, #00ffd0)" }: {
    value: number; max?: number; label: string; size?: number; color?: string;
}) {
    const pct = Math.min(value / max, 1);
    const r = (size - 12) / 2;
    const circumference = Math.PI * r; // half-circle
    const offset = circumference * (1 - pct);

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
                {/* Background arc */}
                <path
                    d={`M 6,${size / 2 + 4} A ${r},${r} 0 0,1 ${size - 6},${size / 2 + 4}`}
                    fill="none" stroke="currentColor" strokeWidth="8" className="text-noir-smoke/30"
                />
                {/* Value arc */}
                <path
                    d={`M 6,${size / 2 + 4} A ${r},${r} 0 0,1 ${size - 6},${size / 2 + 4}`}
                    fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
                <text x={size / 2} y={size / 2 - 2} textAnchor="middle" className="text-foreground font-bold" style={{ fontSize: size / 5 }} fill="currentColor">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </text>
            </svg>
            <span className="text-[10px] font-mono uppercase tracking-widest text-noir-ash">{label}</span>
        </div>
    );
}

// ── Progress Bar ─────────────────────────────────────────────────
function ProgressBar({ value, label, color = "bg-accent-cyan" }: { value: number; label: string; color?: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
                <span className="text-noir-cloud font-medium">{label}</span>
                <span className="font-mono text-noir-ash">{value}%</span>
            </div>
            <div className="h-1.5 bg-noir-smoke/30 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(value, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
}

// ── Heatmap ──────────────────────────────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];

function HeatmapGrid({ data }: { data: number[][] }) {
    const flat = data.flat();
    const max = Math.max(...flat, 1);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[500px]">
                {/* Column labels */}
                <div className="flex ml-10 mb-1">
                    {HOURS.map(h => (
                        <div key={h} className="flex-1 text-center text-[9px] font-mono text-noir-ash">{h}</div>
                    ))}
                </div>
                {data.map((row, dow) => (
                    <div key={dow} className="flex items-center gap-1 mb-[2px]">
                        <span className="w-8 text-right text-[10px] font-mono text-noir-ash pr-1">{DAYS[dow]}</span>
                        <div className="flex flex-1 gap-[2px]">
                            {/* Group 24 hours into 12 (pairs of 2) */}
                            {Array.from({ length: 12 }, (_, i) => {
                                const val = (row[i * 2] || 0) + (row[i * 2 + 1] || 0);
                                const intensity = val / (max * 2 || 1);
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 h-5 rounded-sm transition-colors"
                                        style={{
                                            backgroundColor: intensity > 0
                                                ? `rgba(0, 255, 208, ${0.1 + intensity * 0.8})`
                                                : "rgba(255,255,255,0.03)"
                                        }}
                                        title={`${DAYS[dow]} ${HOURS[i]}: ${val} views`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Custom Chart Tooltip ─────────────────────────────────────────
function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-noir-charcoal border border-noir-smoke rounded-lg px-3 py-2 shadow-xl">
            <p className="text-[11px] text-noir-ash mb-1 font-mono">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-semibold text-foreground">
                    {p.dataKey === "views" ? "Views" : "Plays"}: <span className="text-accent-cyan">{p.value.toLocaleString()}</span>
                </p>
            ))}
        </div>
    );
}

// ── Helpers ──────────────────────────────────────────────────────
function formatPageName(page: string): string {
    if (!page) return "Unknown";
    if (page === "/") return "Home";
    return page.replace(/^\//, "").replace(/\//g, " › ").replace(/(^\w|\s\w)/g, m => m.toUpperCase());
}

function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function countryFlag(code: string): string {
    if (!code || code.length !== 2) return "🌐";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

export default function AdminDashboard() {
    const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
    const [tracks, setTracks] = React.useState<TracksData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchData = React.useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [analyticsRes, tracksRes] = await Promise.all([
                fetch('/api/admin/analytics'),
                fetch('/api/admin/music'),
            ]);
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            if (tracksRes.ok) setTracks(await tracksRes.json());
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    React.useEffect(() => { fetchData(); }, [fetchData]);
    React.useEffect(() => {
        const interval = setInterval(() => fetchData(), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const o = analytics?.overview;
    const totalTracks = tracks?.tracks?.length || 0;
    const totalTrackPlays = tracks?.tracks?.reduce((s, t) => s + (t.plays || 0), 0) || 0;

    // ── Loading ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
                    <p className="text-noir-ash text-xs font-mono uppercase tracking-widest">Initializing dashboard...</p>
                </motion.div>
            </div>
        );
    }

    /* ── Metric Row Data ── */
    const metrics = [
        { label: "Total Views", value: o?.totalViews || 0, change: o?.viewsToday ? `+${o.viewsToday}` : "0", up: true, icon: Eye },
        { label: "This Month", value: o?.viewsThisMonth || 0, change: o?.monthChange !== null && o?.monthChange !== undefined ? `${o.monthChange >= 0 ? "+" : ""}${o.monthChange}%` : "—", up: (o?.monthChange || 0) >= 0, icon: BarChart3 },
        { label: "Video Plays", value: o?.totalVideoPlays || 0, change: o?.videoPlaysToday ? `+${o.videoPlaysToday}` : "0", up: true, icon: MonitorPlay },
        { label: "Track Plays", value: totalTrackPlays, change: `${totalTracks} tracks`, up: true, icon: Disc3 },
    ];

    /* ── Content engagement % (for progress bars) ── */
    const topPageTotal = analytics?.topPages?.reduce((s, p) => s + p.count, 0) || 1;
    const topPagePcts = analytics?.topPages?.slice(0, 5).map(p => ({
        label: formatPageName(p.page),
        value: Math.round((p.count / topPageTotal) * 100),
    })) || [];

    return (
        <div className="space-y-6 pt-12 lg:pt-0 pb-8">

            {/* ══ Header + Uplink Bar ══════════════════════════════════ */}
            <div className="rounded-lg border border-accent-cyan/20 bg-accent-cyan/5 px-4 py-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                <span className="text-accent-cyan/60">Loaf Records // Command Center v2.0</span>
                <div className="flex items-center gap-3">
                    <span className="text-accent-cyan/40 hidden sm:inline">Sector: Brooklyn-HQ</span>
                    <div className="flex items-center gap-1.5">
                        <StatusDot status="online" />
                        <span className="text-green-400">Online</span>
                    </div>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
                    <p className="text-noir-ash text-xs font-mono mt-1">Real-time analytics • Auto-refreshes every 30s</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-noir-charcoal border border-noir-smoke rounded-lg text-noir-cloud hover:text-foreground hover:border-accent-cyan/30 transition-all flex items-center gap-2 disabled:opacity-50 w-fit"
                >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Syncing..." : "Refresh"}
                </motion.button>
            </motion.div>

            {/* ══ Metric Row ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative overflow-hidden rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-4 group hover:border-accent-cyan/20 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                                <m.icon className="w-4 h-4 text-accent-cyan" />
                            </div>
                            <span className={`text-[11px] font-mono font-semibold ${m.up ? "text-green-400" : "text-red-400"}`}>
                                {m.change}
                            </span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-0.5">
                            <AnimCounter value={m.value} />
                        </p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-noir-ash">{m.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ══ Charts Section ═══════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Area Chart — Page Views */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-5 relative overflow-hidden"
                >
                    <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,208,0.015)_2px,rgba(0,255,208,0.015)_4px)]" />
                    <h3 className="relative z-10 mb-4 font-mono text-[10px] uppercase tracking-widest text-noir-ash flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-accent-cyan" />
                        Page Views — Last 30 Days
                    </h3>
                    <div className="relative z-10 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.dailyViews || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ffd0" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00ffd0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={35} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="views" stroke="#00ffd0" strokeWidth={2} fill="url(#viewsGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Bar Chart — Video Plays */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    className="rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-5 relative overflow-hidden"
                >
                    <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,186,0,0.012)_2px,rgba(255,186,0,0.012)_4px)]" />
                    <h3 className="relative z-10 mb-4 font-mono text-[10px] uppercase tracking-widest text-noir-ash flex items-center gap-2">
                        <MonitorPlay className="w-3.5 h-3.5 text-amber-400" />
                        Video Plays — Last 30 Days
                    </h3>
                    <div className="relative z-10 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.dailyPlays || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="plays" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* ══ Data Table + Activity Feed ═══════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Top Videos Table — spans 2 cols */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="xl:col-span-2 rounded-xl border border-noir-smoke bg-noir-charcoal/80 overflow-hidden">
                    <div className="px-5 py-3 border-b border-noir-smoke flex items-center justify-between">
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-noir-ash flex items-center gap-2">
                            <MonitorPlay className="w-3.5 h-3.5 text-amber-400" /> Top Videos
                        </h3>
                        <span className="text-[10px] font-mono text-noir-smoke">{analytics?.topVideos?.length || 0} tracked</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-noir-smoke/50">
                                    <th className="px-5 py-2.5 text-left text-[10px] font-mono font-semibold text-noir-ash uppercase tracking-wider w-8">#</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold text-noir-ash uppercase tracking-wider">Video</th>
                                    <th className="px-5 py-2.5 text-right text-[10px] font-mono font-semibold text-noir-ash uppercase tracking-wider">Plays</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-noir-smoke/30">
                                {analytics?.topVideos && analytics.topVideos.length > 0 ? (
                                    analytics.topVideos.slice(0, 8).map((video, i) => (
                                        <tr key={video.youtube_id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-5 py-3 text-xs font-mono text-noir-ash">{(i + 1).toString().padStart(2, '0')}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-7 rounded overflow-hidden bg-noir-slate flex-shrink-0">
                                                        <img src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-sm text-foreground truncate max-w-[300px] group-hover:text-accent-cyan transition-colors">{video.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-sm font-semibold">
                                                    <Play className="w-3 h-3 fill-current" />{video.plays}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-12 text-center text-sm text-noir-ash">
                                            No video plays tracked yet — plays will appear as visitors watch videos
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="rounded-xl border border-noir-smoke bg-noir-charcoal/80 overflow-hidden flex flex-col">
                    <div className="px-5 py-3 border-b border-noir-smoke flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-noir-ash">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-noir-smoke/30 flex-1 max-h-[420px] overflow-y-auto">
                        {analytics?.recentActivity?.slice(0, 10).map((a, i) => (
                            <div key={`${a.page}-${a.created_at}-${i}`} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{formatPageName(a.page)}</p>
                                    <span className="text-[10px] font-mono text-noir-ash flex-shrink-0 ml-2">{timeAgo(a.created_at)}</span>
                                </div>
                                {a.country && (
                                    <p className="text-[11px] text-noir-cloud flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        {a.city ? `${a.city}, ` : ""}{a.country}
                                    </p>
                                )}
                            </div>
                        ))}
                        {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                            <div className="px-5 py-12 text-center text-sm text-noir-ash">No recent activity</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ══ Secondary Widgets ════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gauge — Views Today */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="flex items-center justify-center rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-5">
                    <Gauge value={o?.viewsToday || 0} max={Math.max(o?.viewsToday || 1, 50)} label="Views Today" color="#00ffd0" />
                </motion.div>

                {/* Progress Bars — Page Engagement */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                    className="rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-5 space-y-4">
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-noir-ash">Page Engagement</h3>
                    {topPagePcts.map((p, i) => (
                        <ProgressBar key={p.label} label={p.label} value={p.value}
                            color={["bg-accent-cyan", "bg-purple-400", "bg-amber-400", "bg-green-400", "bg-rose-400"][i % 5]} />
                    ))}
                    {topPagePcts.length === 0 && <p className="text-xs text-noir-ash">No page data yet</p>}
                </motion.div>

                {/* Gauge — Video Plays Today */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="flex items-center justify-center rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-5">
                    <Gauge value={o?.videoPlaysToday || 0} max={Math.max(o?.videoPlaysToday || 1, 20)} label="Video Plays Today" color="#f59e0b" />
                </motion.div>

                {/* Gauge — Month Change */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                    className="flex items-center justify-center rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-5">
                    <Gauge
                        value={Math.abs(o?.monthChange || 0)}
                        max={100}
                        label="Month Growth %"
                        color={(o?.monthChange || 0) >= 0 ? "#4ade80" : "#f87171"}
                    />
                </motion.div>
            </div>

            {/* ══ Heatmap — Traffic by Hour ════════════════════════════ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="rounded-xl border border-noir-smoke bg-noir-charcoal/80 p-5">
                <h3 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-noir-ash flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-accent-cyan" />
                    Traffic Heatmap — Views by Day & Hour
                </h3>
                {analytics?.heatmapData ? (
                    <HeatmapGrid data={analytics.heatmapData} />
                ) : (
                    <p className="text-sm text-noir-ash text-center py-8">No traffic data available</p>
                )}
            </motion.div>

            {/* ══ Bottom: Countries + Cities ═══════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Countries */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                    className="rounded-xl border border-noir-smoke bg-noir-charcoal/80 overflow-hidden">
                    <div className="px-5 py-3 border-b border-noir-smoke flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-accent-cyan" />
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-noir-ash">Top Countries</h3>
                    </div>
                    <div className="divide-y divide-noir-smoke/30">
                        {analytics?.topCountries?.map((c) => {
                            const max = analytics.topCountries[0]?.count || 1;
                            const pct = Math.round((c.count / max) * 100);
                            return (
                                <div key={c.country} className="relative px-5 py-3 hover:bg-white/[0.02] transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 bg-accent-cyan/5" style={{ width: `${pct}%` }} />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{countryFlag(c.code)}</span>
                                            <span className="text-sm font-medium text-foreground">{c.country}</span>
                                        </div>
                                        <span className="text-sm font-mono font-semibold text-foreground">{c.count}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {(!analytics?.topCountries || analytics.topCountries.length === 0) && (
                            <div className="px-5 py-10 text-center text-sm text-noir-ash">No geo data yet</div>
                        )}
                    </div>
                </motion.div>

                {/* Top Cities */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    className="rounded-xl border border-noir-smoke bg-noir-charcoal/80 overflow-hidden">
                    <div className="px-5 py-3 border-b border-noir-smoke flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-noir-ash">Top Cities</h3>
                    </div>
                    <div className="divide-y divide-noir-smoke/30">
                        {analytics?.topCities?.map((c) => {
                            const max = analytics.topCities[0]?.count || 1;
                            const pct = Math.round((c.count / max) * 100);
                            return (
                                <div key={`${c.city}-${c.country}`} className="relative px-5 py-3 hover:bg-white/[0.02] transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 bg-purple-500/5" style={{ width: `${pct}%` }} />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-noir-ash" />
                                            <span className="text-sm font-medium text-foreground">{c.city}</span>
                                            <span className="text-xs text-noir-ash">{c.country}</span>
                                        </div>
                                        <span className="text-sm font-mono font-semibold text-foreground">{c.count}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {(!analytics?.topCities || analytics.topCities.length === 0) && (
                            <div className="px-5 py-10 text-center text-sm text-noir-ash">No city data yet</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ══ Quick Actions ════════════════════════════════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { title: "Music", href: "/admin/music", icon: Music, desc: "Manage tracks", accent: "group-hover:text-purple-400 group-hover:border-purple-400/30" },
                    { title: "Videos", href: "/admin/videos", icon: Video, desc: "Manage videos", accent: "group-hover:text-amber-400 group-hover:border-amber-400/30" },
                    { title: "Analytics", href: "/admin/analytics", icon: BarChart3, desc: "Deep dive", accent: "group-hover:text-accent-cyan group-hover:border-accent-cyan/30" },
                    { title: "Sales", href: "/admin/sales", icon: Users, desc: "Orders & revenue", accent: "group-hover:text-green-400 group-hover:border-green-400/30" },
                ].map((a) => (
                    <Link key={a.href} href={a.href} className={`group flex items-center gap-3 p-4 bg-noir-charcoal/60 border border-noir-smoke rounded-xl hover:bg-noir-charcoal transition-all duration-200 ${a.accent}`}>
                        <div className="w-9 h-9 rounded-lg bg-noir-slate/50 flex items-center justify-center border border-noir-smoke group-hover:border-current transition-colors">
                            <a.icon className="w-4 h-4 text-noir-cloud group-hover:text-current transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{a.title}</p>
                            <p className="text-[10px] text-noir-ash">{a.desc}</p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-noir-smoke group-hover:text-current transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
