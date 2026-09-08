"use client";

import { Play, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useCallback, useRef, memo, useEffect } from "react";

/*
 * Theater screen — the blank TV in the artwork. The rect is measured
 * as % of the 1536x1024 scene; the screen area is black in the art,
 * so the 16:9 player centered inside it blends seamlessly.
 */
const SCREEN_RECT = { left: 28.5, top: 21.3, width: 43.1, height: 30.7 };

// Video type definition
interface Video {
    id: string;
    title: string;
    description: string;
    youtube_id: string; // From DB
    youtubeId?: string; // From static (legacy support)
}

// Static Classics
const staticVideos: Video[] = [
    {
        id: "classic-1",
        title: "Shadow The Great - Lost City | prod by Ruggz feat. Grandpadre",
        description: "Directed by Sage Wolf. Screenplay by Bryan Oso Reynoso.",
        youtube_id: "OOx9QAeRo8E",
        youtubeId: "OOx9QAeRo8E",
    },
    {
        id: "classic-2",
        title: "Abel - Rah Tha Ruler & Shadow The Great | Prod by Gradis Nice",
        description: "Directed & edited by Loaf Films.",
        youtube_id: "41Zx0etfnkM",
        youtubeId: "41Zx0etfnkM",
    },
    {
        id: "classic-3",
        title: "Shadow The Great - Soul | Prod by Seyes Finest",
        description: "Official music video. Directed by Loaf Films.",
        youtube_id: "jHGAyWqaZ88",
        youtubeId: "jHGAyWqaZ88",
    },
    {
        id: "classic-4",
        title: "Shadow The Great - Jeeps | prod by Ruggz",
        description: "Directed & Colored by Loaf Films. VFX by AR immortal.",
        youtube_id: "ONVI4qys5A4",
        youtubeId: "ONVI4qys5A4",
    },
    {
        id: "classic-5",
        title: "Ruggz + Shadow The Great Freestyle",
        description: "Raw freestyle session. Brooklyn streets.",
        youtube_id: "vkoR3SklWo8",
        youtubeId: "vkoR3SklWo8",
    },
    {
        id: "classic-8",
        title: "LOAF MUZIK - ROLLIN (Prod By KidzinBrooklyn)",
        description: "Directed & Edited by Loaf Films.",
        youtube_id: "328OKzVaoTQ",
        youtubeId: "328OKzVaoTQ",
    },
    {
        id: "classic-9",
        title: "LOAF MUZIK - Thank You",
        description: "Official Video. Loaf Records.",
        youtube_id: "w1Qkdp37rmw",
        youtubeId: "w1Qkdp37rmw",
    },
    {
        id: "classic-10",
        title: "Shadow The Great - Desperado | Prod by Ruggz",
        description: "Official Video. Loaf Records.",
        youtube_id: "YQLPMoA-fRM",
        youtubeId: "YQLPMoA-fRM",
    },
    {
        id: "classic-11",
        title: "Coyote beatz - BK feat. Shadow The Great",
        description: "Official Video.",
        youtube_id: "ZcmDVkF9Rk4",
        youtubeId: "ZcmDVkF9Rk4",
    },
    {
        id: "classic-12",
        title: "LOAF MUZIK - SHOGUN ARMY | Prod. By Gradis Nice",
        description: "Official Video. Loaf Records.",
        youtube_id: "eAdCJga8xis",
        youtubeId: "eAdCJga8xis",
    },
    {
        id: "classic-13",
        title: "Shadow The Great - Shinobi Warz",
        description: "Official Video. Loaf Records.",
        youtube_id: "bZB1NS4JnsY",
        youtubeId: "bZB1NS4JnsY",
    },
];

// Memoized video card
const VideoCard = memo(function VideoCard({
    video,
    onPlay,
}: {
    video: Video;
    onPlay: (youtubeId: string, title?: string) => void;
}) {
    const yId = video.youtube_id || video.youtubeId;
    if (!yId) return null;

    return (
        <article
            className="group cursor-pointer"
            onClick={() => onPlay(yId, video.title)}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-noir-slate border border-white/5 shadow-lg group-hover:border-accent-cyan/30 transition-all duration-300">
                <Image
                    src={`https://img.youtube.com/vi/${yId}/hqdefault.jpg`}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent-cyan group-hover:border-accent-cyan transition-all duration-300">
                        <Play className="w-6 h-6 text-white group-hover:text-black ml-0.5" fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Info */}
            <h3 className="font-bold text-white group-hover:text-accent-cyan transition-colors duration-200 line-clamp-1 text-lg tracking-tight">
                {video.title}
            </h3>
            <p className="text-noir-cloud text-sm line-clamp-1 opacity-70">
                {video.description}
            </p>
        </article>
    );
});

