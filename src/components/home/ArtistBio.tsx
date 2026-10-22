import Image from "next/image";
import { OnAirSign } from "@/components/brand/OnAirSign";

const TAGS = ["Underground hip-hop", "Independent", "Collective"];

const FACTS = [
    { label: "Based", value: "Brooklyn, NY" },
    { label: "Since", value: "2009" },
    { label: "Studio", value: "The Dungeon" },
    { label: "Founders", value: "Shadow & Oso" },
];

// The collective, the label and the founders stand out in gold, as they did in the old footer bio
const KEYWORD = "whitespace-nowrap font-semibold text-amber-300 underline underline-offset-4";

const FOUNDERS = [
    {
        name: "Shadow The Great",
        anchor: "shadow-the-great",
        roles: ["Artist", "Producer", "Director", "Psalm Writer"],
        story: [
            "An independent underground hip-hop artist, producer and director from Bushwick, Brooklyn, and a psalm writer.",
            "His music journey began around 2009 through a Brooklyn after-school program. He went on to build his own basement studio, The Dungeon, where he produces, mixes and masters his own projects, and crafts a few for others.",
        ],
    },
    {
        name: "Oso Dope",
        anchor: "oso-dope",
        roles: ["Artist", "Musician", "On screen"],
        story: [
            "A Brooklyn-based hip-hop artist and musician, and a member of Loaf Muzik.",
            "On screen he's credited with roles or appearances in Raising Kanan (Starz), The Equalizer (CBS), Wu-Tang: An American Saga and NBA Top Shot ads.",
        ],
    },
];

const chip =
    "rounded-md border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/90";

/**
 * The /bio page: Loaf Muzik, the collective, and Loaf Records, its label — then the two
 * who founded it, Shadow The Great and Oso Dope, each on their own card. A card in the
 * landing's stamped style, with the facts at a glance and the motto lit up like the on-air
 * sign at the top of the landing.
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
                            Loaf Records · Brooklyn, NY
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
                        <ul aria-label="About" className="mt-2 flex flex-wrap gap-1.5">
                            {TAGS.map((tag) => (
                                <li key={tag} className={chip}>
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* The collective and the label */}
                <div className="space-y-3 px-4 pt-4 sm:px-5 text-sm leading-relaxed text-white/80">
                    <p>
                        <span className={KEYWORD}>Loaf Muzik</span> is the independent underground hip-hop
                        collective out of Brooklyn, and <span className={KEYWORD}>Loaf Records</span> is its
                        label, founded by <a href="#shadow-the-great" className={KEYWORD}>Shadow The Great</a> and{" "}
                        <a href="#oso-dope" className={KEYWORD}>Oso Dope</a>.
                    </p>
                    <p>
                        Together they&apos;ve performed at AfroPunk, the Apollo Theater, Hot 97&apos;s Hot Box and,
                        outside New York, Higher Ground in Burlington, VT.
                    </p>
                </div>

                {/* The founders, one card each */}
                <div className="space-y-2.5 px-4 pt-4 sm:px-5">
                    {FOUNDERS.map((founder) => (
                        <article
                            key={founder.anchor}
                            id={founder.anchor}
                            aria-labelledby={`${founder.anchor}-name`}
                            className="scroll-mt-28 rounded-2xl border border-white/10 bg-[#101219] p-3.5"
                        >
                            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                Co-founder · Loaf Records
                            </p>
                            <h2
                                id={`${founder.anchor}-name`}
                                className="mt-1 font-display text-2xl uppercase leading-none tracking-wider text-white"
                            >
                                {founder.name}
                            </h2>
                            <ul aria-label={`${founder.name}'s roles`} className="mt-2 flex flex-wrap gap-1.5">
                                {founder.roles.map((role) => (
                                    <li key={role} className={chip}>
                                        {role}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2.5 space-y-2 text-sm leading-relaxed text-white/80">
                                {founder.story.map((line) => (
                                    <p key={line}>{line}</p>
                                ))}
                            </div>
                        </article>
                    ))}
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
