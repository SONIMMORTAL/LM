"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sedgwick_Ave_Display } from "next/font/google";
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    type Variants,
} from "framer-motion";
import {
    Play,
    ShoppingBag,
    ArrowUpRight,
    Film,
    Volume2,
    Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { playCrateFlipSfx, playNeedleDropSfx, playVhsClunkSfx } from "@/lib/ui-sfx";
import { claimAudio } from "@/lib/audio-bus";
import { requestWelcomeTrack } from "@/lib/welcome-track";
import type { Track } from "@/lib/tracks-server";
import { AlbumPurchaseModal } from "@/components/music/AlbumPurchaseModal";
import { LoafDeck } from "@/components/brand/LoafDeck";
import { OnAirSign } from "@/components/brand/OnAirSign";
import { LostCityHeroTape } from "@/components/home/LostCityHeroTape";
import { NewReleaseFeature } from "@/components/home/NewReleaseFeature";
import { PRIMARY_NAV } from "@/components/layout/navItems";
import type { ChannelUpload } from "@/lib/youtube-feed";


interface ShowcaseAlbum {
    id: string;
    name: string;
    subtitle: string;
    artist: string;
    year: string;
    catalogNo: string;
    stampCode: string;
    cover: string;
    accent: string;
    accentHex: string;
    glowRgba: string;
    price: number;
    producers: string;
    featuredCrew: string[];
    specs: {
        mastering: string;
        console: string;
        format: string;
    };
}

// A CD's silver: a rainbow sheen around the disc, and a clear hub with the hole in the middle
const CD_SHEEN =
    "conic-gradient(from 30deg, #d9dde3, #f5f7fa 8%, #b8c4d6 16%, #ead6f5 24%, #c9f0e8 32%, #f6f3d8 40%, #cfd6e2 50%, #f5f7fa 58%, #c6d0e0 66%, #f1dcf1 74%, #d5f3ec 82%, #f4f1d7 90%, #d9dde3)";
const CD_HUB =
    "radial-gradient(circle, #060608 0 30%, rgba(225,230,238,0.85) 31% 46%, rgba(255,255,255,0.35) 47% 70%, rgba(200,210,225,0.6) 71% 100%)";

const SHOWCASE_ALBUMS: ShowcaseAlbum[] = [
    {
        id: "the-commission",
        name: "The Commission",
        subtitle: "Executive Street Album · 13 Master Cuts",
        artist: "Shadow The Great",
        year: "2026",
        catalogNo: "LR-007-COMM",
        stampCode: "BKLYN // COMMISSION-07",
        cover: "/THE COMMISSION.png",
        accent: "amber",
        accentHex: "#F59E0B",
        glowRgba: "rgba(245, 158, 11, 0.34)",
        price: 9.99,
        producers: "Coyote Beatz · Gradis Nice · King illa",
        featuredCrew: [
            "Coyote Beatz",
            "King illa",
            "Grandpadre",
            "Rah Tha Ruler",
            "Gradis Nice",
            "Nathan Morais",
            "Kid Sanchez",
            "Laron",
            "Kollie",
        ],
        specs: {
            mastering: "24-Bit / 96kHz Tape Master",
            console: "SSL 4000G+ Brooklyn Dungeon",
            format: "WAV + FLAC + 320kbps MP3 Vault",
        },
    },
    {
        id: "lost-city",
        name: "Lost City",
        subtitle: "Brooklyn Boom-Bap Odyssey · 14 Cuts",
        artist: "Shadow The Great",
        year: "2026",
        catalogNo: "LR-002-LOST",
        stampCode: "BKLYN // LOST-CITY-02",
        cover: "/LC1.jpg",
        accent: "cyan",
        accentHex: "#00D9FF",
        glowRgba: "rgba(0, 217, 255, 0.34)",
        price: 9.99,
        producers: "Ruggz · Mixed & Mastered by King illa",
        featuredCrew: ["Ruggz", "Grandpadre", "King illa", "DJ Evil Dee", "Bre Eshe", "Oso Dope"],
        specs: {
            mastering: "MPC One + SP-404SX Analog Sum",
            console: "Loaf Records Studio A · BKLYN",
            format: "WAV + FLAC + 320kbps MP3 Vault",
        },
    },
    {
        id: "more-life",
        name: "More Life",
        subtitle: "Collector Tape Edition · Heavy Soul",
        artist: "Shadow The Great",
        year: "2025",
        catalogNo: "LR-005-LIFE",
        stampCode: "BKLYN // MORE-LIFE-05",
        cover: "/MORE LIFE VINYL.jpg",
        accent: "rose",
        accentHex: "#F43F5E",
        glowRgba: "rgba(244, 63, 94, 0.34)",
        price: 9.99,
        producers: "Loaf Records In-House Production",
        featuredCrew: ["Shadow The Great", "King illa", "Grandpadre"],
        specs: {
            mastering: "Warm Tube-Compressed Master",
            console: "Studer 2-Inch Tape Saturation",
            format: "WAV + FLAC + 320kbps MP3 Vault",
        },
    },
    {
        id: "lftd",
        name: "Live From The Dungeon",
        subtitle: "Raw Underground Tape · Uncut",
        artist: "Shadow The Great",
        year: "2025",
        catalogNo: "LR-003-LFTD",
        stampCode: "BKLYN // DUNGEON-03",
        cover: "/LFTD.jpg",
        accent: "emerald",
        accentHex: "#10B981",
        glowRgba: "rgba(16, 185, 129, 0.34)",
        price: 9.99,
        producers: "Dungeon Crew · Raw Board Mix",
        featuredCrew: ["Shadow The Great", "King illa", "Ruggz", "Oso Dope"],
        specs: {
            mastering: "Uncut Underground Board Capture",
            console: "The Dungeon Console · Brooklyn",
            format: "WAV + FLAC + 320kbps MP3 Vault",
        },
    },
];

/* ═══════════════════════════════════════════════════════════════════════
   THE CREW WALL — the people on the project, tagged up on a strip of wall
   under the album (never over it) and sprayed on one by one
   ═══════════════════════════════════════════════════════════════════════ */

/** Graffiti handstyle, named for 1520 Sedgwick Ave in the Bronx, where hip-hop started. */
const sprayHand = Sedgwick_Ave_Display({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
});

/** White out of the can: a little warm, so it reads as paint rather than UI. */
const SPRAY_WHITE = "#F2EEE3";

// Every writer's tag sits at its own slight angle
const TAG_TILTS = [-4, 3, 2, -3, -2, 4, 3, -2, -3, 2];

/**
 * Paint, not type: a tight halo, a wider faint one for the overspray, and a dark drop.
 * Plain text-shadow, so every phone draws it, and it's painted once rather than per frame.
 */
const sprayShadow = (paint: string) =>
    `0 0 1px ${paint}, 0 0 5px ${paint}73, 0 0 12px ${paint}33, 1.5px 2px 0 rgba(0,0,0,0.85)`;

/**
 * Letters whose bottom-centre carries paint in Sedgwick Ave Display (measured off the
 * glyphs), so a drip hung from the middle of one runs off a stroke instead of thin air.
 */
const DRIPPABLE = new Set("BCEGHIJKOQRSTUVYZbcegilostuvwz");

/** Which letters run, and how far (px). Seeded by the name, so a tag always drips the same way. */
function dripsFor(name: string): Map<number, number> {
    let seed = 2166136261;
    for (const ch of name) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
    const rand = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
        return (seed >>> 0) / 4294967296;
    };

    const letters = [...name].flatMap((ch, i) => (DRIPPABLE.has(ch) ? [i] : []));
    const howMany = name.length > 8 ? 3 : 2;
    const drips = new Map<number, number>();
    for (let k = 0; k < howMany; k++) {
        // One drip per stretch of the name, so they never bunch up
        const from = Math.floor((k * letters.length) / howMany);
        const to = Math.floor(((k + 1) * letters.length) / howMany);
        if (to <= from) continue;
        drips.set(letters[from + Math.floor(rand() * (to - from))], 5 + Math.round(rand() * 8));
    }
    return drips;
}

