import fs from 'fs';
import path from 'path';

const pagePath = path.resolve('./src/app/music/page.tsx');
let content = fs.readFileSync(pagePath, 'utf-8');

// 1. Remove local player state variables and audioRef
content = content.replace(
    /const \[currentTime, setCurrentTime\] = useState\(0\);\n    const \[duration, setDuration\] = useState\(0\);\n    const \[volume, setVolume\] = useState\(80\);\n    const \[isMuted, setIsMuted\] = useState\(false\);\n/,
    ""
);
content = content.replace(/const audioRef = useRef<HTMLAudioElement \| null>\(null\);\n/, "");

// 2. Add global player event listener
const globalPlayerLogic = `
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
`;
content = content.replace(/useEffect\(\(\) => \{\n        fetchTracks\(\);\n    \}, \[\]\);\n/, `useEffect(() => { fetchTracks(); }, []);\n${globalPlayerLogic}`);

// 3. Remove local audio play effect
content = content.replace(
    /useEffect\(\(\) => \{\n        if \(tracks\.length > 0 && isPlaying\) \{[\s\S]*?\}\n    \}, \[currentTrackIndex, tracks, isPlaying\]\);\n/,
    ""
);

// 4. Update playTrack and remove unused functions
content = content.replace(
    /const playTrack = \(index: number\) => \{\n        setCurrentTrackIndex\(index\);\n        setIsPlaying\(true\);\n    \};/,
    `const playTrack = (index: number) => {
        const track = tracks[index];
        const hasTimestamp = track && youtubeTimestamps[track.title] !== undefined;

        if (hasTimestamp) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('pauseGlobalPlayer'));
            }
        } else {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('playMusic', { detail: { trackIndex: index } }));
            }
        }

        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };`
);

content = content.replace(/const togglePlay = \(\) => \{[\s\S]*?\}\n    \};\n/, "");
content = content.replace(/const formatTime = \(seconds: number\) => \{[\s\S]*?\}\n    \};\n/g, "");
content = content.replace(/const handleProgressChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\}\n    \};\n/, "");
content = content.replace(/const handleVolumeChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\}\n    \};\n/, "");
content = content.replace(/const toggleMute = \(\) => \{[\s\S]*?\}\n    \};\n/, "");
content = content.replace(/const nextTrack = \(\) => \{[\s\S]*?\}\n    \};\n/, "");
content = content.replace(/const prevTrack = \(\) => \{[\s\S]*?\}\n    \};\n/, "");
content = content.replace(/const handleTimeUpdate = \(\) => \{[\s\S]*?\}\n    \};\n/, "");
content = content.replace(/const handleLoadedMetadata = \(\) => \{[\s\S]*?\}\n    \};\n/, "");

// 5. Remove <audio> tag
content = content.replace(/<audio[\s\S]*?ref={audioRef}[\s\S]*?\/>\n/, "");

// 6. Remove bottom Player Bar
const playerStart = content.indexOf('{/* Player Bar */}');
const purchaseModal = content.indexOf('{/* Purchase Modal */}');
if (playerStart !== -1 && purchaseModal !== -1) {
    content = content.substring(0, playerStart) + content.substring(purchaseModal);
}

// 7. Add Darkside and Lord Knows to albums array
const addAlbums = `
        {
            name: "Darkside",
            artist: "Shadow The Great",
            cover: "/darkside-cover.jpg",
            gradient: "from-violet-500/20 via-indigo-600/10 to-slate-900/20",
            accentColor: "violet",
            youtubeId: "6-9cYB0_E14",
            tracks: tracks.filter(t => t.album === "Darkside")
        },
        {
            name: "Lord Knows",
            artist: "Shadow The Great",
            cover: "/lord-knows-cover.jpg",
            gradient: "from-orange-500/20 via-amber-600/10 to-noir-void/20",
            accentColor: "orange",
            youtubeId: "QBaz7HbeJHk",
            tracks: tracks.filter(t => t.album === "Lord Knows")
        }
    ];
`;
content = content.replace(/\];\n\n    const toggleAlbum/g, addAlbums + '\n    const toggleAlbum');

// 8. Add youtubeTimestamps dictionary
const timestampsStr = `
    const getGlobalTrackIndex = (track: Track) => {
        return tracks.findIndex(t => t.id === track.id);
    };

    const youtubeTimestamps: Record<string, number> = {
        // Darkside
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
        // Lord Knows
        "Burly (prod. by Tuamie)": 0,
        "Break Bread Freestyle (prod. by Tuamie)": 48,
        "7 Oceans Freestyle (prod. by Tuamie)": 137,
        "Archie (prod. by King illa)": 193,
        "Corners (prod. by Coyote Beatz)": 373,
        "Hustle Freestyle (feat. Rah Tha Ruler)": 496,
        "Fountain Freestyle (feat. Rah Tha Ruler)": 605,
        "Book of Doe Freestyle (prod. by Doe)": 926,
        "Freestyle (prod. by Pepito)": 1080,
        // Munchies
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
`;
content = content.replace(/const getAlbumCover/g, timestampsStr + '\n    const getAlbumCover');