export default function VideosPage() {
    const [dbVideos, setDbVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // What's on the theater screen, and whether the user hit play yet
    const [screenVideo, setScreenVideo] = useState<{ id: string; title?: string } | null>(null);
    const [isWatching, setIsWatching] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const theaterRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    // Track video play
    const trackVideoPlay = useCallback((youtubeId: string, title?: string) => {
        fetch('/api/system/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ youtube_id: youtubeId, video_title: title || null }),
        }).catch(() => {});
    }, []);

    // Any play anywhere on the page loads the video onto the theater screen
    const handlePlay = useCallback((youtubeId: string, title?: string) => {
        setScreenVideo({ id: youtubeId, title });
        setIsWatching(true);
        trackVideoPlay(youtubeId, title);
    }, [trackVideoPlay]);

    // After the screen swaps, glide the viewer back up to the theater.
    // (Scrolling inside handlePlay gets cancelled by the re-render.)
    useEffect(() => {
        if (!screenVideo) return;
        const el = theaterRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(top - 12, 0), behavior: "smooth" });
    }, [screenVideo]);

    // Fetch videos from API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch('/api/admin/videos');
                if (res.ok) {
                    const data = await res.json();
                    if (data.videos) {
                        setDbVideos(data.videos);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch videos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Combine static and DB videos, prioritizing DB (newest first usually)
    // Filter out duplicates if any (by youtube_id)
    const allVideos = [...dbVideos, ...staticVideos].filter((v, i, self) =>
        i === self.findIndex((t) => (t.youtube_id || t.youtubeId) === (v.youtube_id || v.youtubeId))
    );

    // Featured Video (Newest "Classic" - Shogun Army)
    // We assume the last added static video is the featured one for now
    const featuredVideo = staticVideos[staticVideos.length - 1];
    const mainVideos = allVideos.filter(v =>
        (v.youtube_id || v.youtubeId) !== (featuredVideo.youtube_id || featuredVideo.youtubeId)
    );

    // Live videos list
    const liveVideos: Video[] = [
        {
            id: "live-1",
            title: "50 Years of Hip Hop Live Mix feat. Shadow , OSO , Grandpadre , Ruggz @Soul Purpose",
            description: "Live performance celebrating 50 years of Hip Hop.",
            youtube_id: "mWrKmLRaxrc",
            youtubeId: "mWrKmLRaxrc",
        },
        {
            id: "live-2",
            title: "LOAF T.V FINALE",
            description: "The final episode.",
            youtube_id: "ZXjpK2VFtN8",
            youtubeId: "ZXjpK2VFtN8",
        },
        {
            id: "live-3",
            title: "LOAF T.v ep 6",
            description: "New episode of Loaf Tv. Knowledge Born.",
            youtube_id: "X3wiczoP6-8",
            youtubeId: "X3wiczoP6-8",
        },
        {
            id: "live-4",
            title: "Loaf TV ep 5",
            description: "Episode 5 of Loaf Tv.",
            youtube_id: "U1q6eMQyvpI",
            youtubeId: "U1q6eMQyvpI",
        },
        {
            id: "live-5",
            title: "Loaf tv ep4",
            description: "Episode 4 of Loaf Tv.",
            youtube_id: "DXCZP-RWPC4",
            youtubeId: "DXCZP-RWPC4",
        },
        {
            id: "live-6",
            title: "LOAF TV EP 3",
            description: "Episode 3 of Loaf Tv.",
            youtube_id: "DPoGE-SszVw",
            youtubeId: "DPoGE-SszVw",
        },
        {
            id: "live-7",
            title: "LOAF TV ep2",
            description: "Episode 2 of Loaf Tv.",
            youtube_id: "gPBLD0QRjoQ",
            youtubeId: "gPBLD0QRjoQ",
        },
        {
            id: "live-8",
            title: "Loaf Records Live Session",
            description: "Official Live Performance.",
            youtube_id: "oSNfXYz6a14",
            youtubeId: "oSNfXYz6a14",
        }
    ];

    // What's on screen right now (falls back to the featured video)
    const onScreen = screenVideo ?? {
        id: featuredVideo.youtube_id || featuredVideo.youtubeId!,
        title: featuredVideo.title,
    };
    const showInlineFrame = isWatching && !isMobile;

    return (
        <div className="min-h-screen bg-noir-void text-foreground selection:bg-accent-cyan/30">
            {/* THEATER — whatever you pick plays on the big screen */}
            <section
                ref={theaterRef}
                aria-label="Loaf Records screening room"
                className="relative pt-16 md:pt-20 scroll-mt-16 flex justify-center overflow-hidden"
            >
                <div className="relative w-full max-w-[150vh]">
                    <div className="relative aspect-[3/2] w-full select-none">
                        <Image
                            src="/scenes/theater-scene.jpg"
                            alt="The Loaf Records crew watching the big screen"
                            fill
                            priority
                            quality={85}
                            sizes="(max-width: 1536px) 100vw, 1536px"
                            className="object-contain"
                        />

                        {/* The screen inlay */}
                        <div
                            className="absolute bg-black overflow-hidden"
                            style={{
                                left: `${SCREEN_RECT.left}%`,
                                top: `${SCREEN_RECT.top}%`,
                                width: `${SCREEN_RECT.width}%`,
                                height: `${SCREEN_RECT.height}%`,
                            }}
                        >
                            {showInlineFrame ? (
                                <iframe
                                    key={onScreen.id}
                                    src={`https://www.youtube.com/embed/${onScreen.id}?autoplay=1&modestbranding=1&rel=0`}
                                    className="absolute inset-0 h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={onScreen.title || "Video Player"}
                                />
                            ) : (
                                <button
                                    onClick={() => handlePlay(onScreen.id, onScreen.title)}
                                    className="group absolute inset-0 block h-full w-full cursor-pointer"
                                    aria-label={`Play ${onScreen.title || "video"}`}
                                >
                                    <Image
                                        src={`https://img.youtube.com/vi/${onScreen.id}/maxresdefault.jpg`}
                                        alt=""
                                        fill
                                        sizes="45vw"
                                        className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black/50 border border-white/25 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-cyan group-hover:border-accent-cyan">
                                            <Play className="h-5 w-5 sm:h-7 sm:w-7 text-white group-hover:text-black translate-x-0.5" fill="currentColor" />
                                        </span>
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Fade into the page */}
                        <div
                            aria-hidden
                            className="absolute inset-x-0 bottom-0 h-[14%] pointer-events-none"
                            style={{
                                background:
                                    "linear-gradient(to top, var(--color-noir-void) 0%, transparent 100%)",
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Mobile player — the theater screen is too small to watch on a phone */}
            {isWatching && isMobile && (
                <section className="px-4 -mt-2 pb-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/10 shadow-2xl">
                        <iframe
                            key={onScreen.id}
                            src={`https://www.youtube.com/embed/${onScreen.id}?autoplay=1&modestbranding=1&rel=0`}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={onScreen.title || "Video Player"}
                        />
                    </div>
                </section>
            )}

            {/* Now showing caption */}
            <div className="flex justify-center px-6 pb-6">
                <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-noir-ash text-center">
                    Now showing · <span className="text-noir-cloud">{(onScreen.title || "").split("|")[0].trim()}</span>
                </p>
            </div>

            {/* MAIN CATALOG */}
            <section className="relative py-24 px-6 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-6">
                        <div>
                            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter opacity-10 uppercase select-none">
                                Catalog
                            </h2>
                            <h3 className="text-2xl font-bold text-accent-cyan -mt-8 uppercase tracking-widest pl-2">
                                Official Music Videos
                            </h3>
                        </div>
                        <a
                            href="https://www.youtube.com/@LoafRecords/videos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-noir-cloud hover:text-white transition-colors"
                        >
                            View All on YouTube <span className="text-accent-cyan">→</span>
                        </a>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mainVideos.map((video) => (
                                <VideoCard
                                    key={video.id || video.youtube_id || video.youtubeId}
                                    video={video}
                                    onPlay={handlePlay}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* LIVE SECTION */}
            <section className="relative py-24 px-6 bg-noir-wood/20 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <span className="block text-accent-pink text-xs font-bold tracking-[0.2em] mb-2 uppercase text-white/70">
                                Uncut & Raw
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                                Live With <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">LOAF!</span>
                            </h2>
                        </div>
                        <p className="text-noir-cloud max-w-sm text-sm">
                            Step into the studio and onto the stage. Exclusive performances, interviews, and the real grime of Brooklyn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {liveVideos.map((video) => (
                            <div
                                key={video.id}
                                className="group cursor-pointer relative"
                                onClick={() => handlePlay(video.youtube_id || video.youtubeId!, video.title)}
                            >
                                <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-noir-slate border border-white/5 mb-4 shadow-lg group-hover:shadow-accent-cyan/10 transition-shadow">
                                    <Image
                                        src={`https://img.youtube.com/vi/${video.youtube_id || video.youtubeId}/hqdefault.jpg`}
                                        alt={video.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 p-5 w-full">
                                        <div className="h-0.5 w-8 bg-white mb-3 group-hover:w-16 transition-all duration-300" />
                                        <h4 className="font-bold text-white text-lg leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-accent-cyan transition-colors">
                                            {video.title}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
