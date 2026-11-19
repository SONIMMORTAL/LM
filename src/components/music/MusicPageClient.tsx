"use client";

import { useState, useEffect } from "react";
import { AlbumPurchaseModal } from "@/components/music/AlbumPurchaseModal";
import { DJSceneHero } from "@/components/music/DJSceneHero";
import { VinylInspectModal } from "@/components/three/VinylInspectModal";
import { RecordCrate } from "@/components/music/RecordCrate";
import { RecordShopMobile } from "@/components/music/RecordShopMobile";
import { NewAlbumBanner } from "@/components/music/NewAlbumBanner";
import { ReleasePurchaseModal } from "@/components/music/ReleasePurchaseModal";
import { RELEASES, type ReleaseProduct } from "@/lib/releases";
import type { Track } from "@/lib/tracks-server";

const GOD_IS_GOOD = RELEASES["god-is-good"];

// Album name → edge-trimmed lightweight deluxe-vinyl WebP render (spins on the DJ decks)
const ALBUM_VINYLS: Record<string, string> = {
    "God Is Good": "/vinyl-opt/god-is-good-deluxe-vinyl-hd.webp",
    "The Commission": "/vinyl-opt/THE-COMMISSION-7-deluxe-vinyl-hd.webp",
    "Lost City": "/vinyl-opt/LC1-2-deluxe-vinyl-hd.webp",
    "More Life": "/vinyl-opt/MORE-LIFE-VINYL-5-deluxe-vinyl-hd.webp",
    "Live From The Dungeon": "/vinyl-opt/LFTD-3-deluxe-vinyl-hd.webp",
};
const DEFAULT_VINYL = "/vinyl-opt/LFTD-3-deluxe-vinyl-hd.webp";

interface Album {
    name: string;
    artist: string;
    cover: string;
    tracks: Track[];
    gradient: string;
    accentColor: string;
    price?: number;
    /** Sold name-your-price through the site; its tracks are 20-second previews */
    nameYourPrice?: boolean;
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
        // The new album leads the crate: its previews play, and it sells name-your-price
        {
            name: GOD_IS_GOOD.name,
            artist: GOD_IS_GOOD.by,
            cover: GOD_IS_GOOD.cover,
            gradient: "from-sky-500/20 via-amber-200/10 to-blue-900/20",
            accentColor: "sky",
            tracks: tracks.filter((t) => t.album === GOD_IS_GOOD.name),
            price: GOD_IS_GOOD.minPrice,
            nameYourPrice: true,
        },
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
            cover: "/more-life-cover-hd.jpg",
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


    // God Is Good checks out name-your-price; every other album, the fixed-price checkout
    const [buyingRelease, setBuyingRelease] = useState<ReleaseProduct | null>(null);
    const buy = (album: { name: string; price?: number; cover: string; artist: string }) => {
        if (album.name === GOD_IS_GOOD.name) {
            setBuyingRelease(GOD_IS_GOOD);
            return;
        }
        setSelectedPurchaseAlbum({ name: album.name, price: album.price || 9.99, cover: album.cover, artist: album.artist });
        setPurchaseModalOpen(true);
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


    return (
        <div className="min-h-screen bg-transparent text-[#141714] relative overflow-hidden">
            {/* The booth carries the page visually; screen readers and search
                engines still need a page title. */}
            <h1 className="sr-only">Music — Loaf Records</h1>

            {/* DESKTOP DJ BOOTH SCENE (Hidden on mobile so mobile has zero vinyl turntable clutter) */}
            <section className="hidden md:block relative pt-24 pb-10">
                <DJSceneHero
                    leftVinyl={
                        (currentTrack?.album && ALBUM_VINYLS[currentTrack.album]) ||
                        DEFAULT_VINYL
                    }
                    rightVinyl={
                        currentTrack?.album === "The Commission"
                            ? "/vinyl-opt/LC1-2-deluxe-vinyl-hd.webp"
                            : "/vinyl-opt/THE-COMMISSION-7-deluxe-vinyl-hd.webp"
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

            {/* Big screens: the new album, between the booth and the crate */}
            <div className="hidden md:block px-4 sm:px-6">
                <NewAlbumBanner className="mx-auto max-w-7xl" />
            </div>

            {/* PHONES: the record shop — the new album, the crate, the record you picked, its tracklist */}
            <RecordShopMobile
                lead={<NewAlbumBanner />}
                records={albums}
                vinyls={ALBUM_VINYLS}
                selectedIndex={crateIndex}
                onSelect={setCrateIndex}
                currentTrackTitle={currentTrack?.title}
                isPlaying={isPlaying}
                onPlayTrack={(track) => {
                    const globalIndex = getGlobalTrackIndex(track);
                    if (globalIndex >= 0) playTrack(globalIndex);
                }}
                onBuy={buy}
            />

            <section className="hidden md:block relative px-4 sm:px-6 pb-40 pt-8">
                <div className="max-w-7xl mx-auto">
                    <div className="hidden md:flex mb-8 items-baseline justify-between border-b-2 border-[#141714]/15 pb-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#141714]">
                            The Crate
                        </h2>
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#61675E]">
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
                        onBuy={buy}
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
                onOpenPurchaseModal={buy}
            />

            <ReleasePurchaseModal release={buyingRelease} onClose={() => setBuyingRelease(null)} />
        </div>
    );
}
