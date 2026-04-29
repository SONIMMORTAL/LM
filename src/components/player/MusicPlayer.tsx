"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// Album cover mapping — kept in sync with music page
const getAlbumCover = (albumName: string | null | undefined): string => {
    switch (albumName) {
        case "Lost City": return "/LC1.jpg";
        case "More Life": return "/MORE LIFE VINYL.jpg";
        case "Live From The Dungeon": return "/LFTD.jpg";
        case "Darkside": return "/darkside-cover.jpg";
        case "Lord Knows": return "/lord-knows-cover.jpg";
        case "Munchies": return "/MUNCHIES COVER.jpeg";
        case "The Commission":
        default: return "/THE COMMISSION.png";
    }
};

// ─── localStorage helpers ───────────────────────────────────────────
const STORAGE_KEY = "loaf_player_state";

function savePlayerState(trackIndex: number, time: number, volume: number) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ trackIndex, time, volume }));
    } catch { /* quota errors are fine to swallow */ }
}

function loadPlayerState(): { trackIndex: number; time: number; volume: number } | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

// ─── Component ──────────────────────────────────────────────────────
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
    const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentTrack = tracks[currentTrackIndex];

    // ── Stable callbacks (used by effects + MediaSession) ───────────
    const nextTrack = useCallback(() => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    }, [tracks.length]);

    const prevTrackFn = useCallback(() => {
        // If more than 3 s in, restart; otherwise go to previous track
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    }, [tracks.length]);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (!audioRef.current.src && currentTrack?.audio_url) {
                audioRef.current.src = currentTrack.audio_url;
            }
            if (audioRef.current.src) {
                audioRef.current.volume = isMuted ? 0 : volume;
                audioRef.current.play().catch(() => {});
            }
            setIsPlaying(true);
        }
    }, [isPlaying, currentTrack, isMuted, volume]);

    const shufflePlay = useCallback(() => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex(Math.floor(Math.random() * tracks.length));
        setIsPlaying(true);
    }, [tracks.length]);

    // ── Click-outside to minimise ───────────────────────────────────
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
                if (isExpanded) { setIsExpanded(false); setShowTrackList(false); }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isExpanded]);

    // ── Audio context unlock on first interaction ───────────────────
    useEffect(() => {
        const unlockAudio = () => {
            if (audioRef.current?.paused && audioRef.current?.src) {
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
            events.forEach(e => document.removeEventListener(e, unlockAudio));
        };
        const events = ['click', 'touchstart', 'pointerup', 'keydown'];
        events.forEach(e => document.addEventListener(e, unlockAudio, { once: false }));
        return () => events.forEach(e => document.removeEventListener(e, unlockAudio));
    }, []);

    // ── Sync state → music page via CustomEvent ─────────────────────
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent('globalPlayerState', {
                detail: { isPlaying, currentTrackIndex }
            }));
        }
    }, [isPlaying, currentTrackIndex]);

    // ── Listen for track-select from music page ─────────────────────
    useEffect(() => {
        const handler = (e: Event) => {
            const { trackIndex } = (e as CustomEvent).detail;
            if (typeof trackIndex === 'number') {
                setCurrentTrackIndex(trackIndex);
                setIsPlaying(true);
                setIsExpanded(true);
            }
        };
        window.addEventListener('playMusic', handler);
        return () => window.removeEventListener('playMusic', handler);
    }, []);

    // ── Pause audio when a YouTube iframe starts playing ────────────
    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            // YouTube iframes post messages with info about player state
            // State 1 = playing
            try {
                if (typeof event.data === "string") {
                    const data = JSON.parse(event.data);
                    if (data?.event === "infoDelivery" && data?.info?.playerState === 1) {
                        // YouTube started playing — pause our audio
                        if (audioRef.current && !audioRef.current.paused) {
                            audioRef.current.pause();
                            setIsPlaying(false);
                        }
                    }
                }
            } catch { /* ignore non-JSON messages */ }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // ── Also listen for custom pauseGlobalPlayer event ──────────────
    useEffect(() => {
        const handler = () => {
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        };
        window.addEventListener('pauseGlobalPlayer', handler);
        return () => window.removeEventListener('pauseGlobalPlayer', handler);
    }, []);

    // ── Keyboard shortcuts ──────────────────────────────────────────
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // Skip if user is typing in an input
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "ArrowRight":
                    if (e.shiftKey) { nextTrack(); }
                    else if (audioRef.current) { audioRef.current.currentTime += 10; }
                    break;
                case "ArrowLeft":
                    if (e.shiftKey) { prevTrackFn(); }
                    else if (audioRef.current) { audioRef.current.currentTime -= 10; }
                    break;
                case "KeyM":
                    toggleMuteFn();
                    break;
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [togglePlay, nextTrack, prevTrackFn]);

    // ── Fetch tracks + restore saved position ───────────────────────
    useEffect(() => {
        let isMounted = true;

        async function fetchTracks(isMountedStatus: boolean) {
            try {
                const res = await fetch("/api/music");
                const data = await res.json();
                
                if (!isMountedStatus) return;

                if (data.tracks?.length > 0) {
                    setTracks(data.tracks);

                    const saved = loadPlayerState();
                    if (saved && saved.trackIndex < data.tracks.length) {
                        setCurrentTrackIndex(saved.trackIndex);
                        setVolume(saved.volume ?? 0.8);
                    } else {
                        const idx = data.tracks.findIndex((t: Track) => t.title === "Lost City");
                        if (idx >= 0) setCurrentTrackIndex(idx);
                    }
                }
            } catch (error: any) {
                console.error("Failed to fetch tracks:", error);
            }
        }
        
        fetchTracks(isMounted);
        return () => { isMounted = false; };
    }, []);

    // ── Periodically persist position to localStorage ───────────────
    useEffect(() => {
        saveTimerRef.current = setInterval(() => {
            if (audioRef.current && !audioRef.current.paused) {
                savePlayerState(currentTrackIndex, audioRef.current.currentTime, volume);
            }
        }, 5000);
        return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
    }, [currentTrackIndex, volume]);

    // ── Handle track changes ────────────────────────────────────────
    useEffect(() => {
        if (tracks.length === 0) return;
        const audio = audioRef.current;
        if (!audio || !currentTrack?.audio_url) return;

        const currentSrc = audio.src;
        const newSrc = new URL(currentTrack.audio_url, window.location.origin).href;

        if (currentSrc !== newSrc) {
            audio.src = currentTrack.audio_url;
            if (isPlaying) audio.play().catch(() => {});
        } else if (isPlaying && audio.paused) {
            audio.play().catch(() => {});
        }
    }, [currentTrackIndex, tracks, isPlaying, currentTrack]);

    // ── MediaSession API — lock screen / tab controls ───────────────
    useEffect(() => {
        if (!("mediaSession" in navigator) || !currentTrack) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist,
            album: currentTrack.album || "Loaf Records",
            artwork: [
                { src: getAlbumCover(currentTrack.album), sizes: "512x512", type: "image/jpeg" }
            ]
        });

        navigator.mediaSession.setActionHandler("play", () => { togglePlay(); });
        navigator.mediaSession.setActionHandler("pause", () => { togglePlay(); });
        navigator.mediaSession.setActionHandler("previoustrack", () => { prevTrackFn(); });
        navigator.mediaSession.setActionHandler("nexttrack", () => { nextTrack(); });
    }, [currentTrack, togglePlay, nextTrack, prevTrackFn]);

    // ── Mute helpers ────────────────────────────────────────────────
    const toggleMuteFn = useCallback(() => {
        if (isMuted) {
            setVolume(prevVolume); setIsMuted(false);
            if (audioRef.current) audioRef.current.volume = prevVolume;
        } else {
            setPrevVolume(volume); setVolume(0); setIsMuted(true);
            if (audioRef.current) audioRef.current.volume = 0;
        }
    }, [isMuted, prevVolume, volume]);

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (audioRef.current) audioRef.current.volume = newVolume;
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
            audioRef.current.currentTime = (newProgress / 100) * duration;
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
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
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
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
                            onPrev={prevTrackFn}
                            onShuffle={shufflePlay}
                            onSelectTrack={selectTrack}
                            onClose={() => setIsExpanded(false)}
                            onProgressChange={handleProgressChange}
                            volume={volume}
                            isMuted={isMuted}
                            onToggleMute={toggleMuteFn}
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

