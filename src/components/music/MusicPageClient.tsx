"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AlbumPurchaseModal } from "@/components/music/AlbumPurchaseModal";
import { DJSceneHero } from "@/components/music/DJSceneHero";
import { VinylInspectModal } from "@/components/three/VinylInspectModal";
import { RecordCrate } from "@/components/music/RecordCrate";
import type { Track } from "@/lib/tracks-server";

// Album name → transparent deluxe-vinyl render (spins on the DJ decks)
const ALBUM_VINYLS: Record<string, string> = {
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
    price?: number;
}

interface MusicPageClientProps {
    initialTracks: Track[];
}


export function MusicPageClient({ initialTracks }: MusicPageClientProps) {
    const [tracks] = useState<Track[]>(initialTracks);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
        if (initialTracks.length > 0) {
            const lostCityIndex = initialTracks.findIndex((t: Track) => t.title === "Lost City");
            if (lostCityIndex >= 0) return lostCityIndex;
            const lostCityAlbumIndex = initialTracks.findIndex((t: Track) => t.album === "Lost City");
            if (lostCityAlbumIndex >= 0) return lostCityAlbumIndex;
        }
        return 0;
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedPurchaseAlbum, setSelectedPurchaseAlbum] = useState<{ name: string; price: number; cover: string; artist: string } | null>(null);
    const [inspectModalOpen, setInspectModalOpen] = useState(false);
    const [selectedInspectAlbum, setSelectedInspectAlbum] = useState<Album | null>(null);


    // Which sleeve is pulled forward in the crate.
    const [crateIndex, setCrateIndex] = useState(0);

    // What each turntable is holding. Null means "follow the page player", so
    // the decks are useful before anyone has loaded anything deliberately.
    const [deckCues, setDeckCues] = useState<
        [{ url: string; label: string } | null, { url: string; label: string } | null]
    >([null, null]);

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

    // Cue the decks: the record on screen goes on the left, whatever plays next
    // goes on the right, so the crossfader has something to fade to.
    // Deck B defaults to a record from a *different* album — two decks holding
    // the same release makes the crossfader pointless before you've loaded
    // anything yourself.
    const nextTrack =
        tracks.find((t) => t.album && t.album !== currentTrack?.album && t.audio_url) ??
        (tracks.length > 1 ? tracks[(currentTrackIndex + 1) % tracks.length] : undefined);

    // Group tracks by album.
    // Darkside, Lord Knows and Munchies are video-only and live on the videos
    // page (lib/video-tapes.ts) until their audio is uploaded.
    const albums: Album[] = [
        {
            name: "The Commission",
            artist: "Shadow The Great",
            cover: "/THE COMMISSION.png",
            gradient: "from-amber-500/20 via-orange-600/10 to-red-900/20",
            accentColor: "amber",
            tracks: tracks.filter(t => t.album === "The Commission" || (!t.album && t.title !== "Lost City")),
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


    const getGlobalTrackIndex = (track: Track) => {
        return tracks.findIndex(t => t.id === track.id);
    };

    const playTrack = (index: number) => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent('playMusic', { detail: { trackIndex: index } }));
        }
        setIsPlaying(true);
    };


    return (
        <div className="min-h-screen bg-noir-void relative overflow-hidden">
            {/* The booth carries the page visually; screen readers and search
                engines still need a page title. */}
            <h1 className="sr-only">Music — Loaf Records</h1>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-purple-900/10" />
                <div className="md:hidden absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent-cyan/5 to-transparent opacity-50" />
            </div>

            {/* DESKTOP DJ BOOTH SCENE (Hidden on mobile so mobile has zero vinyl turntable clutter) */}
            <section className="hidden md:block relative pt-20 pb-12">
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
                    leftSource={deckCues[0]?.url ?? currentTrack?.audio_url ?? null}
                    rightSource={deckCues[1]?.url ?? nextTrack?.audio_url ?? null}
                    leftLabel={deckCues[0]?.label ?? currentTrack?.album ?? undefined}
                    rightLabel={deckCues[1]?.label ?? nextTrack?.album ?? undefined}
                    onInspect3D={() => {
                        const found = albums.find(a => a.name === currentTrack?.album) || albums[0];
                        setSelectedInspectAlbum(found);
                        setInspectModalOpen(true);
                    }}
                />
            </section>

            {/* MOBILE FIGMA STUDIO MASTER HEADER (Zero Vinyl Display) */}
            <section className="md:hidden relative pt-20 pb-4 px-4">
                <div className="rounded-3xl border border-white/12 bg-gradient-to-b from-[#14161F] via-[#0B0C10] to-[#07070A] p-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-accent-cyan">
                            24-Bit Studio Master Catalog
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-noir-cloud">
                            {albums.length} Releases
                        </span>
                    </div>
                    <div className="flex items-center gap-3.5">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/15 shrink-0">
                            <Image
                                src={albums[crateIndex]?.cover || "/THE COMMISSION.png"}
                                alt={albums[crateIndex]?.name || "The Commission"}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-400">
                                {albums[crateIndex]?.artist || "Shadow The Great"}
                            </p>
                            <h2 className="font-display text-2xl uppercase tracking-wider text-white truncate">
                                {albums[crateIndex]?.name || "The Commission"}
                            </h2>
                            <p className="font-mono text-[10px] text-noir-cloud mt-0.5">
                                {albums[crateIndex]?.tracks.length || 0} Tracks · Lossless Master
                            </p>
                        </div>
                    </div>
                    {/* Mobile Album Switcher Pills */}
                    <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                        {albums.map((alb, idx) => (
                            <button
                                key={alb.name}
                                type="button"
                                onClick={() => setCrateIndex(idx)}
                                className={`shrink-0 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                                    idx === crateIndex
                                        ? "bg-accent-cyan text-black border-accent-cyan font-bold"
                                        : "bg-white/[0.04] text-noir-cloud border-white/10"
                                }`}
                            >
                                {alb.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative px-4 sm:px-6 pb-40 pt-4 md:pt-8">
                <div className="max-w-7xl mx-auto">
                    <div className="hidden md:flex mb-8 items-baseline justify-between border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                            The Crate
                        </h2>
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-noir-ash">
                            {albums.length} releases
                        </span>
                    </div>

                    <RecordCrate
                        albums={albums}
                        selectedIndex={crateIndex}
                        onSelect={setCrateIndex}
                        currentTrackTitle={currentTrack?.title}
                        isPlaying={isPlaying}
                        onPlayTrack={(track) => {
                            const globalIndex = tracks.findIndex((t) => t.id === track.id);
                            if (globalIndex >= 0) {
                                window.dispatchEvent(
                                    new CustomEvent("playMusic", { detail: { trackIndex: globalIndex } })
                                );
                            }
                        }}
                        onLoadToDeck={(albumIndex, deck) => {
                            const first = albums[albumIndex]?.tracks[0];
                            if (!first?.audio_url) return;
                            setDeckCues((prev) => {
                                const next = [...prev] as typeof prev;
                                next[deck] = { url: first.audio_url, label: albums[albumIndex].name };
                                return next;
                            });
                        }}
                        onBuy={(album) => {
                            setSelectedPurchaseAlbum({
                                name: album.name,
                                price: album.price || 9.99,
                                cover: album.cover,
                                artist: album.artist,
                            });
                            setPurchaseModalOpen(true);
                        }}
                        onInspect={(album) => {
                            const found = albums.find((a) => a.name === album.name) || albums[0];
                            setSelectedInspectAlbum(found);
                            setInspectModalOpen(true);
                        }}
                    />
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
