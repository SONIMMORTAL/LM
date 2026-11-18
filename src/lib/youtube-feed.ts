/**
 * The Loaf Records YouTube channel, read from its public uploads feed — no API key.
 * New uploads reach the site on their own: the feed is cached for a few minutes at a
 * time, so a video posted to the channel shows up on the Videos page and as the home
 * page's New Release shortly after it goes public.
 */
export const LOAF_CHANNEL_ID = "UCr0eeAXO5b1sxubGdERgnTw";

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${LOAF_CHANNEL_ID}`;
/** How long a fetched copy of the feed is reused, in seconds. */
export const FEED_REFRESH_SECONDS = 600;

export interface ChannelUpload {
    youtubeId: string;
    title: string;
    /** The first real line of the YouTube description */
    description: string;
    /** ISO timestamp of when it went public */
    published: string;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(text: string): string {
    return text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, code: string) => {
        if (code[0] === "#") {
            const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
            return Number.isNaN(point) ? match : String.fromCodePoint(point);
        }
        return ENTITIES[code.toLowerCase()] ?? match;
    });
}

const field = (entry: string, tag: string) =>
    decodeXml(entry.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? "").trim();

/**
 * The first line of a description that says something — not a bare link, hashtags, or the
 * start of a tracklist ("1.Desperado 0:00", "1 Intro (feat. …)", "00:00 Intro").
 */
function firstLine(description: string): string {
    return (
        description
            .split("\n")
            .map((line) => line.trim())
            .find(
                (line) =>
                    line &&
                    !/^(https?:\/\/|www\.)\S+$/i.test(line) &&
                    !/^(#\S+\s*)+$/.test(line) &&
                    !/^\d{1,2}(?:[.)]\s*|\s+)[A-Za-z]/.test(line) &&
                    !/\b\d{1,2}:\d{2}\b/.test(line)
            ) ?? ""
    );
}

/** "Get Money - Shadow The Great , Rah Tha Ruler" → "Get Money - Shadow The Great, Rah Tha Ruler" */
export function tidyTitle(title: string): string {
    return title
        .replace(/\s+/g, " ")
        .replace(/\s+,/g, ",")
        .replace(/,(?=\S)/g, ", ")
        .trim();
}

/**
 * The uploads in the feed, newest first. Shorts are left out: they're vertical
 * clips, not videos to put on the big screen or the New Release spot.
 */
export function parseChannelFeed(xml: string): ChannelUpload[] {
    const uploads: ChannelUpload[] = [];
    for (const [entry] of xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)) {
        const youtubeId = field(entry, "yt:videoId");
        if (!/^[\w-]{11}$/.test(youtubeId)) continue;
        if (/<link rel="alternate" href="[^"]*\/shorts\//.test(entry)) continue;
        uploads.push({
            youtubeId,
            title: tidyTitle(field(entry, "title")),
            description: firstLine(field(entry, "media:description")),
            published: field(entry, "published"),
        });
    }
    return uploads.sort((a, b) => b.published.localeCompare(a.published));
}

/** The channel's latest uploads, or none if YouTube can't be reached right now. */
export async function getChannelUploads(): Promise<ChannelUpload[]> {
    try {
        const res = await fetch(FEED_URL, { next: { revalidate: FEED_REFRESH_SECONDS } });
        if (!res.ok) return [];
        return parseChannelFeed(await res.text());
    } catch {
        return [];
    }
}

/** "Get Money - Shadow The Great | Prod by Ruggz" → headline and the credits after the bar. */
export function splitVideoTitle(title: string): { headline: string; credits?: string } {
    const [headline, ...rest] = title.split("|");
    const credits = rest.join("|").trim();
    return { headline: headline.trim(), credits: credits || undefined };
}
