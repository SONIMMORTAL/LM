"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/** YouTube's thumbnails, sharpest first: 1280px, 640px, then the 480px one every upload has */
const SIZES = ["maxresdefault", "sddefault", "hqdefault"] as const;

/**
 * A YouTube thumbnail at its sharpest. Not every upload has the bigger frames (YouTube
 * answers those with a 404), so it steps down a size whenever one fails to load.
 */
export function YouTubeThumb({ youtubeId, alt, ...props }: Omit<ImageProps, "src" | "onError"> & { youtubeId: string }) {
    const [failed, setFailed] = useState<{ id: string; count: number }>({ id: youtubeId, count: 0 });
    const step = failed.id === youtubeId ? failed.count : 0;

    return (
        <Image
            {...props}
            alt={alt}
            src={`https://img.youtube.com/vi/${youtubeId}/${SIZES[Math.min(step, SIZES.length - 1)]}.jpg`}
            onError={() => step < SIZES.length - 1 && setFailed({ id: youtubeId, count: step + 1 })}
        />
    );
}
