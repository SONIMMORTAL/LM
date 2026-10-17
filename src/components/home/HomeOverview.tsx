import Link from "next/link";
import { ALBUMS } from "@/lib/albums";
import { socialLinks } from "@/components/layout/socialLinks";

/** Visible, server-rendered context and navigation for both home experiences. */
export function HomeOverview() {
    return (
        <section aria-labelledby="label-overview" className="relative z-10 border-t border-amber-400/20 bg-[#060608] px-5 py-12 pb-32 text-white">
            <div className="mx-auto max-w-4xl">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-400">Independent · Brooklyn, NY</p>
                <h2 id="label-overview" className="mt-3 font-display text-3xl uppercase tracking-wide sm:text-4xl">
                    Loaf Records — Music from The Dungeon
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                    Loaf Records is an independent hip-hop label from Brooklyn, founded by{" "}
                    <Link href="/bio" className="text-amber-300 underline underline-offset-4">Shadow The Great</Link>{" "}
                    — an artist, producer and director from Bushwick — and Oso Dope. Explore the music, official merchandise,
                    and films from the crew behind Loaf Muzik.
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

                {/* Phones end here, so the socials the desktop footer carries live on this line */}
                <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6 lg:hidden">
                    <div className="flex items-center gap-4">
                        {socialLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                className="-m-2 inline-flex h-11 w-11 items-center justify-center text-white/60 transition-colors hover:text-amber-300"
                            >
                                <link.icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                        © {new Date().getFullYear()} Loaf Records
                    </p>
                </div>
            </div>
        </section>
    );
}
