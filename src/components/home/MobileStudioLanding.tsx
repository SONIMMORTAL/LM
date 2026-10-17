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
import type { PrintfulProduct } from "@/lib/printful";
import { AlbumPurchaseModal } from "@/components/music/AlbumPurchaseModal";
import { LoafDeck } from "@/components/brand/LoafDeck";
import { OnAirSign } from "@/components/brand/OnAirSign";

interface ShowcaseAlbum {
    id: string;
    name: string;
    subtitle: string;
    artist: string;
    year: string;
    catalogNo: string;
    stampCode: string;
    cover: string;
    /** Layer 2 artwork: Crew / Back cover / Liner photography from the tape */
    linerArt: string;
    linerCaption: string;
    /** Layer 3 artwork: Graffiti blackbook / Street art insert */
    insertArt: string;
    insertCaption: string;
    /** Layer 4 artwork: Studio / Live session photography */
    sessionArt: string;
    sessionCaption: string;
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
        linerArt: "/ChatGPT Image Jul 12, 2026, 11_17_09 PM.png",
        linerCaption: "THE DUNGEON CREW · SHADOW · KING ILLA · RUGGZ · RAH THA RULER",
        insertArt: "/gallery/blackbook-spread.jpg",
        insertCaption: "ORIGINAL BLACKBOOK LYRIC & GRAFFITI INSERT · BROOKLYN NY",
        sessionArt: "/MUSICBACKGRND.png",
        sessionCaption: "LOAF RECORDS ANALOG MIXING BOARD · 24-BIT / 96KHZ MASTER",
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
        linerArt: "/LC2.jpg",
        linerCaption: "PRODUCED BY RUGGZ · MIXED BY KING ILLA · MPC ONE & SP-404SX",
        insertArt: "/gallery/box-truck-portrait.jpg",
        insertCaption: "BROOKLYN BOX-TRUCK GRAFFITI & STREET ARCHIVE INSERT",
        sessionArt: "/LFTD3.jpg",
        sessionCaption: "NEW YORK STREET PORTRAIT SERIES · ARCHIVAL PRINT",
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
        linerArt: "/gallery/noxer-canvas.jpg",
        linerCaption: "NOXER CANVAS STREET ART EDITION · LOAF GALLERY",
        insertArt: "/gallery/rooftop-throwies.jpg",
        insertCaption: "BROOKLYN ROOFTOP THROWIES ·LIMITED COLLECTOR SLEEVE",
        sessionArt: "/LC2.jpg",
        sessionCaption: "HARDWARE SAMPLER SESSION · SP-404SX + MPC",
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
        linerArt: "/LFTD2.jpg",
        linerCaption: "LIVE STAGE ENERGY · BROOKLYN UNDERGROUND SESSION",
        insertArt: "/LFTD3.jpg",
        insertCaption: "STÜSSY NY ARCHIVE PHOTOGRAPH · LINER BOOKLET",
        sessionArt: "/ChatGPT Image Jul 12, 2026, 11_17_09 PM.png",
        sessionCaption: "THE BRICK DUNGEON HEADQUARTERS · LOAF CREW",
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

const FALLBACK_MERCH: PrintfulProduct[] = [
    {
        id: 101,
        external_id: "loaf-hoodie",
        name: "Loaf Records Heavyweight Studio Hoodie",
        variants: 5,
        synced: 5,
        thumbnail_url: "/images/mockups/premium_hoodie.png",
        is_ignored: false,
    },
    {
        id: 102,
        external_id: "commission-tee",
        name: "The Commission Deluxe Graphic Tee",
        variants: 4,
        synced: 4,
        thumbnail_url: "/images/mockups/premium_tee.png",
        is_ignored: false,
    },
    {
        id: 103,
        external_id: "lost-city-tee",
        name: "Lost City Official Streetwear Drop",
        variants: 4,
        synced: 4,
        thumbnail_url: "/BLKLOAF.png",
        is_ignored: false,
    },
    {
        id: 104,
        external_id: "loaf-films-crew",
        name: "Loaf Films Production Crewneck",
        variants: 3,
        synced: 3,
        thumbnail_url: "/LOAFFILMS.png",
        is_ignored: false,
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
    products: PrintfulProduct[];
    onSwitchToRoom: () => void;
}

export function MobileStudioLanding({
    tracks,
    products,
    onSwitchToRoom,
}: MobileStudioLandingProps) {
    const { cartCount, setIsCartOpen } = useCart();

    // Active album in the unified 3D Tape Break-Apart + Connected Tracklist Monument
    const [selectedAlbumIdx, setSelectedAlbumIdx] = useState(0);
    const activeAlbum = SHOWCASE_ALBUMS[selectedAlbumIdx];

    // Active product in the 3D Streetwear Break-Apart stage
    const [selectedMerchIdx, setSelectedMerchIdx] = useState(0);
    const merchItems = products.length > 0 ? products.slice(0, 8) : FALLBACK_MERCH;
    const activeMerch = merchItems[selectedMerchIdx] || merchItems[0];

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
    const mL1Y = useTransform(masterExplode, [0, 1], [0, -110]);
    const mL1Z = useTransform(masterExplode, [0, 1], [4, 110]);

    // Liner / crew art
    const mL2X = useTransform(masterExplode, [0, 1], [0, 16]);
    const mL2Y = useTransform(masterExplode, [0, 1], [0, -52]);
    const mL2Z = useTransform(masterExplode, [0, 1], [2, 55]);
    const mL2Opacity = useTransform(masterExplode, [0, 0.12, 1], [0, 1, 1]);

    // Blackbook insert
    const mL3X = useTransform(masterExplode, [0, 1], [0, -16]);
    const mL3Y = useTransform(masterExplode, [0, 1], [0, 8]);
    const mL3Z = useTransform(masterExplode, [0, 1], [0, 0]);
    const mL3Opacity = useTransform(masterExplode, [0, 0.12, 1], [0, 1, 1]);

    // Session photography
    const mL4X = useTransform(masterExplode, [0, 1], [0, 18]);
    const mL4Y = useTransform(masterExplode, [0, 1], [0, 68]);
    const mL4Z = useTransform(masterExplode, [0, 1], [-2, -55]);
    const mL4Opacity = useTransform(masterExplode, [0, 0.12, 1], [0, 1, 1]);

    // Loaf crate base
    const mL5X = useTransform(masterExplode, [0, 1], [0, -10]);
    const mL5Y = useTransform(masterExplode, [0, 1], [0, 126]);
    const mL5Z = useTransform(masterExplode, [0, 1], [-4, -110]);
    const mL5Opacity = useTransform(masterExplode, [0, 0.12, 1], [0, 1, 1]);

    // Thread that draws down from the album into the tracklist
    const mThread = useTransform(masterExplode, [0.55, 1], [0, 1]);

    /* ═══════════════════════════════════════════════════════════════════════
       CHAPTER 02 — GARMENT OPENS UP AS THE USER SCROLLS
       ═══════════════════════════════════════════════════════════════════════ */
    const merchStageRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: merchScroll } = useScroll({
        target: merchStageRef,
        offset: ["start 80%", "center 50%"],
    });

    const merchManualMode = useMotionValue(0);
    const merchManualVal = useMotionValue(0);
    const merchTapScroll = useRef(0);

    const merchTarget = useTransform(
        [merchScroll, merchManualMode, merchManualVal],
        ([s, mode, m]) =>
            (mode as number) > 0.5 ? (m as number) : Math.max(0, Math.min(1, s as number))
    );

    const merchExplode = useSpring(merchTarget, {
        stiffness: 120,
        damping: 24,
        mass: 0.5,
    });

    useMotionValueEvent(merchScroll, "change", (s) => {
        if (prefersReducedMotion) return;
        if (merchManualMode.get() > 0.5 && Math.abs(s - merchTapScroll.current) > 0.2) {
            merchManualMode.set(0);
        }
    });

    // Reduced motion: skip the scroll choreography and show everything opened up.
    useEffect(() => {
        if (!prefersReducedMotion) return;
        masterManualMode.set(1);
        masterManualVal.set(1);
        merchManualMode.set(1);
        merchManualVal.set(1);
    }, [prefersReducedMotion, masterManualMode, masterManualVal, merchManualMode, merchManualVal]);

    // Welcome to the realm — Lost City greets the visitor when the mobile site boots.
    // (Once per page load; it stands down as soon as they pick any other media.)
    useEffect(() => {
        requestWelcomeTrack("Lost City");
    }, []);

    const gRigRotateX = useTransform(merchExplode, [0, 1], [0, 22]);
    const gRigRotateY = useTransform(merchExplode, [0, 1], [0, 15]);
    const gRigRotateZ = useTransform(merchExplode, [0, 1], [0, -3]);
    const gRigScale = useTransform(merchExplode, [0, 1], [1.08, 0.92]);

    const gL1X = useTransform(merchExplode, [0, 1], [0, 14]);
    const gL1Y = useTransform(merchExplode, [0, 1], [0, -108]);
    const gL1Z = useTransform(merchExplode, [0, 1], [3, 105]);
    const gL1Opacity = useTransform(merchExplode, [0, 0.15, 1], [0, 1, 1]);

    const gL2X = useTransform(merchExplode, [0, 1], [0, -12]);
    const gL2Y = useTransform(merchExplode, [0, 1], [0, -48]);
    const gL2Z = useTransform(merchExplode, [0, 1], [1, 50]);

    const gL3X = useTransform(merchExplode, [0, 1], [0, 16]);
    const gL3Y = useTransform(merchExplode, [0, 1], [0, 12]);
    const gL3Z = useTransform(merchExplode, [0, 1], [0, 0]);
    const gL3Opacity = useTransform(merchExplode, [0, 0.15, 1], [0, 1, 1]);

    const gL4X = useTransform(merchExplode, [0, 1], [0, -14]);
    const gL4Y = useTransform(merchExplode, [0, 1], [0, 70]);
    const gL4Z = useTransform(merchExplode, [0, 1], [-2, -50]);
    const gL4Opacity = useTransform(merchExplode, [0, 0.15, 1], [0, 1, 1]);

    const gL5X = useTransform(merchExplode, [0, 1], [0, 10]);
    const gL5Y = useTransform(merchExplode, [0, 1], [0, 124]);
    const gL5Z = useTransform(merchExplode, [0, 1], [-4, -105]);
    const gL5Opacity = useTransform(merchExplode, [0, 0.15, 1], [0, 1, 1]);

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

    const toggleMerchExplode = useCallback(() => {
        playCrateFlipSfx();
        merchTapScroll.current = merchScroll.get();
        merchManualVal.set(merchExplode.get() > 0.5 ? 0 : 1);
        merchManualMode.set(1);
    }, [merchScroll, merchExplode, merchManualMode, merchManualVal]);

    return (
        <div className="relative min-h-screen bg-[#060608] text-[#F5F5F7] pb-28 overflow-x-hidden selection:bg-amber-400 selection:text-black">
            {/* ═══════════════════════════════════════════════════════════
                STAMPED GLOBAL ATMOSPHERE — BRICK DUNGEON & GRAFFITI TEXTURE
                (Eliminates generic flat black background!)
               ═══════════════════════════════════════════════════════════ */}
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                {/* Brick Dungeon Mural Watermark */}
                <Image
                    src="/ChatGPT Image Jul 12, 2026, 11_17_09 PM.png"
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
            <header className="sticky top-0 z-40 bg-[#07070A]/90 backdrop-blur-xl border-b-2 border-amber-400/25 safe-top">
                <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        {/* The Loaf Records deck — same mark as the desktop */}
                        <LoafDeck size={44} label="Loaf Records" priority />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-display text-xl tracking-[0.06em] leading-none text-white">
                                    SHADOW THE GREAT
                                </span>
                                <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-black">
                                    OFFICIAL
                                </span>
                            </div>
                            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-amber-400/90 mt-0.5">
                                Loaf Records · Brooklyn NY
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                playCrateFlipSfx();
                                onSwitchToRoom();
                            }}
                            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white hover:border-amber-400 transition-colors"
                        >
                            <Monitor className="w-3.5 h-3.5 text-amber-400" />
                            <span>Room View</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            aria-label="Open shopping bag"
                            className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-amber-400/35 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent-cyan text-black font-mono text-[9px] font-black flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stamped Navigation Tabs */}
                <nav
                    aria-label="Loaf Records mobile sections"
                    className="max-w-2xl mx-auto px-4 pb-2 flex items-center gap-1.5 overflow-x-auto hide-scrollbar"
                >
                    {[
                        { href: "#master-anatomy", label: "Music" },
                        { href: "#merch-anatomy", label: "Merch" },
                        { href: "#cinema-stage", label: "Lost City" },
                        { href: "/bio", label: "Bio ↗" },
                        { href: "/shop", label: "Store ↗" },
                        { href: "/gallery", label: "Blackbook ↗" },
                    ].map((pill) => {
                        const pillClass =
                            "shrink-0 rounded-lg border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-noir-cloud hover:text-amber-400 hover:border-amber-400/50 transition-colors";
                        // Other pages go through the router so the mini player keeps playing;
                        // a plain link would reload the site and cut the music off
                        return pill.href.startsWith("/") ? (
                            <Link key={pill.label} href={pill.href} onClick={() => playCrateFlipSfx()} className={pillClass}>
                                {pill.label}
                            </Link>
                        ) : (
                            <a key={pill.label} href={pill.href} onClick={() => playCrateFlipSfx()} className={pillClass}>
                                {pill.label}
                            </a>
                        );
                    })}
                </nav>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                HERO MONUMENT — STAMPED LOAF IDENTITY + LOAF MAN MASCOT
               ═══════════════════════════════════════════════════════════ */}
            <section className="relative z-10 px-3 sm:px-4 pt-4 pb-6 max-w-2xl mx-auto">
                <div className="relative rounded-[26px] border-2 border-amber-400/35 bg-[#0B0B0F] shadow-[0_28px_80px_rgba(0,0,0,0.95)] overflow-hidden">
                    {/* Full-bleed Dungeon Crew Mural Banner */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                        <Image
                            src="/ChatGPT Image Jul 12, 2026, 11_17_09 PM.png"
                            alt="Loaf Records Crew in The Dungeon — Shadow The Great, King illa, Ruggz, Rah Tha Ruler, Oso Dope"
                            fill
                            priority
                            sizes="(max-width: 768px) 96vw, 680px"
                            className="object-cover object-center scale-[1.02]"
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/45 to-black/30"
                        />

                        {/* On-air lightbox, like the one over the studio door */}
                        <div className="absolute top-3 left-3">
                            <OnAirSign>Live From The Dungeon</OnAirSign>
                        </div>

                        {/* Floating Loaf Man Mascot Stamp on Right */}
                        <div className="absolute -bottom-2 right-2 w-28 h-28 sm:w-32 sm:h-32 pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]">
                            <Image
                                src="/loafman.png"
                                alt="Loaf Man Mascot"
                                fill
                                sizes="128px"
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Hero Typography Overlay */}
                        <div className="absolute bottom-3 left-4 right-28">
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400">
                                LOAF RECORDS · BROOKLYN NY
                            </p>
                            <h1
                                className="font-display uppercase leading-[0.86] tracking-[0.02em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                                style={{ fontSize: "clamp(2.5rem, 11vw, 4rem)" }}
                            >
                                SHADOW{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-accent-cyan">
                                    THE GREAT
                                </span>
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
                            <button
                                type="button"
                                onClick={handlePlayActiveAlbum}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-4 font-mono text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-[0.98] transition-transform"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Spin The Commission</span>
                            </button>

                            <a
                                href="#merch-anatomy"
                                onClick={() => playCrateFlipSfx()}
                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-accent-cyan/50 bg-accent-cyan/10 py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent-cyan hover:bg-accent-cyan hover:text-black active:scale-[0.98] transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Shop The Drop</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                CHAPTER 01 — THE ALBUM
                Scrolling opens the album up into its liner pieces, the people
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

                    {/* ── Album stage: opens up as you scroll ── */}
                    <div className="relative z-20 px-1 sm:px-4 pt-5 pb-1">
                        <div
                            ref={masterStageRef}
                            className="relative h-[440px] sm:h-[480px] w-full flex items-center justify-center select-none"
                            style={{ perspective: "1350px" }}
                        >
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

                                {/* Session photography + waveform */}
                                <motion.div
                                    aria-hidden
                                    style={{ x: mL4X, y: mL4Y, z: mL4Z, opacity: mL4Opacity }}
                                    className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 bg-[#08110F] overflow-hidden shadow-[0_22px_45px_rgba(0,0,0,0.92)] will-change-transform"
                                >
                                    <Image
                                        src={activeAlbum.sessionArt}
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-85"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-[3px] h-5">
                                        {[65, 92, 74, 98, 60, 88, 95, 70, 84, 96, 72, 90, 68, 86, 78, 94].map(
                                            (h, i) => (
                                                <span
                                                    key={i}
                                                    className="flex-1 rounded-t-sm bg-emerald-400/90"
                                                    style={{ height: `${h}%` }}
                                                />
                                            )
                                        )}
                                    </div>
                                </motion.div>

                                {/* Blackbook insert */}
                                <motion.div
                                    aria-hidden
                                    style={{ x: mL3X, y: mL3Y, z: mL3Z, opacity: mL3Opacity }}
                                    className="absolute inset-0 rounded-2xl border-2 border-amber-300/55 bg-[#120F07] overflow-hidden shadow-[0_22px_45px_rgba(0,0,0,0.92)] will-change-transform"
                                >
                                    <Image
                                        src={activeAlbum.insertArt}
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                </motion.div>

                                {/* Liner / crew art */}
                                <motion.div
                                    aria-hidden
                                    style={{ x: mL2X, y: mL2Y, z: mL2Z, opacity: mL2Opacity }}
                                    className="absolute inset-0 rounded-2xl border-2 border-accent-cyan/55 bg-[#091318] overflow-hidden shadow-[0_22px_45px_rgba(0,0,0,0.92)] will-change-transform"
                                >
                                    <Image
                                        src={activeAlbum.linerArt}
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-95"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
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
                                    className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white/40 bg-[#14161F] shadow-[0_26px_55px_rgba(0,0,0,0.95)] cursor-pointer will-change-transform"
                                >
                                    <Image
                                        src={activeAlbum.cover}
                                        alt={`${activeAlbum.name} album cover`}
                                        fill
                                        sizes="(max-width: 640px) 208px, 288px"
                                        className="object-cover"
                                    />
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/15"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                    {/* ── The crew wall: who's on it, tagged up under the album, never over it ── */}
                    <div className="relative z-20 px-4 sm:px-5 pt-3">
                        <p
                            className="text-center font-mono text-[9px] font-bold uppercase tracking-[0.26em]"
                            style={{ color: activeAlbum.accentHex }}
                        >
                            The crew
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
                CHAPTER 02 — STAMPED 3D STREETWEAR MERCH DROP + LOOKBOOK
                (Zero Blank Space Underneath · Graffiti & Mascot Art Inside Panels)
               ═══════════════════════════════════════════════════════════ */}
            <section
                id="merch-anatomy"
                aria-label="Loaf Records merch"
                className="relative z-10 px-3 sm:px-4 py-4 max-w-2xl mx-auto"
            >
                <div className="relative rounded-[28px] border-2 border-accent-cyan/30 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden">
                    {/* Ambient Streetwear Glow */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-full h-[460px]"
                        style={{
                            background:
                                "radial-gradient(circle at 50% 42%, rgba(0, 217, 255, 0.24) 0%, rgba(245, 158, 11, 0.14) 48%, transparent 70%)",
                        }}
                    />

                    {/* Top Merch Header */}
                    <div className="relative z-20 p-4 sm:p-5 border-b border-white/10 bg-black/60">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-accent-cyan">
                            Loaf Records · Brooklyn NY
                        </p>
                        <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-[0.03em] text-white leading-none mt-1">
                            The Drop
                        </h2>

                        {/* Product Selector Strip */}
                        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                            {merchItems.map((item, idx) => {
                                const active = idx === selectedMerchIdx;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            playCrateFlipSfx();
                                            setSelectedMerchIdx(idx);
                                        }}
                                        className={cn(
                                            "shrink-0 rounded-xl px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] border transition-colors max-w-[190px] truncate",
                                            active
                                                ? "bg-accent-cyan text-black border-accent-cyan"
                                                : "bg-black/60 text-noir-cloud border-white/10 hover:text-white"
                                        )}
                                    >
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Garment break-apart — street art inside every layer, no labels ── */}
                    <div className="relative z-20 px-4 pt-6 pb-4">
                        <div
                            ref={merchStageRef}
                            className="relative h-[410px] sm:h-[440px] w-full flex items-center justify-center select-none"
                            style={{ perspective: "1350px" }}
                        >
                            <motion.div
                                className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center will-change-transform"
                                style={{
                                    transformStyle: "preserve-3d",
                                    rotateX: gRigRotateX,
                                    rotateY: gRigRotateY,
                                    rotateZ: gRigRotateZ,
                                    scale: gRigScale,
                                }}
                            >
                                {/* Base: rooftop throwies + Loaf Man tag */}
                                <motion.div
                                    style={{ x: gL5X, y: gL5Y, z: gL5Z, opacity: gL5Opacity }}
                                    className="absolute inset-0 rounded-2xl border-2 border-amber-400/60 bg-[#0D0B08] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.95)] will-change-transform"
                                >
                                    <Image
                                        src="/gallery/rooftop-throwies.jpg"
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                    <div className="absolute bottom-2 right-2 w-12 h-12 drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]">
                                        <Image
                                            src="/loafman.png"
                                            alt=""
                                            fill
                                            sizes="48px"
                                            className="object-contain"
                                        />
                                    </div>
                                </motion.div>

                                {/* Blackbook lining */}
                                <motion.div
                                    style={{ x: gL4X, y: gL4Y, z: gL4Z, opacity: gL4Opacity }}
                                    className="absolute inset-0 rounded-2xl border-2 border-white/30 bg-[#10131A] overflow-hidden shadow-[0_22px_44px_rgba(0,0,0,0.92)] will-change-transform"
                                >
                                    <Image
                                        src="/gallery/blackbook-spread.jpg"
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                </motion.div>

                                {/* Noxer canvas plate */}
                                <motion.div
                                    style={{ x: gL3X, y: gL3Y, z: gL3Z, opacity: gL3Opacity }}
                                    className="absolute inset-0 rounded-2xl border-2 border-emerald-400/55 bg-[#0A1112] overflow-hidden shadow-[0_22px_44px_rgba(0,0,0,0.92)] will-change-transform"
                                >
                                    <Image
                                        src="/gallery/noxer-canvas.jpg"
                                        alt=""
                                        fill
                                        sizes="280px"
                                        className="object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                </motion.div>

                                {/* Core garment */}
                                <motion.div
                                    style={{ x: gL2X, y: gL2Y, z: gL2Z }}
                                    onClick={toggleMerchExplode}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${activeMerch.name} — tap to open up`}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleMerchExplode();
                                        }
                                    }}
                                    className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-b from-[#1B1D26] to-[#0C0D12] border-2 border-white/35 shadow-[0_26px_55px_rgba(0,0,0,0.95)] cursor-pointer will-change-transform"
                                >
                                    <Image
                                        src={activeMerch.thumbnail_url}
                                        alt={activeMerch.name}
                                        fill
                                        sizes="280px"
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3">
                                        <p className="font-display text-base uppercase tracking-wider text-white leading-none truncate">
                                            {activeMerch.name}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Foreground frame + crown seal */}
                                <motion.div
                                    aria-hidden
                                    style={{ x: gL1X, y: gL1Y, z: gL1Z, opacity: gL1Opacity }}
                                    className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-accent-cyan/80 bg-gradient-to-tr from-accent-cyan/15 via-transparent to-amber-400/15 will-change-transform"
                                >
                                    <LoafDeck size={40} className="absolute top-2.5 right-2.5" />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Buy bar */}
                        <div className="mt-2 rounded-2xl border border-white/15 bg-black/80 p-3 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-amber-400">
                                    {activeMerch.variants} Sizes / Colors
                                </p>
                                <p className="text-xs font-bold text-white truncate">
                                    {activeMerch.name}
                                </p>
                            </div>

                            <Link
                                href={
                                    products.length > 0
                                        ? `/shop/product/${activeMerch.id}`
                                        : "/shop"
                                }
                                onClick={() => playNeedleDropSfx()}
                                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-accent-cyan px-4 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-glow-sm"
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Cop It</span>
                            </Link>
                        </div>
                    </div>

                    {/* ── CONNECTED MERCH CAPSULE LOOKBOOK GRID ── */}
                    <div className="relative z-20 border-t-2 border-accent-cyan/25 bg-[#08090D] p-4 sm:p-5">
                        <div className="flex items-end justify-between mb-3.5">
                            <div>
                                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.26em] text-amber-400 block">
                                    LOAF RECORDS
                                </span>
                                <h3 className="font-display text-2xl uppercase tracking-wider text-white leading-none mt-0.5">
                                    Streetwear
                                </h3>
                            </div>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-1 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-accent-cyan"
                            >
                                <span>Full Store</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {merchItems.slice(0, 4).map((item, idx) => (
                                <Link
                                    key={item.id}
                                    href={products.length > 0 ? `/shop/product/${item.id}` : "/shop"}
                                    onClick={() => playCrateFlipSfx()}
                                    className="group relative rounded-2xl border border-white/15 bg-[#101219] overflow-hidden flex flex-col justify-between p-2.5 hover:border-amber-400/60 transition-colors"
                                >
                                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black mb-2.5 border border-white/10">
                                        <Image
                                            src={item.thumbnail_url}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 768px) 44vw, 240px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-2 left-2 rounded bg-black/85 border border-amber-400/40 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest text-amber-400">
                                            DROP // 0{idx + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white line-clamp-1">
                                            {item.name}
                                        </h4>
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <span className="font-mono text-[8px] uppercase tracking-wider text-noir-cloud">
                                                {item.variants} Sizes / Colors
                                            </span>
                                            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent-cyan flex items-center gap-0.5">
                                                COP <ArrowUpRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
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
