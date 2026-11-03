import { buildLlmsTxt } from "@/lib/llms";
import { getTracks, getVideoTapeTracklists } from "@/lib/tracks-server";
import { VIDEO_TAPES } from "@/lib/video-tapes";
import { getChannelUploads } from "@/lib/youtube-feed";

// Rebuilt from the catalogue and the channel feed, so new songs and uploads show up on their own
export const revalidate = 600;

export async function GET() {
    const [tracks, uploads, tapeTracklists] = await Promise.all([
        getTracks().catch(() => []),
        getChannelUploads(),
        getVideoTapeTracklists().catch(() => ({}) as Record<string, string[]>),
    ]);

    return new Response(buildLlmsTxt({ tracks, uploads, tapes: VIDEO_TAPES, tapeTracklists }), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
