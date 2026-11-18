import Image from "next/image";
import Link from "next/link";
import { ALBUMS } from "@/lib/albums";

// The label, its founders and the crew stand out in gold, the way Shadow's bio link always has
const KEYWORD = "whitespace-nowrap font-semibold text-[#365332] underline underline-offset-4 hover:text-[#141714]";

/** Visible, server-rendered context and navigation under the desktop home room. */
export function HomeOverview() {
    return (
        <section aria-labelledby="label-overview" className="relative z-10 border-t-2 border-[#141714]/15 tiger-camo-surface px-5 py-12 pb-32 text-[#141714]">
            <div className="mx-auto max-w-4xl">
                <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border-2 border-[#141714] bg-white shadow-[0_20px_50px_rgba(20,23,20,0.12)]">
                    <Image
                        src="/brand/dungeon-studio-4k.webp"
                        alt="The Loaf Records crew inside The Dungeon studio in Brooklyn, NY — writing in blackbooks, recording on the mic, and producing beats"
                        fill
                        sizes="(max-width: 1024px) 96vw, 896px"
                        className="object-cover"
                    />
                </div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#365332]">Independent · Brooklyn, NY</p>
                <h2 id="label-overview" className="mt-3 font-display text-3xl uppercase tracking-wide sm:text-4xl text-[#141714]">
                    Loaf Records — Music from The Dungeon
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#3E443B]">
                    <span className={KEYWORD}>Loaf Records</span> is an independent hip-hop label from Brooklyn, founded by{" "}
                    <Link href="/bio" className={KEYWORD}>Shadow The Great</Link> and{" "}
                    <span className={KEYWORD}>Oso Dope</span>. Shadow is an artist, producer and director from Bushwick;
                    Oso is a hip-hop artist and musician seen on Raising Kanan, The Equalizer and Wu-Tang: An American
                    Saga. Together they&apos;ve performed at AfroPunk, the Apollo Theater, Hot 97&apos;s Hot Box and Higher
                    Ground in Burlington, VT. Explore the music, official merchandise, and films from the crew behind{" "}
                    <span className={KEYWORD}>Loaf Muzik</span>.
                </p>
                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div className="rounded-2xl border-2 border-[#141714]/15 bg-white p-6">
                        <h3 className="font-display text-2xl uppercase tracking-wide text-[#141714]">Shadow The Great albums</h3>
                        <p className="mt-2 text-sm leading-6 text-[#3E443B]">Stream the tracks and find digital album downloads.</p>
                        <ul className="mt-3 space-y-1">
                            {Object.values(ALBUMS).map((album) => (
                                <li key={album.id}>
                                    <Link href={`/music/${album.id}`} className="inline-flex min-h-11 items-center text-sm font-medium text-[#365332] underline underline-offset-4 hover:text-[#141714]">
                                        {album.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <nav aria-label="Explore Loaf Records" className="rounded-2xl border-2 border-[#141714]/15 bg-white p-6">
                        <h3 className="font-display text-2xl uppercase tracking-wide text-[#141714]">Explore the label</h3>
                        <ul className="mt-3 space-y-1">
                            {[
                                ["/music", "Music — albums & official releases"],
                                ["/shop", "Shop — official Loaf Wear & merch"],
                                ["/videos", "Videos — music videos & live performances"],
                                ["/loaf-films", "Films — Loaf Films production & bookings"],
                                ["/gallery", "Blackbook — graffiti, sketches & pieces"],
                            ].map(([href, label]) => (
                                <li key={href}>
                                    <Link href={href} className="inline-flex min-h-11 items-center text-sm font-medium text-[#365332] underline underline-offset-4 hover:text-[#141714]">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </section>
    );
}
