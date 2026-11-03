import Image from "next/image";
import Link from "next/link";
import { OnAirSign } from "@/components/brand/OnAirSign";
import { CREW, LOAF_FAQ, LOAF_MUZIK, OSO_DOPE, PRESS, SHADOW_THE_GREAT, crewMemberPath, type CrewMember } from "@/lib/crew";

const TAGS = ["Underground hip-hop", "Independent", "Collective"];

const FACTS = [
    { label: "Based", value: "Brooklyn, NY" },
    { label: "Since", value: "2009" },
    { label: "Studio", value: "The Dungeon" },
    { label: "Founders", value: "Shadow & Oso" },
];

// The collective, the label and the crew stand out in gold, as they did in the old footer bio
const KEYWORD = "whitespace-nowrap font-semibold text-amber-300 underline underline-offset-4";

/** A crew member's name, linked to their page or their card below */
function CrewName({ member }: { member: CrewMember }) {
    return (
        <Link href={member.hasPage ? crewMemberPath(member) : `#${member.slug}`} className={KEYWORD}>
            {member.name}
        </Link>
    );
}

const chip =
    "rounded-md border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/90";

/**
 * The /bio page: Loaf Muzik, the collective, and Loaf Records, its label — then its
 * founders, Shadow The Great and Oso Dope, each on their own card. A card in the landing's stamped
 * style, with the facts at a glance, the questions people ask, the press, and the motto
 * lit up like the on-air sign at the top of the landing. The facts come from lib/crew,
 * which the structured data and /llms.txt read too.
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
                        <span className={KEYWORD}>Loaf Muzik</span> (you&apos;ll also see it written Loaf Music) is the
                        independent underground hip-hop collective out of Brooklyn, home to{" "}
                        <CrewName member={SHADOW_THE_GREAT} /> and <CrewName member={OSO_DOPE} />.{" "}
                        <span className={KEYWORD}>Loaf Records</span> is its label, and the two of them founded it.
                    </p>
                    <p>
                        It started out as Meatloaf Muzik and won AFROPUNK&apos;s Battle of the Bands, which put the crew on
                        the festival&apos;s bill.
                    </p>
                    <p>
                        Together they&apos;ve performed at AfroPunk, the Apollo Theater, Hot 97&apos;s Hot Box and, outside New York,
                        Higher Ground in Burlington, VT.
                    </p>
                </div>

                {/* The founders, one card each */}
                <div className="space-y-2.5 px-4 pt-4 sm:px-5">
                    {CREW.map((member) => (
                        <article
                            key={member.slug}
                            id={member.slug}
                            aria-labelledby={`${member.slug}-name`}
                            className="scroll-mt-28 rounded-2xl border border-white/10 bg-[#101219] p-3.5"
                        >
                            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                {member.founder ? "Co-founder · Loaf Records" : "Member · Loaf Muzik"}
                            </p>
                            <h2
                                id={`${member.slug}-name`}
                                className="mt-1 font-display text-2xl uppercase leading-none tracking-wider text-white"
                            >
                                {member.name}
                            </h2>
                            <ul aria-label={`${member.name}'s roles`} className="mt-2 flex flex-wrap gap-1.5">
                                {member.roles.map((role) => (
                                    <li key={role} className={chip}>
                                        {role}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2.5 space-y-2 text-sm leading-relaxed text-white/80">
                                {member.story.map((line) => (
                                    <p key={line}>{line}</p>
                                ))}
                            </div>
                            {member.hasPage && (
                                <Link
                                    href={crewMemberPath(member)}
                                    className="mt-2 inline-flex items-center font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300 underline underline-offset-4"
                                >
                                    {member.name}&apos;s music →
                                </Link>
                            )}
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

                {/* The questions people ask, answered */}
                <section id="faq" aria-labelledby="bio-faq" className="scroll-mt-28 px-4 pt-6 sm:px-5">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400">Asked and answered</p>
                    <h2 id="bio-faq" className="mt-1 font-display text-2xl uppercase leading-none tracking-wider text-white">
                        About {LOAF_MUZIK.name}
                    </h2>
                    <dl className="mt-3 space-y-3">
                        {LOAF_FAQ.map((entry) => (
                            <div key={entry.question} className="rounded-2xl border border-white/10 bg-[#101219] px-3.5 py-3">
                                <dt className="font-display text-lg uppercase leading-tight tracking-wider text-white">
                                    {entry.question}
                                </dt>
                                <dd className="mt-1 text-sm leading-relaxed text-white/80">{entry.answer}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* Who's written about them */}
                <section aria-labelledby="bio-press" className="px-4 pt-6 sm:px-5">
                    <h2 id="bio-press" className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-amber-400">
                        In the press
                    </h2>
                    <ul className="mt-2 space-y-1.5">
                        {PRESS.map((article) => (
                            <li key={article.url} className="text-sm leading-snug text-white/80">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-noir-cloud">
                                    {article.outlet}
                                </span>{" "}
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-4 hover:text-amber-300"
                                >
                                    {article.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>

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