// One pass when the wall scrolls into view, then nothing animates. Only clip,
// opacity and transform change, so even old phones keep up.
const WALL_VARIANTS: Variants = {
    hidden: {},
    sprayed: { transition: { staggerChildren: 0.09 } },
};

// The can sweeps left to right across each tag
const TAG_VARIANTS: Variants = {
    hidden: { opacity: 0, clipPath: "inset(-16px 110% -28px -16px)" },
    sprayed: {
        opacity: 1,
        clipPath: "inset(-16px -20% -28px -16px)",
        transition: { duration: 0.5, ease: "easeOut", opacity: { duration: 0.15 } },
        transitionEnd: { clipPath: "none" },
    },
};

// ...then the paint runs
const DRIP_VARIANTS: Variants = {
    hidden: { scaleY: 0 },
    sprayed: { scaleY: 1, transition: { delay: 0.4, duration: 0.6, ease: "easeIn" } },
};

interface CrewTagProps {
    name: string;
    count: number;
    paint: string;
    countPaint: string;
    tilt: number;
}

function CrewTag({ name, count, paint, countPaint, tilt }: CrewTagProps) {
    const drips = useMemo(() => dripsFor(name), [name]);

    return (
        <motion.li variants={TAG_VARIANTS} style={{ rotate: tilt }} className="pb-3">
            <span className="sr-only">
                {count > 0 ? `${name}, on ${count} ${count === 1 ? "track" : "tracks"}` : name}
            </span>
            <span
                aria-hidden
                style={{ color: paint, textShadow: sprayShadow(paint) }}
                className={cn(
                    sprayHand.className,
                    // Scales with the phone: ~16px on the smallest screens, 22px from ~420px up
                    "block whitespace-nowrap leading-none text-[length:clamp(16px,5.2vw,22px)]"
                )}
            >
                {[...name].map((ch, i) => {
                    const length = drips.get(i);
                    if (length === undefined) return ch;
                    return (
                        <span key={i} className="relative">
                            {ch}
                            {/* Starts just above the baseline (75% down the letter box), inside the stroke */}
                            <motion.span
                                variants={DRIP_VARIANTS}
                                style={{ height: length, boxShadow: `0 0 4px ${paint}66` }}
                                className="absolute left-[calc(50%-1.5px)] top-[70%] w-[3px] origin-top rounded-b-full bg-current"
                            >
                                <span className="absolute -bottom-[2px] -left-[1px] size-[5px] rounded-full bg-current" />
                            </motion.span>
                        </span>
                    );
                })}
                {count > 0 && (
                    <span
                        className="relative -top-[0.55em] ml-1 text-[0.5em]"
                        style={{ color: countPaint, textShadow: sprayShadow(countPaint) }}
                    >
                        x{count}
                    </span>
                )}
            </span>
        </motion.li>
    );
}

