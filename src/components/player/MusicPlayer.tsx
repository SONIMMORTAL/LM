"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Volume1,
    VolumeX,
    ChevronDown,
    ChevronUp,
    Shuffle,
    List
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Track {
    id: string;
    title: string;
    artist: string;
    album: string | null;
    audio_url?: string;
    duration?: string;
}

// Album cover mapping
const getAlbumCover = (albumName: string | null | undefined): string => {
    switch (albumName) {
        case "Lost City": return "/LC1.jpg";
        case "More Life": return "/MORE LIFE VINYL.jpg";
        case "Live From The Dungeon": return "/LFTD.jpg";
        case "The Commission":
        default: return "/THE COMMISSION.png";
    }
};

export function MusicPlayer() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTrackList, setShowTrackList] = useState(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(0.8);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playerRef = useRef<HTMLDivElement>(null);

    // Handle click outside to minimize
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
                if (isExpanded) {
                    setIsExpanded(false);
                    setShowTrackList(false);
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isExpanded]);

    // Fetch tracks on mount - use /api/music and handle auto-play
    useEffect(() => {
        async function fetchTracks() {
            try {
                const res = await fetch("/api/music");
                const data = await res.json();
                if (data.tracks && data.tracks.length > 0) {
                    setTracks(data.tracks);

                    // Check if we are on the home page
                    const isHomePage = window.location.pathname === "/";

                    // Find Lost City track
                    const lostCityIndex = data.tracks.findIndex((t: Track) => t.title === "Lost City");

                    if (lostCityIndex >= 0) {
                        // Always set current track to Lost City initially if found
                        setCurrentTrackIndex(lostCityIndex);

                        // Enforce auto-play if on Home Page
                        if (isHomePage) {
                            const lostCityTrack = data.tracks[lostCityIndex];
                            if (audioRef.current && lostCityTrack.audio_url) {
                                audioRef.current.src = lostCityTrack.audio_url;
                                audioRef.current.volume = 0.8;
                                setIsPlaying(true);

                                const playPromise = audioRef.current.play();
                                if (playPromise !== undefined) {
                                    playPromise
                                        .then(() => {
                                            console.log("Auto-playing Lost City on Home Page");
                                            setIsPlaying(true);
                                        })
                                        .catch((error) => {
                                            console.log("Autoplay blocked:", error);
                                            setIsPlaying(false);

                                            // Fallback: Play on first interaction
                                            const playOnInteraction = () => {
                                                if (audioRef.current && audioRef.current.paused) {
                                                    audioRef.current.play()
                                                        .then(() => {
                                                            setIsPlaying(true);
                                                            // Remove listeners once played
                                                            document.removeEventListener('click', playOnInteraction);
                                                            document.removeEventListener('touchstart', playOnInteraction);
                                                            document.removeEventListener('touchend', playOnInteraction);
                                                            document.removeEventListener('pointerup', playOnInteraction);
                                                            document.removeEventListener('keydown', playOnInteraction);
                                                            document.removeEventListener('scroll', playOnInteraction);
                                                        })
                                                        .catch(e => console.log("Interaction play failed", e));
                                                }
                                            };

                                            document.addEventListener('click', playOnInteraction);
                                            document.addEventListener('touchstart', playOnInteraction);
                                            document.addEventListener('touchend', playOnInteraction);
                                            document.addEventListener('pointerup', playOnInteraction);
                                            document.addEventListener('keydown', playOnInteraction);
                                            document.addEventListener('scroll', playOnInteraction);
                                        });
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch tracks:", error);
            }
        }
        fetchTracks();
    }, []);

    const currentTrack = tracks[currentTrackIndex];

    // Handle track changes
    useEffect(() => {
        if (tracks.length > 0 && isPlaying) {
            const audio = audioRef.current;
            if (audio && currentTrack?.audio_url) {
                audio.src = currentTrack.audio_url;
                audio.play().catch(e => console.log("Playback error", e));
            }
        }
    }, [currentTrackIndex, tracks]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            if (!audioRef.current.src && currentTrack?.audio_url) {
                audioRef.current.src = currentTrack.audio_url;
            }
            if (audioRef.current.src) {
                audioRef.current.volume = isMuted ? 0 : volume;
                audioRef.current.play().catch(e => console.log("Playback error", e));
            }
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(prevVolume);
            setIsMuted(false);
            if (audioRef.current) audioRef.current.volume = prevVolume;
        } else {
            setPrevVolume(volume);
            setVolume(0);
            setIsMuted(true);
            if (audioRef.current) audioRef.current.volume = 0;
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (audioRef.current) audioRef.current.volume = newVolume;
    };

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const shufflePlay = () => {
        if (tracks.length === 0) return;
        const randomIndex = Math.floor(Math.random() * tracks.length);
        setCurrentTrackIndex(randomIndex);
        setIsPlaying(true);
    };

    const selectTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
        setShowTrackList(false);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration || 0;
            setDuration(total);
            setProgress(total > 0 ? (current / total) * 100 : 0);
        }
    };

    const handleProgressChange = (newProgress: number) => {
        if (audioRef.current && duration > 0) {
            const newTime = (newProgress / 100) * duration;
            audioRef.current.currentTime = newTime;
            setProgress(newProgress);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentTimeDisplay = formatTime(audioRef.current?.currentTime || 0);
    const totalTimeDisplay = formatTime(duration);

    if (tracks.length === 0) return null;

    return (
        <motion.div
            className="fixed bottom-6 left-1/2 z-50 safe-bottom"
            style={{ x: "-50%" }}
        >
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={nextTrack}
            />

            <motion.div
                ref={playerRef}
                onClick={() => !isExpanded && setIsExpanded(true)}
                className={cn(
                    "relative overflow-hidden cursor-pointer",
                    "bg-noir-charcoal/95 backdrop-blur-md",
                    "border border-noir-smoke"
                )}
                variants={{
                    collapsed: {
                        width: "auto",
                        height: "48px",
                        borderRadius: "9999px",
                        padding: "6px 12px"
                    },
                    expanded: {
                        width: "384px",
                        maxWidth: "92vw",
                        height: "auto",
                        borderRadius: "16px",
                        padding: "0px"
                    }
                }}
                initial="collapsed"
                animate={isExpanded ? "expanded" : "collapsed"}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                }}
                style={{
                    boxShadow: isPlaying
                        ? "0 0 40px rgba(0, 217, 255, 0.3)"
                        : "0 4px 20px rgba(0, 0, 0, 0.5)"
                }}
            >
                <AnimatePresence mode="popLayout">
                    {isExpanded ? (
                        <ExpandedPlayer
                            key="expanded"
                            track={currentTrack}
                            tracks={tracks}
                            currentTrackIndex={currentTrackIndex}
                            isPlaying={isPlaying}
                            progress={progress}
                            currentTime={currentTimeDisplay}
                            totalTime={totalTimeDisplay}
                            onPlayPause={togglePlay}
                            onNext={nextTrack}
                            onPrev={prevTrack}
                            onShuffle={shufflePlay}
                            onSelectTrack={selectTrack}
                            onClose={() => setIsExpanded(false)}
                            onProgressChange={handleProgressChange}
                            volume={volume}
                            isMuted={isMuted}
                            onToggleMute={toggleMute}
                            onVolumeChange={handleVolumeChange}
                            showTrackList={showTrackList}
                            setShowTrackList={setShowTrackList}
                        />
                    ) : (
                        <CollapsedPlayer
                            key="collapsed"
                            track={currentTrack}
                            isPlaying={isPlaying}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

/**
 * Collapsed "pill" view - minimal track info with album art
 */
function CollapsedPlayer({
    track,
    isPlaying
}: {
    track: Track;
    isPlaying: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 whitespace-nowrap"
        >
            {/* Album art thumbnail */}
            <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                <Image
                    src={getAlbumCover(track?.album)}
                    alt={track?.album || "Album"}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Track info */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate max-w-32">
                    {track?.title || "Select Music"}
                </span>
                <span className="text-noir-ash">•</span>
                <span className="text-sm text-noir-cloud truncate max-w-24">
                    {track?.artist || "Loaf Records"}
                </span>
            </div>

            {/* Audio visualizer bars */}
            {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                    {[1, 2, 3].map((bar) => (
                        <div
                            key={bar}
                            className="w-0.5 bg-accent-cyan rounded-full animate-pulse"
                            style={{ height: `${4 + bar * 3}px` }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

/**
 * Expanded card view - full controls, progress bar, album art, and track list
 */
function ExpandedPlayer({
    track,
    tracks,
    currentTrackIndex,
    isPlaying,
    progress,
    currentTime,
    totalTime,
    onPlayPause,
    onNext,
    onPrev,
    onShuffle,
    onSelectTrack,
    onClose,
    onProgressChange,
    volume,
    isMuted,
    onToggleMute,
    onVolumeChange,
    showTrackList,
    setShowTrackList,
}: {
    track: Track;
    tracks: Track[];
    currentTrackIndex: number;
    isPlaying: boolean;
    progress: number;
    currentTime: string;
    totalTime: string;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onShuffle: () => void;
    onSelectTrack: (index: number) => void;
    onClose: () => void;
    onProgressChange: (value: number) => void;
    volume: number;
    isMuted: boolean;
    onToggleMute: () => void;
    onVolumeChange: (value: number) => void;
    showTrackList: boolean;
    setShowTrackList: (show: boolean) => void;
}) {
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        onProgressChange(Math.max(0, Math.min(100, percent)));
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        onVolumeChange(Math.max(0, Math.min(1, percent)));
    };

    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
            className="p-4 w-full sm:w-[384px]"
        >
            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className={cn(
                    "absolute top-3 right-3 p-1.5 rounded-full",
                    "hover:bg-noir-slate transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                )}
                aria-label="Minimize player"
            >
                <ChevronDown className="w-5 h-5 text-noir-ash" />
            </button>

            {/* Album art + info */}
            <div className="flex gap-4 mb-4">
                <motion.div
                    className={cn(
                        "relative w-16 h-16 rounded-lg overflow-hidden",
                        "flex-shrink-0",
                        "shadow-glow-sm"
                    )}
                >
                    <Image
                        src={getAlbumCover(track?.album)}
                        alt={track?.album || "Album"}
                        fill
                        className="object-cover"
                    />

                    {/* Cyan glow ring when playing */}
                    {isPlaying && (
                        <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-accent-cyan/50"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}
                </motion.div>

                <div className="flex flex-col justify-center min-w-0 pr-8">
                    <h3 className="font-bold text-lg text-foreground truncate tracking-wide uppercase">
                        {track?.title || "No Title"}
                    </h3>
                    <p className="text-sm text-noir-cloud truncate">
                        {track?.artist || "Unknown Artist"}
                    </p>
                    <p className="text-xs text-accent-cyan truncate">
                        {track?.album || ""}
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div
                    className="relative h-1.5 bg-noir-slate rounded-full cursor-pointer group"
                    onClick={handleProgressClick}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-accent-cyan rounded-full transition-all duration-75"
                        style={{ width: `${progress}%` }}
                    />
                    <motion.div
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-3 h-3",
                            "bg-foreground rounded-full shadow-glow-sm",
                            "opacity-0 group-hover:opacity-100 transition-opacity"
                        )}
                        style={{ left: `${progress}%`, x: "-50%" }}
                    />
                </div>

                <div className="flex justify-between mt-2 text-xs text-noir-ash font-medium">
                    <span>{currentTime}</span>
                    <span>{totalTime}</span>
                </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-4">
                {/* Shuffle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onShuffle();
                    }}
                    className="p-2 text-noir-cloud hover:text-accent-cyan transition-colors"
                    aria-label="Shuffle"
                >
                    <Shuffle className="w-4 h-4" />
                </button>

                {/* Previous track */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrev();
                    }}
                    className="p-2 text-noir-cloud hover:text-foreground transition-colors"
                    aria-label="Previous track"
                >
                    <SkipBack className="w-5 h-5" />
                </button>

                {/* Play/Pause */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlayPause();
                    }}
                    className={cn(
                        "p-3 bg-accent-cyan rounded-full text-noir-void",
                        "hover:bg-accent-cyanMuted transition-colors",
                        "shadow-glow-md"
                    )}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                    )}
                </motion.button>

                {/* Next track */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    className="p-2 text-noir-cloud hover:text-foreground transition-colors"
                    aria-label="Next track"
                >
                    <SkipForward className="w-5 h-5" />
                </button>

                {/* Track List toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowTrackList(!showTrackList);
                    }}
                    className={cn(
                        "p-2 transition-colors",
                        showTrackList ? "text-accent-cyan" : "text-noir-cloud hover:text-accent-cyan"
                    )}
                    aria-label="Show track list"
                >
                    <List className="w-4 h-4" />
                </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 mt-4 px-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMute();
                    }}
                    className="text-noir-ash hover:text-accent-cyan transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                >
                    <VolumeIcon className="w-4 h-4" />
                </button>

                <div
                    className="relative flex-1 h-1 bg-noir-slate rounded-full cursor-pointer group py-2 -my-2 flex items-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleVolumeClick(e);
                    }}
                >
                    <div className="w-full h-1 bg-noir-slate rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full bg-noir-cloud group-hover:bg-accent-cyan/80 transition-colors",
                                isMuted && "bg-noir-ash"
                            )}
                            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Track List */}
            <AnimatePresence>
                {showTrackList && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 overflow-hidden"
                    >
                        <div className="max-h-48 overflow-y-auto custom-scrollbar border-t border-noir-smoke pt-3">
                            <p className="text-xs text-noir-ash uppercase tracking-wider mb-2">
                                All Tracks ({tracks.length})
                            </p>
                            {tracks.map((t, idx) => (
                                <button
                                    key={t.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTrack(idx);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                                        idx === currentTrackIndex
                                            ? "bg-accent-cyan/20 text-accent-cyan"
                                            : "hover:bg-noir-slate/50 text-foreground"
                                    )}
                                >
                                    <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                        <Image
                                            src={getAlbumCover(t.album)}
                                            alt={t.album || "Album"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{t.title}</p>
                                        <p className="text-xs text-noir-ash truncate">{t.artist}</p>
                                    </div>
                                    {idx === currentTrackIndex && isPlaying && (
                                        <div className="flex items-end gap-0.5 h-3">
                                            {[1, 2, 3].map((bar) => (
                                                <div
                                                    key={bar}
                                                    className="w-0.5 bg-accent-cyan rounded-full animate-pulse"
                                                    style={{ height: `${4 + bar * 3}px` }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 204, 0.3);
                    border-radius: 2px;
                }
            `}</style>
        </motion.div>
    );
}
