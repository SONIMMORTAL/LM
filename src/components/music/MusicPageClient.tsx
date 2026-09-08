"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Disc3, Music2, ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { AlbumPurchaseModal } from "@/components/music/AlbumPurchaseModal";
import { DJSceneHero } from "@/components/music/DJSceneHero";
import { VinylInspectModal } from "@/components/three/VinylInspectModal";
import type { Track } from "@/lib/tracks-server";
import { VideoFacade } from "@/components/ui/VideoFacade";

// Album name → transparent deluxe-vinyl render (spins on the DJ decks)
const ALBUM_VINYLS: Record<string, string> = {
    "Darkside": "/darkside-cover-deluxe-vinyl.png",
    "Lord Knows": "/lord-knows-cover-4-deluxe-vinyl.png",
    "Munchies": "/MUNCHIES-COVER-6-deluxe-vinyl.png",
    "The Commission": "/THE-COMMISSION-7-deluxe-vinyl.png",
    "Lost City": "/LC1-2-deluxe-vinyl.png",
    "More Life": "/MORE-LIFE-VINYL-5-deluxe-vinyl.png",
    "Live From The Dungeon": "/LFTD-3-deluxe-vinyl.png",
};
const DEFAULT_VINYL = "/LFTD-3-deluxe-vinyl.png";

interface Album {
    name: string;
    artist: string;
    cover: string;
    tracks: Track[];
    gradient: string;
    accentColor: string;
    youtubeId?: string;
    price?: number;
}

interface MusicPageClientProps {
    initialTracks: Track[];
}