// ─── Collapsed "pill" view ──────────────────────────────────────────
function CollapsedPlayer({ track, isPlaying }: { track: Track; isPlaying: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 whitespace-nowrap"
        >
            <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                <img src={getAlbumCover(track?.album)} alt={track?.album || "Album"} className="object-cover w-full h-full" />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate max-w-32">
                    {track?.title || "Select Music"}
                </span>
                <span className="text-noir-ash">•</span>
                <span className="text-sm text-noir-cloud truncate max-w-24">
                    {track?.artist || "Loaf Records"}
                </span>
            </div>
            {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                    {[1, 2, 3].map((bar) => (
                        <div key={bar} className="w-0.5 bg-accent-cyan rounded-full animate-pulse" style={{ height: `${4 + bar * 3}px` }} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// ─── Expanded card view ─────────────────────────────────────────────
function ExpandedPlayer({
    track, tracks, currentTrackIndex, isPlaying, progress, currentTime, totalTime,
    onPlayPause, onNext, onPrev, onShuffle, onSelectTrack, onClose, onProgressChange,
    volume, isMuted, onToggleMute, onVolumeChange, showTrackList, setShowTrackList,
}: {
    track: Track; tracks: Track[]; currentTrackIndex: number; isPlaying: boolean;
    progress: number; currentTime: string; totalTime: string;
    onPlayPause: () => void; onNext: () => void; onPrev: () => void;
    onShuffle: () => void; onSelectTrack: (index: number) => void;
    onClose: () => void; onProgressChange: (value: number) => void;
    volume: number; isMuted: boolean; onToggleMute: () => void;
    onVolumeChange: (value: number) => void;
    showTrackList: boolean; setShowTrackList: (show: boolean) => void;
}) {
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onProgressChange(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onVolumeChange(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
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
                onClick={(e) => { e.stopPropagation(); onClose(); }}
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
                <motion.div className={cn("relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-glow-sm")}>
                    <img src={getAlbumCover(track?.album)} alt={track?.album || "Album"} className="object-cover w-full h-full" />
                    {isPlaying && (
                        <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-accent-cyan/50"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}
                </motion.div>
                <div className="flex flex-col justify-center min-w-0 pr-8">
                    <h3 className="font-bold text-lg text-foreground truncate tracking-wide uppercase">{track?.title || "No Title"}</h3>
                    <p className="text-sm text-noir-cloud truncate">{track?.artist || "Unknown Artist"}</p>
                    <p className="text-xs text-accent-cyan truncate">{track?.album || ""}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="relative h-1.5 bg-noir-slate rounded-full cursor-pointer group" onClick={handleProgressClick}>
                    <div className="absolute top-0 left-0 h-full bg-accent-cyan rounded-full transition-all duration-75" style={{ width: `${progress}%` }} />
                    <motion.div
                        className={cn("absolute top-1/2 -translate-y-1/2 w-3 h-3", "bg-foreground rounded-full shadow-glow-sm", "opacity-0 group-hover:opacity-100 transition-opacity")}
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
                <button onClick={(e) => { e.stopPropagation(); onShuffle(); }} className="p-2 text-noir-cloud hover:text-accent-cyan transition-colors" aria-label="Shuffle">
                    <Shuffle className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="p-2 text-noir-cloud hover:text-foreground transition-colors" aria-label="Previous track">
                    <SkipBack className="w-5 h-5" />
                </button>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
                    className={cn("p-3 bg-accent-cyan rounded-full text-noir-void", "hover:bg-accent-cyanMuted transition-colors", "shadow-glow-md")}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </motion.button>
                <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="p-2 text-noir-cloud hover:text-foreground transition-colors" aria-label="Next track">
                    <SkipForward className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowTrackList(!showTrackList); }}
                    className={cn("p-2 transition-colors", showTrackList ? "text-accent-cyan" : "text-noir-cloud hover:text-accent-cyan")}
                    aria-label="Show track list"
                >
                    <List className="w-4 h-4" />
                </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 mt-4 px-2">
                <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className="text-noir-ash hover:text-accent-cyan transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
                    <VolumeIcon className="w-4 h-4" />
                </button>
                <div
                    className="relative flex-1 h-1 bg-noir-slate rounded-full cursor-pointer group py-2 -my-2 flex items-center"
                    onClick={(e) => { e.stopPropagation(); handleVolumeClick(e); }}
                >
                    <div className="w-full h-1 bg-noir-slate rounded-full overflow-hidden">
                        <div className={cn("h-full bg-noir-cloud group-hover:bg-accent-cyan/80 transition-colors", isMuted && "bg-noir-ash")} style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Track List */}
            <AnimatePresence>
                {showTrackList && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4 overflow-hidden">
                        <div className="max-h-48 overflow-y-auto custom-scrollbar border-t border-noir-smoke pt-3">
                            <p className="text-xs text-noir-ash uppercase tracking-wider mb-2">All Tracks ({tracks.length})</p>
                            {tracks.map((t, idx) => (
                                <button
                                    key={t.id}
                                    onClick={(e) => { e.stopPropagation(); onSelectTrack(idx); }}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                                        idx === currentTrackIndex ? "bg-accent-cyan/20 text-accent-cyan" : "hover:bg-noir-slate/50 text-foreground"
                                    )}
                                >
                                    <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                        <img src={getAlbumCover(t.album)} alt={t.album || "Album"} className="object-cover w-full h-full" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{t.title}</p>
                                        <p className="text-xs text-noir-ash truncate">{t.artist}</p>
                                    </div>
                                    {idx === currentTrackIndex && isPlaying && (
                                        <div className="flex items-end gap-0.5 h-3">
                                            {[1, 2, 3].map((bar) => (
                                                <div key={bar} className="w-0.5 bg-accent-cyan rounded-full animate-pulse" style={{ height: `${4 + bar * 3}px` }} />
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
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,255,204,0.3); border-radius: 2px; }
            `}</style>
        </motion.div>
    );
}
