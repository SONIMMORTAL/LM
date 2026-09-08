"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Disc3, Music2, ChevronLeft, ShoppingCart, Headphones } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlbumPurchaseModal } from "@/components/music/AlbumPurchaseModal";
import type { Track } from "@/lib/tracks-server";
import { VideoFacade } from "@/components/ui/VideoFacade";

interface AlbumDetailsClientProps {
    albumName: string;
    artist: string;
    cover: string;
    gradient: string;
    accentColor: string;
    youtubeId?: string;
    price: number;
    tracks: Track[];
    allTracks: Track[];
}

export function AlbumDetailsClient({
    albumName,
    artist,
    cover,
    gradient,
    accentColor,
    youtubeId,
    price,
    tracks,
    allTracks
}: AlbumDetailsClientProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

    useEffect(() => {
        if (tracks.length > 0) {
            // Find global track index for the first track of this album
            const globalIndex = allTracks.findIndex(t => t.id === tracks[0].id);
            if (globalIndex >= 0) {
                setCurrentTrackIndex(globalIndex);
            }
        }
    }, [tracks, allTracks]);

    useEffect(() => {
        const handleGlobalState = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setIsPlaying(detail.isPlaying);
            setCurrentTrackIndex(detail.currentTrackIndex);
        };
        if (typeof window !== "undefined") {
            window.addEventListener('globalPlayerState', handleGlobalState);
            return () => window.removeEventListener('globalPlayerState', handleGlobalState);
        }
    }, []);

    const playTrack = (trackId: string) => {
        const globalIndex = allTracks.findIndex(t => t.id === trackId);
        if (globalIndex >= 0) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('playMusic', { detail: { trackIndex: globalIndex } }));
            }
            setIsPlaying(true);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Link href="/music" className="inline-flex items-center gap-2 text-noir-cloud hover:text-accent-cyan transition-colors mb-8 text-sm sm:text-base">
                <ChevronLeft className="w-4 h-4" />
                Back to Music
            </Link>

            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-3xl opacity-20 -z-10`} />

            <div className="bg-gradient-to-br from-noir-charcoal/80 to-noir-slate/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    
                    {/* Album Left Column */}
                    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between">
                        <div className="space-y-8">
                            <motion.div
                                className="relative aspect-square max-w-sm mx-auto"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <motion.div
                                    className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 isolation-isolate z-0"
                                    style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
                                    animate={isPlaying && allTracks[currentTrackIndex]?.album === albumName ? { rotate: 360 } : {}}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="absolute inset-0 bg-black/20 z-10" />
                                    <Image
                                        src={cover}
                                        alt={`Album cover of ${albumName} by ${artist}`}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 30vw"
                                    />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-noir-void rounded-full border border-white/20 z-20" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full z-20" />
                                </motion.div>
                            </motion.div>

                            <div className="text-center lg:text-left space-y-3">
                                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-none">{albumName}</h1>
                                <p className="text-lg text-accent-cyan font-medium">{artist}</p>
                                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-noir-cloud">
                                    <span>{tracks.length} tracks</span>
                                    <span>•</span>
                                    <span className="text-white font-semibold">
                                        {price === 0 ? "FREE" : `$${price.toFixed(2)}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {price !== 0 && (
                            <div className="mt-8">
                                <button
                                    onClick={() => setPurchaseModalOpen(true)}
                                    className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-accent-cyan to-cyan-400 text-noir-void font-bold rounded-xl shadow-lg hover:scale-102 transition-all uppercase tracking-wider text-sm"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Purchase Download
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Album Right Column - Tracklist & Video */}
                    <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
                        <div className="p-8 flex-1">
                            <h2 className="text-sm font-bold text-noir-cloud uppercase tracking-wider mb-6">Tracklist</h2>
                            
                            <div className="space-y-1">
                                {tracks.map((track, idx) => {
                                    const globalIndex = allTracks.findIndex(t => t.id === track.id);
                                    const isCurrentTrack = currentTrackIndex === globalIndex;
                                    const isHovered = hoveredTrack === track.id;

                                    return (
                                        <div
                                            key={track.id}
                                            onMouseEnter={() => setHoveredTrack(track.id)}
                                            onMouseLeave={() => setHoveredTrack(null)}
                                            onClick={() => playTrack(track.id)}
                                            className={`group relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${isCurrentTrack
                                                ? "bg-gradient-to-r from-accent-cyan/20 to-transparent border-l-2 border-accent-cyan"
                                                : "hover:bg-white/5"
                                                }`}
                                        >
                                            <div className="w-8 flex items-center justify-center">
                                                {isCurrentTrack && isPlaying ? (
                                                    <div className="flex items-end gap-0.5 h-4">
                                                        <div className="w-1 h-3 bg-accent-cyan rounded-full animate-[bounce_0.8s_infinite_0s]" />
                                                        <div className="w-1 h-4 bg-accent-cyan rounded-full animate-[bounce_0.8s_infinite_0.15s]" />
                                                        <div className="w-1 h-2 bg-accent-cyan rounded-full animate-[bounce_0.8s_infinite_0.3s]" />
                                                    </div>
                                                ) : isHovered ? (
                                                    <Play className="w-4 h-4 text-accent-cyan" fill="currentColor" />
                                                ) : (
                                                    <span className={`text-sm font-mono ${isCurrentTrack ? "text-accent-cyan" : "text-noir-ash"}`}>
                                                        {(idx + 1).toString().padStart(2, '0')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate transition-colors ${isCurrentTrack ? "text-accent-cyan" : "text-white group-hover:text-accent-cyan"}`}>
                                                    {track.title}
                                                </p>
                                                <p className="text-sm text-noir-ash truncate">{track.artist}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-noir-ash font-mono hidden sm:block">{track.duration || "—"}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {youtubeId && (
                            <div className="p-8 pt-0">
                                <h3 className="text-sm font-bold text-noir-cloud uppercase tracking-wider mb-4">Official Video</h3>
                                <VideoFacade youtubeId={youtubeId} title={albumName} />
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <AlbumPurchaseModal
                isOpen={purchaseModalOpen}
                onClose={() => setPurchaseModalOpen(false)}
                album={{
                    name: albumName,
                    price: price,
                    cover: cover,
                    artist: artist
                }}
            />
        </div>
    );
}
