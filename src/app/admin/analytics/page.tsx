"use client";

import { BarChart3, Eye, MapPin, Globe, TrendingUp, Loader2, RefreshCw, Building2 } from "lucide-react";
import { useState, useEffect } from "react";

interface AnalyticsData {
    overview: {
        totalViews: number;
        viewsToday: number;
        viewsThisMonth: number;
        monthChange: number | null;
    };
    topCountries: Array<{ country: string; code: string; count: number }>;
    topCities: Array<{ city: string; country: string; count: number }>;
    topPages: Array<{ page: string; count: number }>;
    recentActivity: Array<{ date: string; count: number }>;
}

// Country code to flag emoji
function getFlag(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [needsLogin, setNeedsLogin] = useState(false);

    async function fetchAnalytics() {
        setLoading(true);
        setError(null);
        setNeedsLogin(false);
        try {
            const res = await fetch('/api/admin/analytics');
            if (res.status === 401) {
                setNeedsLogin(true);
                setError('Please log in to view analytics');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
            </div>
        );
    }

    if (needsLogin) {
        return (
            <div className="text-center py-12 space-y-4">
                <p className="text-noir-cloud">You need to be logged in to view analytics.</p>
                <a
                    href="/admin/login"
                    className="inline-block px-6 py-3 bg-accent-cyan text-noir-void font-bold rounded-lg hover:bg-white transition-colors"
                >
                    Go to Login
                </a>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-12">
                <p className="text-noir-cloud mb-4">{error || 'No data available'}</p>
                <button onClick={fetchAnalytics} className="text-accent-cyan hover:underline flex items-center gap-2 mx-auto">
                    <RefreshCw className="w-4 h-4" /> Try again
                </button>
            </div>
        );
    }

    const maxActivityCount = Math.max(...data.recentActivity.map(d => d.count), 1);

    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                    <p className="text-noir-ash text-sm">Real visitor data and engagement metrics</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-noir-charcoal border border-noir-smoke rounded-lg hover:border-accent-cyan/50 transition-colors text-foreground"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-cyan/10 rounded-lg">
                            <Eye className="w-5 h-5 text-accent-cyan" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{data.overview.totalViews.toLocaleString()}</p>
                            <p className="text-sm text-noir-ash">Total Page Views</p>
                        </div>
                    </div>
                </div>
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-magenta/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-accent-magenta" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{data.overview.viewsToday.toLocaleString()}</p>
                            <p className="text-sm text-noir-ash">Views Today</p>
                        </div>
                    </div>
                </div>
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-gold/10 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-accent-gold" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{data.overview.viewsThisMonth.toLocaleString()}</p>
                            <p className="text-sm text-noir-ash">This Month</p>
                        </div>
                    </div>
                </div>
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Globe className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {data.overview.monthChange !== null
                                    ? `${data.overview.monthChange >= 0 ? '+' : ''}${data.overview.monthChange}%`
                                    : '--'
                                }
                            </p>
                            <p className="text-sm text-noir-ash">vs Last Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-cyan" />
                    Last 7 Days
                </h2>
                <div className="flex items-end justify-between gap-2 h-32">
                    {data.recentActivity.map((day) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className="w-full bg-accent-cyan/80 rounded-t transition-all"
                                style={{ height: `${Math.max((day.count / maxActivityCount) * 100, 4)}%` }}
                            />
                            <span className="text-xs text-noir-ash">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-xs text-noir-cloud">{day.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Geographic Data */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Countries */}
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-accent-cyan" />
                        Top Countries
                    </h2>
                    {data.topCountries.length === 0 ? (
                        <p className="text-noir-ash text-center py-8">No location data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topCountries.map((country, i) => (
                                <div key={country.country} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{getFlag(country.code)}</span>
                                        <span className="text-foreground">{country.country}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-2 bg-noir-slate rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent-cyan rounded-full"
                                                style={{ width: `${(country.count / (data.topCountries[0]?.count || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-noir-cloud w-12 text-right">{country.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Cities */}
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-accent-magenta" />
                        Top Cities
                    </h2>
                    {data.topCities.length === 0 ? (
                        <p className="text-noir-ash text-center py-8">No city data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topCities.map((city) => (
                                <div key={city.city} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-accent-magenta" />
                                        <div>
                                            <span className="text-foreground">{city.city}</span>
                                            <span className="text-noir-ash text-xs ml-2">{city.country}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-2 bg-noir-slate rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent-magenta rounded-full"
                                                style={{ width: `${(city.count / (data.topCities[0]?.count || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-noir-cloud w-10 text-right">{city.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Pages */}
            <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent-gold" />
                    Most Viewed Pages
                </h2>
                {data.topPages.length === 0 ? (
                    <p className="text-noir-ash text-center py-8">No page data yet</p>
                ) : (
                    <div className="space-y-2">
                        {data.topPages.map((page) => (
                            <div key={page.page} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-noir-slate/30 transition-colors">
                                <code className="text-sm text-accent-cyan">{page.page}</code>
                                <span className="text-sm text-noir-cloud">{page.count.toLocaleString()} views</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
