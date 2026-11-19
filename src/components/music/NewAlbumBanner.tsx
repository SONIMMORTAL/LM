import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Play } from "lucide-react";
import { RELEASES, formatPrice } from "@/lib/releases";
import { cn } from "@/lib/utils";

const album = RELEASES["god-is-good"];
const book = RELEASES["god-is-good-audiobook"];

/**
 * The new album, up front: its cover, the previews and the name-your-price pitch, with the
 * audio book beside it. On the music page and the phone home page.
 */
export function NewAlbumBanner({ className }: { className?: string }) {
    return (
        <section aria-labelledby="new-album-banner" className={cn("relative z-10", className)}>
            <div className="overflow-hidden rounded-[28px] border-2 border-[#141714] bg-white shadow-[0_18px_40px_rgba(20,23,20,0.12)]">
                <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                <Link href={album.path} className="group flex items-center gap-3.5 p-3 sm:gap-5 sm:p-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-[#141714]/15 shadow-md sm:h-28 sm:w-28">
                        <Image src={album.cover} alt="" fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#9B2C1F]">
                            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#9B2C1F] motion-safe:animate-pulse" />
                            New album · Out now
                        </p>
                        <h2 id="new-album-banner" className="font-display text-3xl uppercase leading-none tracking-wide text-[#141714] sm:text-4xl">
                            {album.name}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-[#3E443B]">Shadow The Great · Prod. by Ruggz · 19 tracks</p>
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#141714] px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                            <Play className="h-3 w-3 fill-current" />
                            Previews · Name your price from {formatPrice(album.minPrice)}
                        </p>
                    </div>
                    <ArrowRight aria-hidden className="hidden h-5 w-5 shrink-0 text-[#141714] transition-transform group-hover:translate-x-1 sm:block" />
                </Link>
                <Link
                    href={book.path}
                    className="flex items-center justify-between gap-3 border-t-2 border-[#141714]/10 bg-[#FAF9F6] px-4 py-2.5 text-sm hover:bg-[#F2F1EC]"
                >
                    <span className="flex items-center gap-2 font-semibold text-[#141714]">
                        <BookOpen className="h-4 w-4" /> {book.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#365332]">{formatPrice(book.minPrice)} →</span>
                </Link>
            </div>
        </section>
    );
}