interface MobileStudioLandingProps {
    tracks: Track[];
    /** The newest upload on the Loaf Records YouTube channel, featured under the hero */
    newRelease?: ChannelUpload;
    onSwitchToRoom: () => void;
}

export function MobileStudioLanding({
    tracks,
    newRelease,
    onSwitchToRoom,
}: MobileStudioLandingProps) {
    const { cartCount, setIsCartOpen } = useCart();

    // Active album in the unified 3D Tape Break-Apart + Connected Tracklist Monument
    const [selectedAlbumIdx, setSelectedAlbumIdx] = useState(0);
    const activeAlbum = SHOWCASE_ALBUMS[selectedAlbumIdx];

    // Modals & inline player state
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const [inlineVideoPlaying, setInlineVideoPlaying] = useState(false);

    const prefersReducedMotion = useReducedMotion();

    // Filter tracks for the active showcase album (connected directly to the album stage)
    const albumTracks = useMemo(
        () =>
            tracks.filter((t) => {
                if (activeAlbum.name === "The Commission") {
                    return t.album === "The Commission" || (!t.album && t.title !== "Lost City");
                }
                return t.album === activeAlbum.name;
            }),
        [tracks, activeAlbum.name]
    );

    // The people on the project — each name is tagged on the wall under the album, with the
    // number of tracks they appear on (counted straight from the real tracklist).
    const projectCredits = activeAlbum.featuredCrew.map((name) => {
        const needle = name.toLowerCase();
        const count = albumTracks.filter((t) => t.title.toLowerCase().includes(needle)).length;
        return { name, count };
    });

    /* ═══════════════════════════════════════════════════════════════════════
       CHAPTER 01 — ALBUM OPENS UP AS THE USER SCROLLS
       Progress runs 0 → 1 while the stage travels from 80% down the viewport
       to dead-center. No sticky runway, so there is no dead space underneath.
       ═══════════════════════════════════════════════════════════════════════ */
    const masterStageRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: masterScroll } = useScroll({
        target: masterStageRef,
        offset: ["start 80%", "center 50%"],
    });

    // Tapping the cover temporarily takes over; scrolling again hands control back.
    const masterManualMode = useMotionValue(0);
    const masterManualVal = useMotionValue(0);
    const masterTapScroll = useRef(0);

    const masterTarget = useTransform(
        [masterScroll, masterManualMode, masterManualVal],
        ([s, mode, m]) =>
            (mode as number) > 0.5 ? (m as number) : Math.max(0, Math.min(1, s as number))
    );

    const masterExplode = useSpring(masterTarget, {
        stiffness: 120,
        damping: 24,
        mass: 0.5,
    });

    useMotionValueEvent(masterScroll, "change", (s) => {
        if (prefersReducedMotion) return;
        if (masterManualMode.get() > 0.5 && Math.abs(s - masterTapScroll.current) > 0.2) {
            masterManualMode.set(0);
        }
    });

    // Rig: starts as a big, flat, front-facing cover → tilts into an exploded stack
    const mRigRotateX = useTransform(masterExplode, [0, 1], [0, 22]);
    const mRigRotateY = useTransform(masterExplode, [0, 1], [0, -15]);
    const mRigRotateZ = useTransform(masterExplode, [0, 1], [0, 3]);
    const mRigScale = useTransform(masterExplode, [0, 1], [1.12, 0.92]);

    // Front cover
    const mL1X = useTransform(masterExplode, [0, 1], [0, -14]);
    const mL1Y = useTransform(masterExplode, [0, 1], [0, -90]);
    const mL1Z = useTransform(masterExplode, [0, 1], [12, 110]);

    // The disc, sliding out of the case and turning as it comes
    const mDiscX = useTransform(masterExplode, [0, 1], [0, 22]);
    const mDiscY = useTransform(masterExplode, [0, 1], [0, -26]);
    const mDiscZ = useTransform(masterExplode, [0, 1], [0, 50]);
    // Hidden and still until the case has opened, so a fast scroll never shows the disc
    // turning through the front cover while the two are still pressed together
    const mDiscSpin = useTransform(masterExplode, [0.35, 1], [0, 140]);
    const mDiscOpacity = useTransform(masterExplode, [0, 0.25, 0.4], [0, 0, 1]);

    // The back of the case: tracklist, features, barcode
    const mBackX = useTransform(masterExplode, [0, 1], [0, -12]);
    const mBackY = useTransform(masterExplode, [0, 1], [0, 46]);
    const mBackZ = useTransform(masterExplode, [0, 1], [-12, -40]);
    const mBackOpacity = useTransform(masterExplode, [0, 0.15, 0.3], [0, 0, 1]);

    // Loaf crate base
    const mL5X = useTransform(masterExplode, [0, 1], [0, -10]);
    const mL5Y = useTransform(masterExplode, [0, 1], [0, 112]);
    const mL5Z = useTransform(masterExplode, [0, 1], [-24, -110]);
    const mL5Opacity = useTransform(masterExplode, [0, 0.12, 1], [0, 1, 1]);

    // Thread that draws down from the album into the tracklist
    const mThread = useTransform(masterExplode, [0.55, 1], [0, 1]);

    // Reduced motion: skip the scroll choreography and show everything opened up.
    useEffect(() => {
        if (!prefersReducedMotion) return;
        masterManualMode.set(1);
        masterManualVal.set(1);
    }, [prefersReducedMotion, masterManualMode, masterManualVal]);

    // Welcome to the realm — Lost City greets the visitor when the mobile site boots.
    // (Once per page load; it stands down as soon as they pick any other media.)
    useEffect(() => {
        requestWelcomeTrack("Lost City");
    }, []);

    // ── Play Track in Global Dynamic Island Player ──────────────────
    const handlePlayTrack = useCallback(
        (track: Track | undefined) => {
            if (!track) return;
            playNeedleDropSfx();
            const globalIdx = tracks.findIndex((t) => t.id === track.id);
            if (globalIdx >= 0 && typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("playMusic", { detail: { trackIndex: globalIdx } })
                );
                setPlayingTrackId(track.id);
            }
        },
        [tracks]
    );

    const handlePlayActiveAlbum = useCallback(() => {
        const firstPlayable = albumTracks.find((t) => !!t.audio_url) || albumTracks[0] || tracks[0];
        handlePlayTrack(firstPlayable);
    }, [albumTracks, tracks, handlePlayTrack]);

    const toggleMasterExplode = useCallback(() => {
        playCrateFlipSfx();
        masterTapScroll.current = masterScroll.get();
        masterManualVal.set(masterExplode.get() > 0.5 ? 0 : 1);
        masterManualMode.set(1);
    }, [masterScroll, masterExplode, masterManualMode, masterManualVal]);

    return (
        <div className="relative min-h-screen bg-[#060608] text-[#F5F5F7] pb-28 overflow-x-hidden selection:bg-amber-400 selection:text-black">
            {/* ═══════════════════════════════════════════════════════════
                STAMPED GLOBAL ATMOSPHERE — BRICK DUNGEON & GRAFFITI TEXTURE
                (Eliminates generic flat black background!)
               ═══════════════════════════════════════════════════════════ */}
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                {/* Brick Dungeon Mural Watermark */}
                <Image
                    src="/brand/dungeon-crew.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-top opacity-[0.16] scale-105"
                />
                {/* Halftone Dot & Street Grain Overlay */}
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(245, 158, 11, 0.22) 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                    }}
                />
                {/* Deep Noir Vignette */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 95% 70% at 50% 15%, rgba(245,158,11,0.12) 0%, rgba(6,6,8,0.88) 55%, #050507 100%)",
                    }}
                />
            </div>

            {/* ═══════════════════════════════════════════════════════════
                STICKY HEADER
               ═══════════════════════════════════════════════════════════ */}
            {/* The nav banner stands on its own: deck, tabs, bag. The hero below carries the name */}
            <header className="sticky top-0 z-40 bg-[#07070A]/90 backdrop-blur-xl border-b-2 border-amber-400/25 safe-top">
                <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2">
                    {/* The Loaf Records deck — same mark as the desktop */}
                    <LoafDeck size={40} label="Loaf Records" priority />

                    {/* Stamped Navigation Tabs — faded at the edges so it reads as a scroller */}
                    <nav
                        aria-label="Loaf Records mobile sections"
                        className="min-w-0 flex-1 flex items-center gap-1.5 overflow-x-auto hide-scrollbar px-1 [mask-image:linear-gradient(to_right,transparent,black_6px,black_calc(100%-20px),transparent)]"
                    >
                        {PRIMARY_NAV.map((pill) => {
                            const pillClass =
                                "shrink-0 inline-flex items-center rounded-lg border border-white/15 bg-black/70 px-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-noir-cloud hover:text-amber-400 hover:border-amber-400/50 transition-colors";
                            // Through the router, so the mini player keeps playing across pages
                            return (
                                <Link key={pill.label} href={pill.href} onClick={() => playCrateFlipSfx()} className={pillClass}>
                                    {pill.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        type="button"
                        onClick={() => {
                            playCrateFlipSfx();
                            onSwitchToRoom();
                        }}
                        className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white hover:border-amber-400 transition-colors"
                    >
                        <Monitor className="w-3.5 h-3.5 text-amber-400" />
                        <span>Room View</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Open shopping bag"
                        className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-amber-400/35 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent-cyan text-black font-mono text-[9px] font-black flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                HERO MONUMENT — STAMPED LOAF IDENTITY + LOAF MAN MASCOT
               ═══════════════════════════════════════════════════════════ */}
            <section className="relative z-10 px-3 sm:px-4 pt-4 pb-6 max-w-2xl mx-auto">
                <div className="relative rounded-[26px] border-2 border-amber-400/35 bg-[#0B0B0F] shadow-[0_28px_80px_rgba(0,0,0,0.95)] overflow-hidden">
                    {/* Full-bleed banner: the Dungeon Crew mural, giving way to Lost City on tape */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                        <LostCityHeroTape />
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/45 to-black/30"
                        />

                        {/* On-air lightbox, like the one over the studio door */}
                        <div className="absolute top-3 left-3">
                            <OnAirSign>Live From The Dungeon</OnAirSign>
                        </div>

                        {/* Loaf Man as a corner watermark with the label line beside him; the video carries the rest */}
                        <div className="absolute bottom-3 left-2.5 flex items-center gap-1 pointer-events-none">
                            <div className="relative w-10 h-12 shrink-0 opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                                <Image
                                    src="/loafman.png"
                                    alt=""
                                    fill
                                    sizes="48px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <h1 className="font-mono text-[10px] uppercase tracking-[0.2em] min-[360px]:tracking-[0.3em] text-amber-400 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                                <span className="sr-only">Shadow The Great — </span>
                                LOAF RECORDS · BROOKLYN NY
                            </h1>
                        </div>
                    </div>

                    {/* Stamped Crew Roster Ticker Bar */}
                    <div className="border-y border-amber-400/20 bg-black/90 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar font-mono text-[9px] uppercase tracking-[0.22em]">
                        <span className="text-amber-400 font-bold shrink-0">THE CREW:</span>
                        <span className="text-white/85 shrink-0">SHADOW THE GREAT</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="text-white/85 shrink-0">KING ILLA</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="text-white/85 shrink-0">RUGGZ</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="text-white/85 shrink-0">GRANDPADRE</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="text-white/85 shrink-0">RAH THA RULER</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="text-white/85 shrink-0">COYOTE BEATZ</span>
                    </div>

                    {/* Hero Action Console */}
                    <div className="p-4 bg-gradient-to-b from-[#111218] to-[#090A0E]">
                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Names whichever record is picked in the switcher below, since that's what it plays */}
                            <button
                                type="button"
                                onClick={handlePlayActiveAlbum}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 px-3 text-left text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-[0.98] transition-transform"
                            >
                                <Play className="w-4 h-4 shrink-0 fill-current" />
                                <span className="min-w-0">
                                    <span className="block font-mono text-[9px] font-black uppercase tracking-[0.24em] text-black/70">
                                        Spin
                                    </span>
                                    <span className="block font-display text-[length:clamp(14px,4.4vw,17px)] uppercase leading-[1.05] tracking-[0.03em]">
                                        {activeAlbum.name}
                                    </span>
                                </span>
                            </button>

                            <Link
                                href="/shop"
                                onClick={() => playCrateFlipSfx()}
                                className="flex items-center gap-2 rounded-xl border-2 border-accent-cyan/50 bg-accent-cyan/10 py-3 px-3 text-left text-accent-cyan hover:bg-accent-cyan hover:text-black active:scale-[0.98] transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4 shrink-0" />
                                <span className="min-w-0">
                                    <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.24em] opacity-80">
                                        Shop
                                    </span>
                                    <span className="block font-display text-[length:clamp(14px,4.4vw,17px)] uppercase leading-[1.05] tracking-[0.03em]">
                                        The Drop
                                    </span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW RELEASE — whatever went up on the channel last */}
            {newRelease && <NewReleaseFeature video={newRelease} />}

            {/* ═══════════════════════════════════════════════════════════
                CHAPTER 01 — THE ALBUM
                Scrolling opens the album up like a CD case (front, disc, back insert), the people
                on the project are sprayed on the wall underneath it, and the
                tracklist reveals below that.
               ═══════════════════════════════════════════════════════════ */}
            <section
                id="master-anatomy"
                aria-label={`${activeAlbum.name} by ${activeAlbum.artist} — album and tracklist`}
                className="relative z-10 px-3 sm:px-4 py-4 max-w-2xl mx-auto"
            >
                <div className="relative rounded-[28px] border-2 border-white/15 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden">
                    {/* Per-album ambient glow */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-full h-[620px] transition-[background] duration-700"
                        style={{
                            background: `radial-gradient(circle at 50% 48%, ${activeAlbum.glowRgba} 0%, transparent 70%)`,
                        }}
                    />

                    {/* ── Album header + switcher ── */}
                    <div className="relative z-20 p-4 sm:p-5 border-b border-white/10 bg-black/60">
                        <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                                <p
                                    className="font-mono text-[9px] font-bold uppercase tracking-[0.26em]"
                                    style={{ color: activeAlbum.accentHex }}
                                >
                                    {activeAlbum.artist} · {activeAlbum.year}
                                </p>
                                <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-[0.03em] text-white leading-none mt-1 truncate">
                                    {activeAlbum.name}
                                </h2>
                            </div>
                            <span className="shrink-0 rounded border border-white/15 bg-black/70 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/70">
                                {activeAlbum.catalogNo}
                            </span>
                        </div>

                        {/* Switching album updates the artwork, the crew wall and the tracklist */}
                        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {SHOWCASE_ALBUMS.map((alb, idx) => {
                                const isSelected = idx === selectedAlbumIdx;
                                return (
                                    <button
                                        key={alb.id}
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={() => {
                                            playCrateFlipSfx();
                                            setSelectedAlbumIdx(idx);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl p-1.5 border text-left transition-all",
                                            isSelected
                                                ? "bg-white text-black border-white shadow-lg"
                                                : "bg-black/60 text-noir-cloud border-white/10 hover:text-white hover:border-white/25"
                                        )}
                                    >
                                        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-black/20">
                                            <Image
                                                src={alb.cover}
                                                alt=""
                                                fill
                                                sizes="28px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p
                                                className={cn(
                                                    "font-mono text-[9px] font-bold uppercase tracking-wider truncate",
                                                    isSelected ? "text-black" : "text-white"
                                                )}
                                            >
                                                {alb.name}
                                            </p>
                                            <p
                                                className={cn(
                                                    "font-mono text-[7px] uppercase tracking-widest truncate",
                                                    isSelected ? "text-black/70" : "text-noir-ash"
                                                )}
                                            >
                                                {alb.year}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Album stage: opens up as you scroll, inside its own display case.
                         The clip-path keeps every layer in the box, Safari's 3D included,
                         which ignores overflow:hidden on a rounded parent. ── */}
                    <div className="relative z-20 px-3 sm:px-4 pt-5 pb-1">
                        <div
                            ref={masterStageRef}
                            className="relative h-[460px] sm:h-[500px] w-full flex items-center justify-center select-none rounded-2xl border border-white/10 bg-black/30 shadow-[inset_0_2px_28px_rgba(0,0,0,0.85)] [clip-path:inset(0_round_1rem)]"
                            style={{ perspective: "1350px" }}
                        >
                            <span aria-hidden className="absolute left-3 top-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-white/35">
                                Listening booth · {activeAlbum.catalogNo}
                            </span>
                            <motion.div
                                className="relative w-52 h-52 sm:w-72 sm:h-72 flex items-center justify-center will-change-transform"
                                style={{
                                    transformStyle: "preserve-3d",
                                    rotateX: mRigRotateX,
                                    rotateY: mRigRotateY,
                                    rotateZ: mRigRotateZ,
                                    scale: mRigScale,
                                }}
                            >
                                {/* Base: Loaf crate + crown seal */}
                                <motion.div
                                    aria-hidden
                                    style={{ x: mL5X, y: mL5Y, z: mL5Z, opacity: mL5Opacity }}
                                    className="absolute inset-0 rounded-2xl border-2 border-amber-400/60 bg-[#0D0B07] overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.95)] will-change-transform"
                                >
                                    <Image
                                        src="/loafmancrate.jpg"
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-70"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                        <LoafDeck size={36} />
                                        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400/90">
                                            {activeAlbum.catalogNo}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Back of the case: spines, the tracklist with its features, barcode */}
                                <motion.div
                                    aria-hidden
                                    style={{ x: mBackX, y: mBackY, z: mBackZ, opacity: mBackOpacity }}
                                    className="absolute inset-0 rounded-[6px] border-2 border-white/30 bg-[#0E0F14] overflow-hidden shadow-[0_22px_45px_rgba(0,0,0,0.92)] will-change-transform"
                                >
                                    <Image
                                        src={activeAlbum.cover}
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-20 blur-[2px] scale-110"
                                    />
                                    {/* Folded spines, printed down each side */}
                                    {(["left-0", "right-0"] as const).map((side) => (
                                        <span
                                            key={side}
                                            className={cn(
                                                "absolute inset-y-0 flex w-[7%] items-center justify-center overflow-hidden border-white/20",
                                                side === "left-0" ? "left-0 border-r" : "right-0 border-l"
                                            )}
                                            style={{ backgroundColor: activeAlbum.accentHex }}
                                        >
                                            <span className="whitespace-nowrap font-mono text-[6px] font-black uppercase tracking-[0.2em] text-black [writing-mode:vertical-rl]">
                                                {activeAlbum.artist} · {activeAlbum.name}
                                            </span>
                                        </span>
                                    ))}
                                    <div className="absolute inset-y-0 left-[9%] right-[9%] flex flex-col py-2">
                                        <p className="truncate font-display text-[11px] sm:text-sm uppercase leading-none tracking-[0.06em] text-white">
                                            {activeAlbum.name}
                                        </p>
                                        <ol className="mt-1 min-h-0 flex-1 overflow-hidden text-[6.5px] sm:text-[8px] leading-[1.4] text-white/85">
                                            {albumTracks.slice(0, 14).map((track, i) => (
                                                <li key={track.id} className="truncate">
                                                    <span className="font-mono text-white/50">{String(i + 1).padStart(2, "0")}</span>{" "}
                                                    {track.title}
                                                </li>
                                            ))}
                                            {albumTracks.length > 14 && (
                                                <li className="font-mono text-white/50">+{albumTracks.length - 14} more</li>
                                            )}
                                        </ol>
                                        <div className="mt-1 flex items-end justify-between gap-2">
                                            <span className="font-mono text-[5.5px] sm:text-[7px] uppercase leading-tight tracking-[0.14em] text-white/60">
                                                Loaf Records · {activeAlbum.catalogNo}
                                                <br />℗ {activeAlbum.year} Brooklyn NY
                                            </span>
                                            {/* Barcode */}
                                            <span
                                                className="h-5 w-12 shrink-0 bg-white"
                                                style={{
                                                    backgroundImage:
                                                        "repeating-linear-gradient(90deg, #000 0 1px, transparent 1px 2px, #000 2px 4px, transparent 4px 5px, #000 5px 6px, transparent 6px 8px)",
                                                    backgroundClip: "content-box",
                                                    padding: "2px 3px",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* The disc: silver rim, the art printed on it, the clear hub */}
                                <motion.div
                                    aria-hidden
                                    style={{ x: mDiscX, y: mDiscY, z: mDiscZ, opacity: mDiscOpacity }}
                                    className="absolute inset-0 flex items-center justify-center will-change-transform"
                                >
                                    <motion.div
                                        style={{ rotate: mDiscSpin, background: CD_SHEEN }}
                                        className="relative aspect-square w-[94%] rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.9)]"
                                    >
                                        <span className="absolute inset-[3%] overflow-hidden rounded-full ring-1 ring-black/30">
                                            <Image src={activeAlbum.cover} alt="" fill sizes="280px" className="object-cover" />
                                            {/* Gloss across the print */}
                                            <span className="absolute inset-0 rounded-full opacity-35 mix-blend-screen" style={{ background: CD_SHEEN }} />
                                        </span>
                                        <span className="absolute inset-[34%] rounded-full" style={{ background: CD_HUB }} />
                                    </motion.div>
                                </motion.div>

                                {/* Front cover */}
                                <motion.div
                                    style={{ x: mL1X, y: mL1Y, z: mL1Z }}
                                    onClick={toggleMasterExplode}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${activeAlbum.name} cover — tap to open or close`}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleMasterExplode();
                                        }
                                    }}
                                    className="absolute inset-0 rounded-[6px] overflow-hidden border-2 border-white/40 bg-[#14161F] shadow-[0_26px_55px_rgba(0,0,0,0.95)] cursor-pointer will-change-transform"
                                >
                                    {/* Loaded with the page, so the cover is there before anything opens up behind it */}
                                    <Image
                                        src={activeAlbum.cover}
                                        alt={`${activeAlbum.name} album cover`}
                                        fill
                                        loading="eager"
                                        sizes="(max-width: 640px) 208px, 288px"
                                        className="object-cover"
                                    />
                                    {/* The jewel case's hinge down the left edge */}
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute inset-y-0 left-0 w-[6%] border-r border-white/30 bg-gradient-to-r from-white/25 via-white/10 to-white/5"
                                    />
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/15"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                    {/* ── Featuring: who's on it, tagged up under the album, never over it ── */}
                    <div className="relative z-20 mx-3 sm:mx-4 mt-3 rounded-2xl border border-white/10 bg-black/25 px-3 pt-3 overflow-hidden">
                        <p
                            className="text-center font-mono text-[9px] font-bold uppercase tracking-[0.26em]"
                            style={{ color: activeAlbum.accentHex }}
                        >
                            Featuring
                        </p>
                        {/* Keyed by album, so switching records sprays the new crew on fresh */}
                        <motion.ul
                            key={activeAlbum.id}
                            variants={WALL_VARIANTS}
                            initial={prefersReducedMotion ? "sprayed" : "hidden"}
                            whileInView="sprayed"
                            viewport={{ once: true, amount: 0.4 }}
                            className="mt-2 flex flex-wrap items-start justify-center gap-x-4 gap-y-0.5"
                        >
                            {projectCredits.map((credit, i) => {
                                const paint = i % 2 === 0 ? activeAlbum.accentHex : SPRAY_WHITE;
                                return (
                                    <CrewTag
                                        key={credit.name}
                                        name={credit.name}
                                        count={credit.count}
                                        paint={paint}
                                        countPaint={paint === SPRAY_WHITE ? activeAlbum.accentHex : SPRAY_WHITE}
                                        tilt={TAG_TILTS[i % TAG_TILTS.length]}
                                    />
                                );
                            })}
                        </motion.ul>
                    </div>

                    {/* ── Tracklist — revealed directly under the album ── */}
                    <div
                        id="studio-tracks"
                        className="relative z-20 px-4 sm:px-5 pb-5"
                    >
                        {/* Thread tying the album to its tracklist */}
                        <motion.div
                            aria-hidden
                            style={{ scaleY: mThread, backgroundColor: activeAlbum.accentHex }}
                            className="mx-auto w-[2px] h-8 origin-top rounded-full opacity-70"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center justify-between gap-3 pt-2 pb-3 mb-3 border-b border-white/10"
                        >
                            <div className="min-w-0">
                                <h3 className="font-display text-2xl uppercase tracking-wider text-white leading-none">
                                    Tracklist
                                </h3>
                                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-noir-cloud mt-1">
                                    {albumTracks.length} {albumTracks.length === 1 ? "track" : "tracks"} · {activeAlbum.year}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handlePlayActiveAlbum}
                                    aria-label={`Play ${activeAlbum.name}`}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white"
                                >
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPurchaseModalOpen(true)}
                                    className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3.5 py-2.5 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>${activeAlbum.price.toFixed(2)}</span>
                                </button>
                            </div>
                        </motion.div>

                        {albumTracks.length === 0 ? (
                            <p className="py-6 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-noir-cloud">
                                Dropping soon
                            </p>
                        ) : (
                            <ol className="space-y-1.5">
                                {albumTracks.map((track, idx) => {
                                    const isCurrent = playingTrackId === track.id;
                                    const playable = Boolean(track.audio_url);
                                    return (
                                        <motion.li
                                            key={`${activeAlbum.id}-${track.id}`}
                                            initial={{ opacity: 0, y: 22 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.4 }}
                                            transition={{
                                                duration: 0.45,
                                                delay: Math.min(idx, 6) * 0.04,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                        >
                                            <button
                                                type="button"
                                                disabled={!playable}
                                                onClick={() => handlePlayTrack(track)}
                                                className={cn(
                                                    "w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-colors",
                                                    playable
                                                        ? "hover:border-amber-400/50 active:scale-[0.99]"
                                                        : "opacity-45 cursor-not-allowed",
                                                    isCurrent
                                                        ? "bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                                                        : "bg-[#11131A]/90 border-white/[0.07]"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span
                                                        className={cn(
                                                            "w-7 shrink-0 font-mono text-[11px] font-black tabular-nums",
                                                            isCurrent ? "text-amber-400" : "text-noir-ash"
                                                        )}
                                                    >
                                                        {String(idx + 1).padStart(2, "0")}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p
                                                            className={cn(
                                                                "text-xs sm:text-sm font-bold truncate",
                                                                isCurrent ? "text-amber-300" : "text-white"
                                                            )}
                                                        >
                                                            {track.title}
                                                        </p>
                                                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-noir-cloud truncate">
                                                            {track.artist || activeAlbum.artist}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={cn(
                                                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
                                                        isCurrent
                                                            ? "bg-amber-400 text-black border-amber-400"
                                                            : "bg-black/60 text-white/80 border-white/15"
                                                    )}
                                                >
                                                    {isCurrent ? (
                                                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                                                    ) : (
                                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                                    )}
                                                </span>
                                            </button>
                                        </motion.li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                CHAPTER 03 — LOST CITY CINEMA STAGE & LOAF FILMS HOUSE
               ═══════════════════════════════════════════════════════════ */}
            <section
                id="cinema-stage"
                aria-label="Lost City Screening Room"
                className="relative z-10 px-3 sm:px-4 py-4 max-w-2xl mx-auto"
            >
                <div className="rounded-[28px] border-2 border-white/15 bg-[#0A0B10]/95 p-4 sm:p-5 overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.26em] text-amber-400 block">
                                LOAF FILMS
                            </span>
                            <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-white leading-none mt-0.5">
                                Lost City — Official Visual
                            </h2>
                        </div>
                        <Link
                            href="/videos"
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300"
                        >
                            <Film className="w-3.5 h-3.5" />
                            <span>TV Room ↗</span>
                        </Link>
                    </div>

                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
                        {inlineVideoPlaying ? (
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/OOx9QAeRo8E?autoplay=1&rel=0&modestbranding=1&playsinline=1"
                                title="Shadow The Great — Lost City"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    playVhsClunkSfx();
                                    claimAudio("video");
                                    setInlineVideoPlaying(true);
                                }}
                                className="group relative w-full h-full text-left"
                            >
                                <Image
                                    src="/LC1.jpg"
                                    alt="Lost City Official Video"
                                    fill
                                    sizes="(max-width: 768px) 92vw, 600px"
                                    className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-16 h-16 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] group-active:scale-95 transition-transform">
                                        <Play className="w-7 h-7 fill-current ml-0.5" />
                                    </span>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                    <div>
                                        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400 block">
                                            OFFICIAL VIDEO
                                        </span>
                                        <span className="font-display text-lg uppercase tracking-wider text-white">
                                            Shadow The Great — Lost City
                                        </span>
                                    </div>
                                    <span className="rounded-lg bg-black/85 border border-amber-400/40 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-amber-300">
                                        WATCH
                                    </span>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Loaf Films Production Strip */}
                    <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/15 bg-black/70 px-3.5 py-3">
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-black border border-white/15 shrink-0">
                                <Image
                                    src="/LOAFFILMS.png"
                                    alt="Loaf Films"
                                    fill
                                    sizes="36px"
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-white">
                                    Loaf Films Production House
                                </p>
                                <p className="font-mono text-[8px] uppercase tracking-widest text-noir-cloud">
                                    Music Videos · Direction · Brooklyn NY
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/loaf-films"
                            className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400"
                        >
                            <span>Book</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* MODALS */}
            <AlbumPurchaseModal
                isOpen={purchaseModalOpen}
                onClose={() => setPurchaseModalOpen(false)}
                album={{
                    name: activeAlbum.name,
                    price: activeAlbum.price,
                    cover: activeAlbum.cover,
                    artist: activeAlbum.artist,
                }}
            />
        </div>
    );
}
