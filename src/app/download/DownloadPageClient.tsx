"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MoveLeft, Download, Music2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface Track {
    name: string;
    url: string | null;
    size: number;
}

interface AlbumData {
    name: string;
    cover: string;
    tracks: Track[];
    expiresAt: string;
}

// Map album slugs to cover images
const ALBUM_COVERS: Record<string, string> = {
    "more-life": "/more-life-cover-hd.jpg",
    "the-commission": "/THE COMMISSION.png",
    "lost-city": "/LC1.jpg",
};

export default function DownloadPageClient({ albumData, error }: { albumData?: AlbumData; error?: string }) {
    const [downloadedTracks, setDownloadedTracks] = useState<Set<string>>(new Set());
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

    const handleDownload = (trackName: string) => {
        setDownloadedTracks(prev => new Set([...prev, trackName]));
    };

    const handleDownloadAll = async () => {
        if (!albumData) return;
        setIsDownloadingAll(true);

        // Download tracks sequentially with a small delay
        for (const track of albumData.tracks) {
            if (track.url) {
                const link = document.createElement("a");
                link.href = track.url;
                link.download = track.name;
                link.click();
                handleDownload(track.name);
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
            }
        }

        setIsDownloadingAll(false);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-noir-void text-foreground flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-500 mb-4">{error === "invalid" ? "Invalid Link" : error === "expired" ? "Link Expired" : "Album Not Found"}</h1>
                    <p className="text-noir-cloud mb-8">
                        {error === "invalid"
                            ? "Please check your email for the correct download link."
                            : error === "expired"
                                ? "This download link has expired. Please contact support if you need a new link."
                                : "We couldn't find this album. Please contact support."}
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:bg-accent-cyan hover:text-white rounded-full transition-colors font-semibold"
                    >
                        <MoveLeft size={16} />
                        Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!albumData) {
        return (
            <div className="min-h-screen bg-noir-void text-foreground flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Music2 className="w-12 h-12 text-accent-cyan" />
                </motion.div>
            </div>
        );
    }

    const downloadProgress = (downloadedTracks.size / albumData.tracks.length) * 100;

    return (
        <div className="min-h-screen bg-noir-void text-foreground relative overflow-hidden">
            {/* Background Gradient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-purple-900/10" />
                <motion.div
                    className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
                {/* Header with Album Art */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    {/* Album Cover */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative w-48 h-48 mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10"
                    >
                        <Image
                            src={albumData.cover}
                            alt={albumData.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Success Checkmark Overlay */}
                        <AnimatePresence>
                            {downloadProgress === 100 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-accent-cyan/20 backdrop-blur-sm flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-16 h-16 text-accent-cyan" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">
                        {albumData.name.toUpperCase()}
                    </h1>
                    <p className="text-noir-ash text-sm tracking-widest uppercase">Official Download</p>

                    {/* Expiration Notice */}
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-noir-slate border border-noir-smoke rounded-full text-xs text-noir-cloud">
                        <Clock size={14} />
                        Links expire in 24 hours
                    </div>
                </motion.header>

                {/* Download All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleDownloadAll}
                        disabled={isDownloadingAll}
                        className="w-full py-4 px-6 bg-accent-cyan hover:bg-foreground text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isDownloadingAll ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Download className="w-5 h-5" />
                                </motion.div>
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Download All Tracks
                            </>
                        )}
                    </button>

                    {/* Progress Bar */}
                    {downloadedTracks.size > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden"
                        >
                            <motion.div
                                className="h-full bg-accent-cyan"
                                initial={{ width: 0 }}
                                animate={{ width: `${downloadProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    )}
                </motion.div>

                {/* Track List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-noir-charcoal rounded-2xl border-2 border-foreground/15 overflow-hidden shadow-sm"
                >
                    <div aria-hidden className="tiger-camo-strip h-1.5 w-full" />
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-foreground">Tracks</h2>
                            <span className="text-xs text-noir-ash">{albumData.tracks.length} files</span>
                        </div>

                        <ul className="space-y-2">
                            {albumData.tracks.map((track, i) => {
                                const isDownloaded = downloadedTracks.has(track.name);

                                return (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                        className={`flex items-center justify-between p-4 rounded-xl transition-all group ${isDownloaded
                                            ? "bg-accent-cyan/10 border border-accent-cyan/30"
                                            : "bg-noir-slate/60 hover:bg-noir-slate"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <span className={`text-sm font-mono w-6 shrink-0 ${isDownloaded ? "text-accent-cyan" : "text-noir-ash"}`}>
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span className={`truncate transition-colors ${isDownloaded ? "text-accent-cyan" : "text-foreground"}`} title={track.name}>
                                                {track.name.replace(/\.(mp3|wav|m4a|flac)$/i, "")}
                                            </span>
                                        </div>

                                        {track.url ? (
                                            isDownloaded ? (
                                                <span className="flex items-center gap-2 text-accent-cyan text-sm font-medium">
                                                    <CheckCircle2 size={16} />
                                                    Downloaded
                                                </span>
                                            ) : (
                                                <a
                                                    href={track.url}
                                                    download={track.name}
                                                    onClick={() => handleDownload(track.name)}
                                                    className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-accent-cyan hover:text-white transition-colors shrink-0 ml-4"
                                                >
                                                    <Download size={14} />
                                                    Download
                                                </a>
                                            )
                                        ) : (
                                            <span className="text-red-500 text-xs">Error</span>
                                        )}
                                    </motion.li>
                                );
                            })}
                        </ul>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-noir-cloud hover:text-foreground transition-colors"
                    >
                        <MoveLeft size={16} />
                        Back to Store
                    </Link>

                    <p className="mt-8 text-noir-ash text-xs">
                        Need help? Contact{" "}
                        <a href="mailto:loafrecords1@gmail.com" className="text-accent-cyan hover:underline">
                            loafrecords1@gmail.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
