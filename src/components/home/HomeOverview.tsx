import Link from "next/link";
import { ALBUMS } from "@/lib/albums";

// The label, its founders and the crew stand out in gold, the way Shadow's bio link always has
const KEYWORD = "whitespace-nowrap text-amber-300 underline underline-offset-4";

/** Visible, server-rendered context and navigation under the desktop home room. */
export function HomeOverview() {
    return (
        <section aria-labelledby="label-overview" className="relative z-10 border-t border-amber-400/20 bg-[#060608] px-5 py-12 pb-32 text-white">
            <div className="mx-auto max-w-4xl">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-400">Independent · Brooklyn, NY</p>
                <h2 id="label-overview" className="mt-3 font-display text-3xl uppercase tracking-wide sm:text-4xl">
                    Loaf Records — Music from The Dungeon
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                    <span className={KEYWORD}>Loaf Records</span> is an independent hip-hop label from Brooklyn, founded by{" "}
                    <Link href="/bio" className={KEYWORD}>Shadow The Great</Link> and{" "}
                    <span className={KEYWORD}>Oso Dope</span>. Shadow is an artist, producer and director from Bushwick;
                    Oso is a hip-hop artist and musician seen on Raising Kanan, The Equalizer and Wu-Tang: An American
                    Saga. Together they&apos;ve performed at AfroPunk, the Apollo Theater, Hot 97&apos;s Hot Box and Higher
                    Ground in Burlington, VT. Explore the music, official merchandise, and films from the crew behind{" "}
                    <span className={KEYWORD}>Loaf Muzik</span>.
                </p>
                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                        <h3 className="font-display text-2xl uppercase tracking-wide">Shadow The Great albums</h3>
                        <p className="mt-2 text-sm leading-6 text-white/75">Stream the tracks and find digital album downloads.</p>
                        <ul className="mt-3 space-y-1">
                            {Object.values(ALBUMS).map((album) => (
                                <li key={album.id}>
                                    <Link href={`/music/${album.id}`} className="inline-flex min-h-11 items-center text-sm text-amber-300 underline underline-offset-4 hover:text-white">
                                        {album.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <nav aria-label="Explore Loaf Records">
                        <h3 className="font-display text-2xl uppercase tracking-wide">Explore the label</h3>
                        <ul className="mt-3 space-y-1">
                            {[
                                ["/music", "Music and official releases"],
                                ["/shop", "Shop official Loaf Records merch"],
                                ["/videos", "Music videos and live performances"],
                                ["/loaf-films", "Loaf Films — music video production"],
                                ["/gallery", "Photos from the Loaf Records archive"],
                                ["/contact", "Bookings, press and contact"],
                            ].map(([href, label]) => (
                                <li key={href}>
                                    <Link href={href} className="inline-flex min-h-11 items-center text-sm text-amber-300 underline underline-offset-4 hover:text-white">
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
