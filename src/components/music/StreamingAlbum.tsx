import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { AlbumRelease } from "@/lib/discography";
import type { TrackCredits } from "@/lib/credits";

interface StreamingAlbumProps {
    album: AlbumRelease;
    artistHref?: string;
    songs: TrackCredits[];
}

/**
 * The page for an album that streams elsewhere rather than on the site: its cover, its bio,
 * where to listen and the tracklist with who's on each song. Laid out like the album pages
 * the catalogue plays, without the player and the purchase button.
 */
export function StreamingAlbum({ album, artistHref, songs }: StreamingAlbumProps) {
    const year = album.released?.slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Link href="/music" className="inline-flex items-center gap-2 text-noir-cloud hover:text-accent-cyan transition-colors mb-8 text-sm sm:text-base">
                <ChevronLeft className="w-4 h-4" />
                Back to Music
            </Link>

            <div className={`absolute inset-0 bg-gradient-to-r ${album.gradient} rounded-3xl blur-3xl opacity-20 -z-10`} />

            <div className="bg-noir-charcoal rounded-3xl border-2 border-foreground/15 overflow-hidden shadow-[0_22px_56px_rgba(20,23,20,0.10)]">
                <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    <div className="lg:col-span-5 p-8 lg:p-12 space-y-8">
                        <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl ring-4 ring-noir-smoke">
                            <Image
                                src={album.cover}
                                alt={`Album cover of ${album.name} by ${album.artist}`}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 30vw"
                                className="object-cover"
                            />
                        </div>

                        <div className="text-center lg:text-left space-y-3">
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground uppercase leading-none">{album.name}</h1>
                            <p className="text-lg text-accent-cyan font-medium">
                                {artistHref ? (
                                    <Link href={artistHref} className="underline-offset-4 hover:underline">
                                        {album.artist}
                                    </Link>
                                ) : (
                                    album.artist
                                )}
                            </p>
                            <p className="text-sm text-noir-cloud">
                                {[year, `${songs.length} tracks`].filter(Boolean).join(" • ")}
                            </p>
                        </div>

                        {album.about?.map((line) => (
                            <p key={line} className="text-sm leading-relaxed text-noir-cloud">
                                {line}
                            </p>
                        ))}

                        {album.listen && (
                            <div>
                                <h2 className="text-sm font-bold text-noir-cloud uppercase tracking-wider mb-3">Listen</h2>
                                <ul className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2">
                                    {album.listen.map((link) => (
                                        <li key={link.url}>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center rounded-xl bg-foreground hover:bg-accent-cyan px-4 py-3 text-sm font-bold uppercase tracking-wider text-background hover:text-white shadow-md transition-colors active:scale-[0.98]"
                                            >
                                                {link.service} ↗
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-noir-smoke p-8">
                        <h2 className="text-sm font-bold text-noir-cloud uppercase tracking-wider mb-6">Tracklist</h2>
                        <ol className="space-y-1">
                            {songs.map((song, index) => (
                                <li key={`${index}-${song.title}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-noir-slate/60 transition-colors">
                                    <span className="w-8 text-center text-sm font-mono text-noir-ash">
                                        {(index + 1).toString().padStart(2, "0")}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block font-medium text-foreground">{song.title}</span>
                                        <span className="block text-sm text-noir-ash">
                                            {song.featured.length ? `${song.main} feat. ${song.featured.join(", ")}` : song.main}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