export function MusicPageClient({ initialTracks }: MusicPageClientProps) {
    const [tracks] = useState<Track[]>(initialTracks);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedPurchaseAlbum, setSelectedPurchaseAlbum] = useState<{ name: string; price: number; cover: string; artist: string } | null>(null);
    const [inspectModalOpen, setInspectModalOpen] = useState(false);
    const [selectedInspectAlbum, setSelectedInspectAlbum] = useState<Album | null>(null);

    // Mobile dropdown state
    const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (tracks.length > 0) {
            // Set initial track to specific "Lost City" song
            const lostCityIndex = tracks.findIndex((t: Track) => t.title === "Lost City");
            if (lostCityIndex >= 0) {
                setCurrentTrackIndex(lostCityIndex);
            } else {
                const lostCityAlbumIndex = tracks.findIndex((t: Track) => t.album === "Lost City");
                if (lostCityAlbumIndex >= 0) setCurrentTrackIndex(lostCityAlbumIndex);
            }
        }
    }, [tracks]);

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

    const currentTrack = tracks[currentTrackIndex];

    // Group tracks by album - filter out Gotham from The Commission
    const albums: Album[] = [
        {
            name: "Darkside",
            artist: "Shadow The Great",
            cover: "/darkside-cover.jpg",
            gradient: "from-violet-500/20 via-indigo-600/10 to-slate-900/20",
            accentColor: "violet",
            youtubeId: "6-9cYB0_E14",
            tracks: tracks.filter(t => t.album === "Darkside"),
            price: 0
        },
        {
            name: "Lord Knows",
            artist: "Shadow The Great",
            cover: "/lord-knows-cover.jpg",
            gradient: "from-orange-500/20 via-amber-600/10 to-noir-void/20",
            accentColor: "orange",
            youtubeId: "QBaz7HbeJHk",
            tracks: tracks.filter(t => t.album === "Lord Knows"),
            price: 0
        },
        {
            name: "Munchies",
            artist: "Shadow The Great",
            cover: "/MUNCHIES COVER.jpeg",
            gradient: "from-yellow-500/20 via-orange-500/10 to-red-900/20",
            accentColor: "yellow",
            youtubeId: "rYld-JB5zLY",
            tracks: tracks.filter(t => t.album === "Munchies"),
            price: 0
        },
        {
            name: "The Commission",
            artist: "Shadow The Great",
            cover: "/THE COMMISSION.png",
            gradient: "from-amber-500/20 via-orange-600/10 to-red-900/20",
            accentColor: "amber",
            tracks: tracks.filter(t => (t.album === "The Commission" || (!t.album && t.title !== "Lost City")) && t.title.toUpperCase() !== "GOTHAM"),
            price: 9.99
        },
        {
            name: "Lost City",
            artist: "Shadow The Great",
            cover: "/LC1.jpg",
            gradient: "from-blue-900/20 via-cyan-900/10 to-slate-900/20",
            accentColor: "cyan",
            tracks: tracks.filter(t => t.album === "Lost City"),
            price: 9.99
        },
        {
            name: "More Life",
            artist: "Shadow The Great",
            cover: "/MORE LIFE VINYL.jpg",
            gradient: "from-rose-500/20 via-pink-600/10 to-purple-900/20",
            accentColor: "rose",
            tracks: tracks.filter(t => t.album === "More Life"),
            price: 9.99
        },
        {
            name: "Live From The Dungeon",
            artist: "Shadow The Great",
            cover: "/LFTD.jpg",
            gradient: "from-emerald-500/20 via-green-600/10 to-teal-900/20",
            accentColor: "emerald",
            tracks: tracks.filter(t => t.album === "Live From The Dungeon"),
            price: 9.99
        }
    ];

    const youtubeTimestamps: Record<string, number> = {
        "Mayne Tayne (prod. by Tuamie)": 0,
        "Who is it (prod. by Tuamie)": 160,
        "Locked up (feat. Rah Tha Ruler, Dj Ruggz)": 248,
        "Hitmonlee (feat. AR Immortal)": 263,
        "Break Bread (prod. by Tuamie)": 465,
        "Song Cry (prod. by Just Blaze)": 519,
        "Slow Jamz (prod. by Kanye West)": 660,
        "Gun Hill Freestyle (feat. Casiel)": 777,
        "Role (prod. by Grandpadre)": 864,
        "Pootie (feat. AR Immortal & Rah Tha Ruler)": 991,
        "Call Away (prod. by PEPITO)": 1167,
        "Bank Roll (prod. by PEPITO)": 1339,
        "30 Ball (feat. Rah Tha Ruler) [prod. by MIKI]": 1489,
        "The Fire (prod. by Kanye West)": 1606,
        "Neva Hurt U (prod. by Tuamie)": 1740,
        "Change (prod. by Coyote Beatz)": 1805,
        "Burly (prod. by Tuamie)": 0,
        "Break Bread Freestyle (prod. by Tuamie)": 48,
        "7 Oceans Freestyle (prod. by Tuamie)": 137,
        "Archie (prod. by King illa)": 193,
        "Corners (prod. by Coyote Beatz)": 373,
        "Hustle Freestyle (feat. Rah Tha Ruler)": 496,
        "Fountain Freestyle (feat. Rah Tha Ruler)": 605,
        "Book of Doe Freestyle (prod. by Doe)": 926,
        "Freestyle (prod. by Pepito)": 1080,
        "Ahhh Haa": 0,
        "Waves": 112,
        "4 Dilla (prod. by Tuamie)": 210,
        "Brownsvillan (prod. by Tuamie)": 325,
        "Runnin": 442,
        "Full Court Press": 561,
        "Set it Off": 639,
        "Zoot": 703,
        "Peace (prod. by Tuamie)": 800
    };

    const getGlobalTrackIndex = (track: Track) => {
        return tracks.findIndex(t => t.id === track.id);
    };

    const playTrack = (index: number) => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent('playMusic', { detail: { trackIndex: index } }));
        }
        setIsPlaying(true);
    };

    const toggleAlbum = (albumName: string) => {
        setExpandedAlbums(prev => ({
            ...prev,
            [albumName]: !prev[albumName]
        }));
    };

    return (
        <div className="min-h-screen bg-noir-void relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-purple-900/10" />
                <div className="md:hidden absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent-cyan/5 to-transparent opacity-50" />
            </div>

            <section className="relative pt-16 md:pt-20 pb-12">
                <DJSceneHero
                    leftVinyl={
                        (currentTrack?.album && ALBUM_VINYLS[currentTrack.album]) ||
                        DEFAULT_VINYL
                    }
                    rightVinyl={
                        currentTrack?.album === "The Commission"
                            ? "/LC1-2-deluxe-vinyl.png"
                            : "/THE-COMMISSION-7-deluxe-vinyl.png"
                    }
                    isPlaying={isPlaying}
                    nowPlaying={currentTrack?.album || undefined}
                    onInspect3D={() => {
                        const found = albums.find(a => a.name === currentTrack?.album) || albums[0];
                        setSelectedInspectAlbum(found);
                        setInspectModalOpen(true);
                    }}
                />
            </section>

            <section className="relative px-6 pb-40">
                <div className="max-w-7xl mx-auto space-y-24">
                    {albums.map((album, albumIndex) => (
                        <motion.div
                            key={album.name}
                            id={album.name.toLowerCase().replace(/\s+/g, '-')}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: albumIndex * 0.2 }}
                            className="relative scroll-mt-32"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${album.gradient} rounded-3xl blur-2xl md:blur-3xl opacity-50 -z-10`} />

                            <div className="relative bg-gradient-to-br from-noir-charcoal/80 to-noir-slate/40 backdrop-blur-md md:backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                    <div className="lg:col-span-5 p-8 lg:p-12">
                                        <div className="relative aspect-square max-w-sm mx-auto">
                                            <motion.div
                                                className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 isolation-isolate z-0"
                                                style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
                                                animate={isPlaying && currentTrack?.album === album.name ? { rotate: 360 } : {}}
                                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            >
                                                <div className="absolute inset-0 bg-black/20 z-10" />
                                                <Image
                                                    src={album.cover}
                                                    alt={`Album cover of ${album.name} by ${album.artist}`}
                                                    fill
                                                    className="object-cover"
                                                    priority={albumIndex < 2}
                                                    sizes="(max-width: 768px) 100vw, 30vw"
                                                />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-noir-void rounded-full border border-white/20 z-20" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full z-20" />

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
                                        </div>

                                        <div className="mt-8 text-center lg:text-left">
                                            <h2 className="text-3xl font-bold tracking-tight text-white mb-1 uppercase">{album.name}</h2>
                                            <p className="text-noir-cloud">{album.artist}</p>
                                            <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
                                                <span className="text-sm text-noir-ash">{album.tracks.length} tracks</span>
                                                <span className="text-noir-smoke">•</span>
                                                <span className="text-sm text-accent-cyan font-medium">
                                                    {album.price === 0 ? "FREE" : `$${album.price?.toFixed(2)}`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-2.5">
                                            {album.price !== 0 && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPurchaseAlbum({
                                                            name: album.name,
                                                            price: album.price || 9.99,
                                                            cover: album.cover,
                                                            artist: album.artist
                                                        });
                                                        setPurchaseModalOpen(true);
                                                    }}
                                                    className="flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-gradient-to-r from-accent-cyan to-cyan-400 text-noir-void font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
                                                >
                                                    <Music2 className="w-5 h-5" />
                                                    Buy Album
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedInspectAlbum(album);
                                                    setInspectModalOpen(true);
                                                }}
                                                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white/5 hover:bg-white/10 text-accent-cyan hover:text-white border border-accent-cyan/20 hover:border-accent-cyan/50 font-medium rounded-xl text-sm transition-all"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Inspect in 3D Studio
                                            </button>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
                                        <div className="p-6 lg:p-8 flex-1 flex flex-col min-h-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-semibold text-noir-cloud uppercase tracking-wider flex-shrink-0">Tracklist</h3>

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
                                                                <div
                                                                    key={track.id}
                                                                    onMouseEnter={() => setHoveredTrack(track.id)}
                                                                    onMouseLeave={() => setHoveredTrack(null)}
                                                                    onClick={() => playTrack(globalIndex)}
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
                                                                        {track.price && album.price !== 0 && (
                                                                            <span className="px-3 py-1 text-xs font-bold bg-white/10 text-white rounded-full hover:bg-accent-cyan hover:text-noir-void transition-colors">
                                                                                ${track.price.toFixed(2)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
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

                                        {album.youtubeId && (
                                            <div className="p-6 lg:p-8 pt-0">
                                                <VideoFacade 
                                                    youtubeId={album.youtubeId} 
                                                    title={album.name} 
                                                    startTime={currentTrack && currentTrack.album === album.name ? youtubeTimestamps[currentTrack.title] : undefined}
                                                    forcePlay={currentTrack && currentTrack.album === album.name && isPlaying && youtubeTimestamps[currentTrack.title] !== undefined}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {selectedPurchaseAlbum && (
                <AlbumPurchaseModal
                    isOpen={purchaseModalOpen}
                    onClose={() => setPurchaseModalOpen(false)}
                    album={selectedPurchaseAlbum}
                />
            )}

            <VinylInspectModal
                isOpen={inspectModalOpen}
                onClose={() => setInspectModalOpen(false)}
                album={
                    selectedInspectAlbum
                        ? {
                              name: selectedInspectAlbum.name,
                              artist: selectedInspectAlbum.artist,
                              cover: selectedInspectAlbum.cover,
                              vinylUrl: ALBUM_VINYLS[selectedInspectAlbum.name],
                              tracks: selectedInspectAlbum.tracks,
                              price: selectedInspectAlbum.price,
                          }
                        : null
                }
                isPlaying={isPlaying}
                currentTrackTitle={currentTrack?.title}
                onPlayTrack={(trackIdx) => {
                    if (selectedInspectAlbum) {
                        const targetTrack = selectedInspectAlbum.tracks[trackIdx];
                        if (targetTrack) {
                            const globalIdx = getGlobalTrackIndex(targetTrack);
                            if (globalIdx >= 0) playTrack(globalIdx);
                        }
                    }
                }}
                onOpenPurchaseModal={(albumToBuy) => {
                    setSelectedPurchaseAlbum({
                        name: albumToBuy.name,
                        price: albumToBuy.price || 9.99,
                        cover: albumToBuy.cover,
                        artist: albumToBuy.artist,
                    });
                    setPurchaseModalOpen(true);
                }}
            />

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
