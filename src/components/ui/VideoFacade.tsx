"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoFacadeProps {
    youtubeId: string;
    title: string;
    className?: string;
    aspectRatio?: string;
    startTime?: number;
    forcePlay?: boolean;
}

export function VideoFacade({
    youtubeId,
    title,
    className,
    aspectRatio = "aspect-video",
    startTime,
    forcePlay,
}: VideoFacadeProps) {
    const [userPlaying, setUserPlaying] = useState(false);
    
    useEffect(() => {
        if (forcePlay || startTime !== undefined) {
            setUserPlaying(true);
        }
    }, [forcePlay, startTime]);

    const isPlaying = userPlaying;

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-noir-slate border border-white/5 shadow-2xl group cursor-pointer",
                aspectRatio,
                className
            )}
        >
            {!isPlaying ? (
                <div onClick={() => setUserPlaying(true)} className="relative w-full h-full">
                    <Image
                        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent-cyan group-hover:border-accent-cyan transition-all duration-300">
                            <Play className="w-6 h-6 text-white group-hover:text-black ml-0.5" fill="currentColor" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-2xl">
                        <h4 className="text-white font-bold text-sm tracking-wide line-clamp-1">{title}</h4>
                    </div>
                </div>
            ) : (
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0${startTime !== undefined ? `&start=${startTime}` : ''}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title}
                />
            )}
        </div>
    );
}
