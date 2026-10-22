import Image from "next/image";
import { OnAirSign } from "@/components/brand/OnAirSign";

const ROLES = ["Artist", "Producer", "Director", "Psalm Writer"];

const FACTS = [
    { label: "From", value: "Bushwick, Brooklyn" },
    { label: "Since", value: "2009" },
    { label: "Studio", value: "The Dungeon" },
    { label: "Founder", value: "Loaf Records" },
];

/**
 * Shadow The Great's bio, for the /bio page — a card in the landing's stamped style:
 * portrait banner, the story, the facts at a glance, and the motto lit up like the
 * on-air sign at the top of the landing.
 */
export function ArtistBio() {
    return (
        <section
            id="bio"
            aria-labelledby="bio-heading"
            className="relative z-10 scroll-mt-28 px-3 sm:px-4 py-4 max-w-2xl mx-auto"
        >
            <div className="relative overflow-hidden rounded-[28px] border-2 border-amber-400/35 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
                {/* Portrait banner */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                    <Image
                        src="/brand/bio-loaf-muzik.jpg"
                        alt="Two of Loaf Muzik in black tees on a dark club floor, one in front in wide-leg jeans, the other behind him with an arm up"
                        fill
                        priority
                        sizes="(max-width: 768px) 96vw, 680px"
                        className="object-cover object-[40%_18%]"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-[#0A0B10]/60 to-transparent"
                    />

                    <div className="absolute bottom-4 left-4 right-4">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-amber-400">
                            Bushwick · Brooklyn, NY
                        </p>
                        <h1
                            id="bio-heading"
                            className="font-display uppercase leading-[0.86] tracking-[0.02em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                            style={{ fontSize: "clamp(2.5rem, 11vw, 3.75rem)" }}
                        >
                            Loaf{" "}
                            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-accent-cyan bg-clip-text text-transparent">
                                Muzik
                            </span>
                        </h1>
                        <ul aria-label="Roles" className="mt-2 flex flex-wrap gap-1.5">
                            {ROLES.map((role) => (
                                <li
                                    key={role}
                                    className="rounded-md border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/90"
                                >
                                    {role}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* The story */}
                <div className="space-y-3 px-4 pt-4 sm:px-5 text-sm leading-relaxed text-white/80">
                    <p>
                        <strong className="text-white">Shadow The Great</strong> is an independent underground
                        hip-hop artist, producer and director hailing from the Bushwick neighborhood of
                        Brooklyn, New York. He is a psalm writer and the founder of{" "}
                        <strong className="text-amber-400">Loaf Records</strong>.
                    </p>
                    <p>
                        His music journey began around 2009 through a Brooklyn after-school program. He went
                        on to build his own basement studio, <strong className="text-white">The Dungeon</strong>,
                        where he produces, mixes and masters his own projects, and crafts a few for others.
                    </p>
                    <p>
                        <strong className="text-white">Loaf Muzik</strong> is the independent underground
                        hip-hop collective behind it all: based in Brooklyn and managed closely under its own
                        independent imprint.
                    </p>
                </div>

                {/* The facts at a glance */}
                <dl className="grid grid-cols-2 gap-2 px-4 pt-4 sm:px-5">
                    {FACTS.map((fact) => (
                        <div key={fact.label} className="rounded-2xl border border-white/10 bg-[#101219] px-3 py-2.5">
                            <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                {fact.label}
                            </dt>
                            <dd className="mt-1 font-display text-xl uppercase leading-tight tracking-wider text-white">
                                {fact.value}
                            </dd>
                        </div>
                    ))}
                </dl>

                {/* The motto, lit up like the sign over the studio door */}
                <div className="flex justify-center px-4 py-6 text-center">
                    <OnAirSign size="lg">
                        Live From The Dungeon
                        <span className="block">To The World</span>
                    </OnAirSign>
                </div>
            </div>
        </section>
    );
}
