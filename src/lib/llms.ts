/**
 * /llms.txt: the site told plainly for AI assistants and answer engines (the llmstxt.org
 * format). Who the crew is, every album with who's on each song, the tapes, the latest
 * videos and where everything lives, so a question about Shadow The Great, Oso Dope or
 * Loaf Muzik can be answered from the source and linked back here.
 */

import { absoluteUrl } from "./site.ts";
import { CREW, LOAF_FAQ, LOAF_MUZIK, LOAF_RECORDS, PRESS, crewMemberPath, listNames } from "./crew.ts";
import { ALBUM_RELEASES, albumGuests, albumTrackCredits, type CatalogueTrack } from "./discography.ts";
import { creditedTitle } from "./credits.ts";
import type { VideoTape } from "./video-tapes.ts";
import type { ChannelUpload } from "./youtube-feed.ts";

interface LlmsInput {
    tracks: CatalogueTrack[];
    tapes: VideoTape[];
    /** Each tape's track titles, keyed by tape name */
    tapeTracklists: Record<string, string[]>;
    uploads: ChannelUpload[];
}

const PAGES: Array<{ name: string; path: string; about: string }> = [
    { name: "Music", path: "/music", about: "every album, streaming free, with digital downloads to buy" },
    { name: "God Is Good", path: "/music/god-is-good", about: "Shadow The Great's new album: 20-second previews of all 19 tracks, name your price from $10" },
    { name: "God Is Good Audio Book", path: "/audiobook", about: "the 12-chapter audio book, $25, a Loaf Records publication" },
    { name: "Videos", path: "/videos", about: "music videos, live performances and full mixtapes, newest upload first" },
    { name: "Shop", path: "/shop", about: "official Loaf Wear & Loaf Records merch: apparel, vinyl and accessories, shipped worldwide" },
    { name: "Films", path: "/loaf-films", about: "Loaf Films — Brooklyn music video & commercial production, bookings and packages" },
    { name: "Bio", path: "/bio", about: "the Loaf Muzik story, its members and common questions" },
    { name: "Blackbook", path: "/gallery", about: "the crew's art: blackbook pages, trailer and box truck pieces" },
];

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });

export function buildLlmsTxt({ tracks, tapes, tapeTracklists, uploads }: LlmsInput): string {
    const lines: string[] = [];
    const add = (...more: string[]) => lines.push(...more);

    add(
        `# ${LOAF_RECORDS.name}: Home of ${LOAF_MUZIK.name}`,
        "",
        `> ${LOAF_RECORDS.name} is the Brooklyn independent hip-hop label founded by Shadow The Great and Oso Dope, and the home of ${LOAF_MUZIK.name} (also written Loaf Music or Loaf Musik), the collective of ${listNames(CREW.map((m) => m.name))}. ${absoluteUrl("/")} is the official site for all of them: their albums stream free here (Knowledge Born streams on Spotify, Apple Music and Deezer), and the downloads, merch and videos are here too.`,
        "",
        "## The crew",
        "",
        `- [${LOAF_MUZIK.name}](${absoluteUrl("/bio")}): ${LOAF_MUZIK.summary} Also written Loaf Music or Loaf Musik. ${LOAF_MUZIK.history.join(" ")}`,
        ...CREW.map((member) => `- [${member.name}](${absoluteUrl(crewMemberPath(member))}): ${[member.summary, ...member.story.slice(1)].join(" ")}`),
        `- [${LOAF_RECORDS.name}](${absoluteUrl("/")}): ${LOAF_RECORDS.summary}`,
        "",
        "## Albums",
        "",
    );

    for (const album of ALBUM_RELEASES) {
        const songs = albumTrackCredits(album, tracks);
        const facts = [
            album.artist,
            album.released?.slice(0, 4),
            album.producer && `produced by ${album.producer}`,
            songs.length ? `${songs.length} tracks` : undefined,
        ].filter(Boolean);
        const guests = albumGuests(songs);
        add(`### [${album.name}](${absoluteUrl(`/music/${album.slug}`)})`, "", `${facts.join(" · ")}.${guests.length ? ` With ${listNames(guests)}.` : ""}`, "");
        if (album.about) add(...album.about, "");
        if (album.listen) add(`Listen: ${album.listen.map((link) => `[${link.service}](${link.url})`).join(" · ")}`, "");
        songs.forEach((song, index) => add(`${index + 1}. ${creditedTitle(song)}`));
        if (songs.length) add("");
    }

    if (tapes.length) {
        add("## Mixtapes", "", `Full tapes that play as single videos on the [Videos page](${absoluteUrl("/videos")}).`, "");
        for (const tape of tapes) {
            const list = tapeTracklists[tape.name] ?? [];
            add(
                `- ${tape.name} by ${tape.artist} ([watch on YouTube](https://www.youtube.com/watch?v=${tape.youtubeId}))${list.length ? `: ${list.join(", ")}` : ""}`,
            );
        }
        add("");
    }

    if (uploads.length) {
        add("## Latest videos", "", "From the Loaf Records YouTube channel, newest first.", "");
        for (const upload of uploads.slice(0, 15)) {
            add(`- [${upload.title}](https://www.youtube.com/watch?v=${upload.youtubeId}): ${DATE.format(new Date(upload.published))}`);
        }
        add("");
    }

    add("## Pages", "", ...PAGES.map((page) => `- [${page.name}](${absoluteUrl(page.path)}): ${page.about}`), "");

    add("## Quick answers", "");
    for (const entry of LOAF_FAQ) add(`- **${entry.question}** ${entry.answer}`);
    add("");

    add(
        "## Official links",
        "",
        ...[...LOAF_RECORDS.sameAs, ...LOAF_MUZIK.sameAs, ...CREW.flatMap((member) => member.sameAs)].map((url) => `- ${url}`),
        "",
        "## Press",
        "",
        ...PRESS.map((article) => `- [${article.title}](${article.url}): ${article.outlet}`),
        "",
    );

    return lines.join("\n");
}
