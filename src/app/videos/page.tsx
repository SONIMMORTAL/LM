import { VideosPageClient } from "@/components/videos/VideosPageClient";
import { getVideoTapeTracklists } from "@/lib/tracks-server";
import { VIDEO_TAPES } from "@/lib/video-tapes";

// Tracklists come from the cached catalogue, revalidated on admin edits.
export const revalidate = 300;

export default async function VideosPage() {
    const tracklists = await getVideoTapeTracklists();

    return (
        <VideosPageClient
            tapes={VIDEO_TAPES.map((tape) => ({
                ...tape,
                tracks: tracklists[tape.name] ?? [],
            }))}
        />
    );
}
