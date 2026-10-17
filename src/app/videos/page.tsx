import { VideosPageClient } from "@/components/videos/VideosPageClient";
import { getVideoTapeTracklists } from "@/lib/tracks-server";
import { VIDEO_TAPES } from "@/lib/video-tapes";
import { getChannelUploads } from "@/lib/youtube-feed";

// Tracklists come from the cached catalogue, revalidated on admin edits; new
// channel uploads arrive through the YouTube feed's own cache.
export const revalidate = 300;

export default async function VideosPage() {
    const [tracklists, uploads] = await Promise.all([getVideoTapeTracklists(), getChannelUploads()]);

    return (
        <VideosPageClient
            tapes={VIDEO_TAPES.map((tape) => ({
                ...tape,
                tracks: tracklists[tape.name] ?? [],
            }))}
            uploads={uploads}
        />
    );
}
