"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc3, Music2, Shuffle, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlbumPurchaseModal } from "@/components/music/AlbumPurchaseModal";

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string | null;
    audio_url: string | null;
    soundcloud_url: string | null;
    album: string | null;
    price: number | null;
    plays: number;
}

interface Album {
    name: string;
    artist: string;
    cover: string;
    tracks: Track[];
    gradient: string;
    accentColor: string;
    youtubeId?: string;
}

export default function MusicPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
    const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedPurchaseAlbum, setSelectedPurchaseAlbum] = useState<{ name: string; price: number; cover: string; artist: string } | null>(null);

    // Mobile dropdown state
    const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchTracks();
    }, []);

    useEffect(() => {
        if (tracks.length > 0 && isPlaying) {
            const audio = audioRef.current;
            if (audio) {
                audio.src = tracks[currentTrackIndex].audio_url || "";
                if (tracks[currentTrackIndex].audio_url) audio.play().catch(e => console.log("Playback error", e));
            }
        }
    }, [currentTrackIndex]);

    async function fetchTracks() {
        try {
            const res = await fetch("/api/music");
            const data = await res.json();
            if (data.tracks && data.tracks.length > 0) {
                setTracks(data.tracks);
                // Set initial track to specific "Lost City" song
                const lostCityIndex = data.tracks.findIndex((t: Track) => t.title === "Lost City");
                if (lostCityIndex >= 0) {
                    setCurrentTrackIndex(lostCityIndex);
                } else {
                    // Fallback to first Lost City album track if specific song not found
                    const lostCityAlbumIndex = data.tracks.findIndex((t: Track) => t.album === "Lost City");
                    if (lostCityAlbumIndex >= 0) setCurrentTrackIndex(lostCityAlbumIndex);
                }
            }
        } catch (error) {
            console.error("Failed to fetch tracks:", error);
        } finally {
            setLoading(false);
        }
    }

    const currentTrack = tracks[currentTrackIndex];

    // Group tracks by album - filter out Gotham from The Commission
    const albums: Album[] = [
        {
            name: "The Commission",
            artist: "Shadow The Great",
            cover: "/THE COMMISSION.png",
            gradient: "from-amber-500/20 via-orange-600/10 to-red-900/20",
            accentColor: "amber",
            tracks: tracks.filter(t => (t.album === "The Commission" || (!t.album && t.title !== "Lost City")) && t.title.toUpperCase() !== "GOTHAM")
        },
        {
            name: "Lost City",
            artist: "Shadow The Great",
            cover: "/LC1.jpg",
            gradient: "from-blue-900/20 via-cyan-900/10 to-slate-900/20",
            accentColor: "cyan",
            tracks: tracks.filter(t => t.album === "Lost City")
        },
        {
            name: "More Life",
            artist: "Shadow The Great",
            cover: "/MORE LIFE VINYL.jpg",
            gradient: "from-rose-500/20 via-pink-600/10 to-purple-900/20",
            accentColor: "rose",
            tracks: tracks.filter(t => t.album === "More Life")
        },
        {
            name: "Live From The Dungeon",
            artist: "Shadow The Great",
            cover: "/LFTD.jpg",
            gradient: "from-emerald-500/20 via-green-600/10 to-teal-900/20",
            accentColor: "emerald",
            tracks: tracks.filter(t => t.album === "Live From The Dungeon")
        }
    ];

    const toggleAlbum = (albumName: string) => {
        setExpandedAlbums(prev => ({
            ...prev,
            [albumName]: !prev[albumName]
        }));
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            if (!audioRef.current.src && currentTrack?.audio_url) {
                audioRef.current.src = currentTrack.audio_url;
            }
            if (audioRef.current.src) audioRef.current.play().catch(e => console.log("Playback error", e));
        }
        setIsPlaying(!isPlaying);
    };

    const playTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getGlobalTrackIndex = (track: Track) => {
        return tracks.findIndex(t => t.id === track.id);
    };

    const shufflePlay = () => {
        if (tracks.length === 0) return;
        const randomIndex = Math.floor(Math.random() * tracks.length);
        setCurrentTrackIndex(randomIndex);
        setIsPlaying(true);
    };

    const getAlbumCover = (albumName: string | null | undefined): string => {
        switch (albumName) {
            case "Lost City": return "/LC1.jpg";
            case "More Life": return "/MORE LIFE VINYL.jpg";
            case "Live From The Dungeon": return "/LFTD.jpg";
            case "The Commission":
            default: return "/THE COMMISSION.png";
        }
    };

    return (
        <div className="min-h-screen bg-noir-void relative overflow-hidden">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={nextTrack}
            />

            {/* Animated Background - Hide heavy animations on mobile */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-purple-900/10" />
                <motion.div
                    className="hidden md:block absolute top-1/4 -left-32 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="hidden md:block absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
                {/* Mobile Static Background for better perf */}
                <div className="md:hidden absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent-cyan/5 to-transparent opacity-50" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-4">
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                THE SOUND
                            </span>
                        </h1>
                        <p className="text-noir-cloud/80 max-w-lg mx-auto text-lg">
                            From the streets of Brooklyn to your speakers.
                            <span className="text-accent-cyan"> Stream the full catalog.</span>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Albums Grid */}
            <section className="relative px-6 pb-40">
                <div className="max-w-7xl mx-auto space-y-24">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Disc3 className="w-16 h-16 text-accent-cyan" />
                            </motion.div>
                            <p className="text-noir-cloud mt-4">Loading tracks...</p>
                        </div>
                    ) : (
                        albums.map((album, albumIndex) => (
                            <motion.div
                                key={album.name}
                                id={album.name.toLowerCase().replace(/\s+/g, '-')}
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: albumIndex * 0.2 }}
                                className="relative scroll-mt-32"
                            >
                                {/* Album Background Glow - Mobile optimized blur */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${album.gradient} rounded-3xl blur-2xl md:blur-3xl opacity-50 -z-10`} />

                                {/* Album Card - Reduce backdrop blur on mobile */}
                                <div className="relative bg-gradient-to-br from-noir-charcoal/80 to-noir-slate/40 backdrop-blur-md md:backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                        {/* Album Art Section */}
                                        <div className="lg:col-span-5 p-8 lg:p-12">
                                            <motion.div
                                                className="relative aspect-square max-w-sm mx-auto"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                {/* Spinning Album Art */}
                                                <motion.div
                                                    className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 isolation-isolate z-0"
                                                    style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
                                                    animate={isPlaying && currentTrack?.album === album.name ? { rotate: 360 } : {}}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <div className="absolute inset-0 bg-black/20 z-10" />
                                                    <Image
                                                        src={album.cover}
                                                        alt={album.name}
                                                        fill
                                                        className="object-cover"
                                                        priority={albumIndex === 0}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />

                                                    {/* Center Hole / Vinyl Look */}
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-noir-void rounded-full border border-white/20 z-20" />
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full z-20" />

                                                    {/* Playing Indicator Overlay */}
                                                    <AnimatePresence>
                                                        {isPlaying && currentTrack?.album === album.name && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-30"
                                                            >
                                                                <div className="w-12 h-12 rounded-full border-2 border-accent-cyan/50 flex items-center justify-center">
                                                                    <div className="w-3 h-3 bg-accent-cyan rounded-full" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </motion.div>

                                            {/* Album Info */}
                                            <div className="mt-8 text-center lg:text-left">
                                                <h2 className="text-3xl font-bold tracking-tight text-white mb-1">{album.name.toUpperCase()}</h2>
                                                <p className="text-noir-cloud">{album.artist}</p>
                                                <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
                                                    <span className="text-sm text-noir-ash">{album.tracks.length} tracks</span>
                                                    <span className="text-noir-smoke">•</span>
                                                    <span className="text-sm text-accent-cyan font-medium">$9.99</span>
                                                </div>
                                            </div>

                                            {/* Buy Button */}
                                            <motion.div className="mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPurchaseAlbum({
                                                            name: album.name,
                                                            price: 9.99,
                                                            cover: album.cover,
                                                            artist: album.artist
                                                        });
                                                        setPurchaseModalOpen(true);
                                                    }}
                                                    className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-accent-cyan to-cyan-400 text-noir-void font-bold rounded-xl shadow-lg shadow-accent-cyan/25 hover:shadow-accent-cyan/40 transition-all"
                                                >
                                                    <Music2 className="w-5 h-5" />
                                                    Buy Album
                                                </button>
                                            </motion.div>

                                            {/* Back Cover Art (Lost City Exclusive) */}
                                            {album.name === "Lost City" && (
                                                <motion.div
                                                    className="mt-8 relative aspect-square w-full mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <Image
                                                        src="/LC2.jpg"
                                                        alt="Lost City Back Cover"
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 384px"
                                                    />
                                                </motion.div>
                                            )}

                                            {/* Back Cover Art removed for cleaner design */}
                                        </div>

                                        {/* Tracks Section */}
                                        <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
                                            <div className="p-6 lg:p-8 flex-1 flex flex-col min-h-0">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-semibold text-noir-cloud uppercase tracking-wider flex-shrink-0">Tracklist</h3>

                                                    {/* Mobile Dropdown Toggle */}
                                                    <button
                                                        onClick={() => toggleAlbum(album.name)}
                                                        className="lg:hidden flex items-center gap-2 text-xs font-bold text-accent-cyan uppercase tracking-wider px-3 py-1.5 rounded-full bg-accent-cyan/10 hover:bg-accent-cyan/20 transition-colors"
                                                    >
                                                        {expandedAlbums[album.name] ? "Hide Tracks" : "View Tracks"}
                                                        <ChevronDown
                                                            className={`w-4 h-4 transition-transform duration-300 ${expandedAlbums[album.name] ? "rotate-180" : ""}`}
                                                        />
                                                    </button>
                                                </div>

                                                <div className={`${expandedAlbums[album.name] ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
                                                    {album.tracks.length > 0 ? (
                                                        <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2 lg:max-h-[500px]">
                                                            {album.tracks.map((track, idx) => {
                                                                const globalIndex = getGlobalTrackIndex(track);
                                                                const isCurrentTrack = currentTrackIndex === globalIndex;
                                                                const isHovered = hoveredTrack === track.id;

                                                                return (
                                                                    <motion.div
                                                                        key={track.id}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.03 }}
                                                                        onMouseEnter={() => setHoveredTrack(track.id)}
                                                                        onMouseLeave={() => setHoveredTrack(null)}
                                                                        onClick={() => playTrack(globalIndex)}
                                                                        className={`group relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${isCurrentTrack
                                                                            ? "bg-gradient-to-r from-accent-cyan/20 to-transparent border-l-2 border-accent-cyan"
                                                                            : "hover:bg-white/5"
                                                                            }`}
                                                                    >
                                                                        {/* Track Number / Play Icon */}
                                                                        <div className="w-8 flex items-center justify-center">
                                                                            {isCurrentTrack && isPlaying ? (
                                                                                <div className="flex items-end gap-0.5 h-4">
                                                                                    <motion.div className="w-1 bg-accent-cyan rounded-full" animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                                                                                    <motion.div className="w-1 bg-accent-cyan rounded-full" animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                                                                                    <motion.div className="w-1 bg-accent-cyan rounded-full" animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
                                                                                </div>
                                                                            ) : isHovered ? (
                                                                                <Play className="w-4 h-4 text-accent-cyan" fill="currentColor" />
                                                                            ) : (
                                                                                <span className={`text-sm font-mono ${isCurrentTrack ? "text-accent-cyan" : "text-noir-ash"}`}>
                                                                                    {(idx + 1).toString().padStart(2, '0')}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Track Info */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`font-medium truncate transition-colors ${isCurrentTrack ? "text-accent-cyan" : "text-white group-hover:text-accent-cyan"}`}>
                                                                                {track.title}
                                                                            </p>
                                                                            <p className="text-sm text-noir-ash truncate">{track.artist}</p>
                                                                        </div>

                                                                        {/* Duration & Price */}
                                                                        <div className="flex items-center gap-4">
                                                                            <span className="text-sm text-noir-ash font-mono hidden sm:block">{track.duration || "—"}</span>
                                                                            {track.price && (
                                                                                <motion.span
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                    className="px-3 py-1 text-xs font-bold bg-white/10 text-white rounded-full hover:bg-accent-cyan hover:text-noir-void transition-colors"
                                                                                >
                                                                                    ${track.price.toFixed(2)}
                                                                                </motion.span>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                                            <Disc3 className="w-12 h-12 text-noir-smoke mb-4" />
                                                            <p className="text-noir-ash">Coming Soon</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* YouTube Embed */}
                                            {album.youtubeId && (
                                                <div className="p-6 lg:p-8 pt-0">
                                                    <div className="rounded-xl overflow-hidden border border-white/10">
                                                        <div className="aspect-video">
                                                            <iframe
                                                                width="100%"
                                                                height="100%"
                                                                src={`https://www.youtube.com/embed/${album.youtubeId}`}
                                                                title={`${album.name} - Music Video`}
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* Premium Fixed Player */}
            <AnimatePresence>
                {currentTrack && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-50"
                    >
                        {/* Blur Background */}
                        <div className="absolute inset-0 bg-noir-charcoal/90 backdrop-blur-xl border-t border-white/10" />

                        {/* Progress Bar (Full Width) */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-noir-smoke/50">
                            <motion.div
                                className="h-full bg-gradient-to-r from-accent-cyan to-cyan-400"
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>

                        <div className="relative max-w-7xl mx-auto px-6 py-4">
                            <div className="flex items-center gap-6">
                                {/* Album Art */}
                                <motion.div
                                    className="relative w-14 h-14 rounded-lg overflow-hidden ring-2 ring-white/10 flex-shrink-0"
                                    animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Image
                                        src={getAlbumCover(currentTrack?.album)}
                                        alt="Now Playing"
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                </motion.div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0 hidden sm:block">
                                    <p className="font-semibold text-white truncate">{currentTrack?.title}</p>
                                    <p className="text-sm text-noir-cloud truncate">{currentTrack?.artist}</p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={prevTrack}
                                        className="p-2 text-noir-cloud hover:text-white transition-colors"
                                    >
                                        <SkipBack className="w-5 h-5" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={togglePlay}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-accent-cyan to-cyan-400 text-noir-void shadow-lg shadow-accent-cyan/30"
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={nextTrack}
                                        className="p-2 text-noir-cloud hover:text-white transition-colors"
                                    >
                                        <SkipForward className="w-5 h-5" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={shufflePlay}
                                        className="p-2 text-noir-cloud hover:text-accent-cyan transition-colors"
                                        title="Shuffle"
                                    >
                                        <Shuffle className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                {/* Time & Volume */}
                                <div className="hidden md:flex items-center gap-4">
                                    <span className="text-sm text-noir-ash font-mono w-20 text-center">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button onClick={toggleMute} className="text-noir-cloud hover:text-white transition-colors">
                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setVolume(val);
                                                if (audioRef.current) audioRef.current.volume = val / 100;
                                                if (val > 0 && isMuted) setIsMuted(false);
                                            }}
                                            className="w-24 h-1 bg-noir-smoke rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Purchase Modal */}
            {selectedPurchaseAlbum && (
                <AlbumPurchaseModal
                    isOpen={purchaseModalOpen}
                    onClose={() => setPurchaseModalOpen(false)}
                    album={selectedPurchaseAlbum}
                />
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 204, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 204, 0.5);
                }
            `}</style>
        </div>
    );
}
