import Image from "next/image";
import Link from "next/link";
import { CREW, LOAF_MUZIK, crewMemberPath, findCrewMember, type CrewMember } from "@/lib/crew";
import type { ArtistAlbumCredit } from "@/lib/discography";
import type { VideoTape } from "@/lib/video-tapes";
import type { ChannelUpload } from "@/lib/youtube-feed";

const chip =
    "rounded-md border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/90";
const label = "font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400";
const heading = "font-display text-2xl uppercase leading-none tracking-wider text-white";
// Crewmates are links: pills tall enough to tap, in gold so they read as links
const crewChip =
    "inline-flex min-h-8 items-center rounded-md border border-amber-400/50 bg-amber-400/10 px-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-amber-300";
const row = "flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101219] p-2.5 transition-colors hover:border-amber-400/40";

const DROP_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });

interface ArtistProfileProps {
    member: CrewMember;
    albums: ArtistAlbumCredit[];
    tapes: Array<VideoTape & { trackCount: number }>;
    videos: ChannelUpload[];
    collaborators: string[];
}

/**
 * An artist's page: who they are, then everything of theirs on the site — their albums,
 * the songs they're on, their tapes and videos, and who they make music with. In the
 * bio's stamped card style, built from the same facts as the bio.
 */
export function ArtistProfile({ member, albums, tapes, videos, collaborators }: ArtistProfileProps) {
    const crewmates = CREW.filter((other) => other.slug !== member.slug);

    return (
        <article aria-labelledby="artist-name" className="relative z-10 px-3 sm:px-4 py-4 max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-[28px] border-2 border-amber-400/35 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
                <header className="px-4 pt-5 sm:px-5">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-amber-400">
                        <Link href="/bio" className="underline underline-offset-4">
                            {LOAF_MUZIK.name}
                        </Link>{" "}
                        · Brooklyn, NY
                    </p>
                    <h1
                        id="artist-name"
                        className="mt-1 font-display uppercase leading-[0.86] tracking-[0.02em] text-white"
                        style={{ fontSize: "clamp(2.5rem, 11vw, 3.75rem)" }}
                    >
                        {member.name}
                    </h1>
                    <p className={`mt-2 ${label}`}>
                        {member.founder ? "Co-founder · Loaf Records · " : ""}Member · Loaf Muzik
                    </p>
                    <ul aria-label={`${member.name}'s roles`} className="mt-2 flex flex-wrap gap-1.5">
                        {member.roles.map((role) => (
                            <li key={role} className={chip}>
                                {role}
                            </li>
                        ))}
                    </ul>
                </header>

                <div className="space-y-2 px-4 pt-4 sm:px-5 text-sm leading-relaxed text-white/80">
                    {member.story.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>

                {albums.length > 0 && (
                    <section aria-labelledby="artist-music" className="px-4 pt-6 sm:px-5">
                        <p className={label}>The music</p>
                        <h2 id="artist-music" className={`mt-1 ${heading}`}>
                            Hear {member.name}
                        </h2>
                        <ul className="mt-3 space-y-2">
                            {albums.map(({ album, lead, songs, total }) => (
                                <li key={album.slug}>
                                    <Link href={`/music/${album.slug}`} className={row}>
                                        <Image
                                            src={album.cover}
                                            alt={`${album.name} cover`}
                                            width={64}
                                            height={64}
                                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                        />
                                        <span className="min-w-0">
                                            <span className="block font-display text-xl uppercase leading-tight tracking-wider text-white">
                                                {album.name}
                                            </span>
                                            <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-noir-cloud">
                                                {lead
                                                    ? `${album.artist}${album.released ? ` · ${album.released.slice(0, 4)}` : ""} · ${total} tracks`
                                                    : `${album.artist} · on ${songs.length} of ${total} tracks`}
                                            </span>
                                            {!lead && (
                                                <span className="mt-1 block text-xs leading-snug text-white/70">
                                                    {songs.map((song) => song.title).join(" · ")}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {tapes.length > 0 && (
                    <section aria-labelledby="artist-tapes" className="px-4 pt-6 sm:px-5">
                        <p className={label}>Full tapes on video</p>
                        <h2 id="artist-tapes" className={`mt-1 ${heading}`}>
                            Mixtapes
                        </h2>
                        <ul className="mt-3 grid grid-cols-1 min-[420px]:grid-cols-3 gap-2">
                            {tapes.map((tape) => (
                                <li key={tape.slug}>
                                    <Link href="/videos" className={`${row} min-[420px]:flex-col min-[420px]:items-start`}>
                                        <Image
                                            src={tape.cover}
                                            alt={`${tape.name} cover`}
                                            width={96}
                                            height={96}
                                            className="h-14 w-14 min-[420px]:h-auto min-[420px]:w-full shrink-0 rounded-lg object-cover aspect-square"
                                        />
                                        <span>
                                            <span className="block font-display text-lg uppercase leading-tight tracking-wider text-white">
                                                {tape.name}
                                            </span>
                                            <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-noir-cloud">
                                                {tape.trackCount ? `${tape.trackCount} tracks · ` : ""}Watch ↗
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {videos.length > 0 && (
                    <section aria-labelledby="artist-videos" className="px-4 pt-6 sm:px-5">
                        <p className={label}>Loaf Films · On YouTube</p>
                        <h2 id="artist-videos" className={`mt-1 ${heading}`}>
                            Videos
                        </h2>
                        <ul className="mt-3 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#101219]">
                            {videos.map((video) => (
                                <li key={video.youtubeId}>
                                    <a
                                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-baseline justify-between gap-3 px-3 py-2.5 hover:bg-white/5"
                                    >
                                        <span className="min-w-0 text-sm text-white/85">{video.title}</span>
                                        <time
                                            dateTime={video.published}
                                            className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-noir-cloud"
                                        >
                                            {DROP_DATE.format(new Date(video.published))}
                                        </time>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {collaborators.length > 0 && (
                    <section aria-labelledby="artist-collaborators" className="px-4 pt-6 sm:px-5">
                        <p className={label}>On the songs with</p>
                        <h2 id="artist-collaborators" className={`mt-1 ${heading}`}>
                            Collaborators
                        </h2>
                        <ul className="mt-3 flex flex-wrap items-center gap-1.5">
                            {collaborators.map((name) => {
                                const crewmate = findCrewMember(name);
                                return (
                                    <li key={name}>
                                        {crewmate ? (
                                            <Link href={crewMemberPath(crewmate)} className={crewChip}>
                                                {name}
                                            </Link>
                                        ) : (
                                            <span className={`${chip} inline-block`}>{name}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}

                <nav aria-labelledby="artist-crew" className="px-4 py-6 sm:px-5">
                    <p className={label}>The rest of the crew</p>
                    <h2 id="artist-crew" className={`mt-1 ${heading}`}>
                        Loaf Muzik
                    </h2>
                    <ul className="mt-3 grid grid-cols-2 gap-2">
                        {crewmates.map((other) => (
                            <li key={other.slug}>
                                <Link
                                    href={crewMemberPath(other)}
                                    className="block rounded-2xl border border-white/10 bg-[#101219] px-3 py-2.5 hover:border-amber-400/40"
                                >
                                    <span className="block font-display text-lg uppercase leading-tight tracking-wider text-white">
                                        {other.name}
                                    </span>
                                    <span className="block font-mono text-[8px] uppercase tracking-[0.16em] text-noir-cloud">
                                        {other.roles.slice(0, 2).join(" · ")}
                                    </span>
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href="/bio"
                                className="block rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3 py-2.5"
                            >
                                <span className="block font-display text-lg uppercase leading-tight tracking-wider text-amber-300">
                                    The story
                                </span>
                                <span className="block font-mono text-[8px] uppercase tracking-[0.16em] text-amber-300/80">
                                    Loaf Muzik bio
                                </span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </article>
    );
}