// 9. Update getAlbumCover
content = content.replace(
    /case "Live From The Dungeon": return "\/LFTD\.jpg";\n/,
    `case "Live From The Dungeon": return "/LFTD.jpg";
            case "Darkside": return "/darkside-cover.jpg";
            case "Lord Knows": return "/lord-knows-cover.jpg";
            case "Munchies": return "/munchies-cover.jpg";\n`
);

// 10. Update iframes for Darkside/Lord Knows to have JS API
content = content.replace(
    /src={`https:\/\/www.youtube.com\/embed\/\${album\.youtubeId}`}/,
    `src={\`https://www.youtube.com/embed/\${album.youtubeId}?enablejsapi=1&origin=\${typeof window !== 'undefined' ? window.location.origin : ''}\${currentTrack && currentTrack.album === album.name && youtubeTimestamps[currentTrack.title] !== undefined ? '&start=' + youtubeTimestamps[currentTrack.title] + '&autoplay=1' : ''}\`}`
);

// 11. Replace Featured Section with the Overhauled Munchies Section
const featuredStart = content.indexOf('{/* Featured / New Songs */}');
const albumsGridStart = content.indexOf('{/* Albums Grid */}');

if (featuredStart !== -1 && albumsGridStart !== -1) {
    const munchiesSection = `{/* Featured / New Songs */}
            <section className="relative px-6 pt-32 pb-16 z-20">
                <div className="max-w-7xl mx-auto">
                    {(() => {
                        const munchiesTracks = tracks.filter(t => t.album === "Munchies");
                        if (munchiesTracks.length === 0) return null;
                        
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="bg-gradient-to-br from-noir-charcoal/80 to-noir-slate/40 backdrop-blur-xl rounded-3xl border border-accent-cyan/30 overflow-hidden relative shadow-2xl shadow-accent-cyan/10"
                            >
                                <div className="absolute top-0 left-1/4 w-1/2 h-full bg-accent-cyan/10 blur-[100px] -z-10" />

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                    <div className="lg:col-span-5 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-8">
                                                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-xs font-black uppercase tracking-widest rounded-full border border-accent-cyan/30 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                                                    New Release
                                                </span>
                                            </div>
                                            
                                            <motion.div
                                                className="relative aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/10"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <Image
                                                    src="/munchies-cover.jpg"
                                                    alt="Munchies Vol. 2"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </motion.div>

                                            <div className="mt-8 text-center lg:text-left">
                                                <h2 className="text-3xl font-bold tracking-tight text-white mb-1">THE MUNCHIES VOL. 2</h2>
                                                <p className="text-noir-cloud">Shadow The Great</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 rounded-2xl overflow-hidden bg-noir-void">
                                            <iframe
                                                width="100%"
                                                height="166"
                                                scrolling="no"
                                                frameBorder="no"
                                                allow="autoplay"
                                                src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/loafmuzik/the-munchies-vol-2&color=%2300ffd0&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false"
                                            ></iframe>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-7 flex flex-col p-6 lg:p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-noir-cloud uppercase tracking-wider">Tracklist</h3>
                                        </div>
                                        
                                        <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[600px]">
                                            {munchiesTracks.map((track, idx) => {
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
                                                        className={\`group relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 \${isCurrentTrack
                                                            ? "bg-gradient-to-r from-accent-cyan/20 to-transparent border-l-2 border-accent-cyan"
                                                            : "hover:bg-white/5"
                                                            }\`}
                                                    >
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
                                                                <span className={\`text-sm font-mono \${isCurrentTrack ? "text-accent-cyan" : "text-noir-ash"}\`}>
                                                                    {(idx + 1).toString().padStart(2, '0')}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={\`font-medium truncate transition-colors \${isCurrentTrack ? "text-accent-cyan" : "text-white group-hover:text-accent-cyan"}\`}>
                                                                {track.title}
                                                            </p>
                                                            <p className="text-sm text-noir-ash truncate">{track.artist}</p>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-noir-ash font-mono hidden sm:block">{track.duration || "—"}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}
                </div>
            </section>

            `;
    
    content = content.substring(0, featuredStart) + munchiesSection + content.substring(albumsGridStart);
}

fs.writeFileSync(pagePath, content);
console.log("Restored successfully!");
