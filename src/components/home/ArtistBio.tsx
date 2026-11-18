import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Music2, Play } from "lucide-react";
import { OnAirSign } from "@/components/brand/OnAirSign";
import {
    CREW,
    LOAF_FAQ,
    LOAF_MUZIK,
    OSO_DOPE,
    PRESS,
    SHADOW_THE_GREAT,
    crewMemberPath,
    type CrewMember,
} from "@/lib/crew";

const TAGS = ["Underground hip-hop", "Independent", "Collective"] as const;

const FACTS = [
    { label: "Based", value: "Brooklyn, NY" },
    { label: "Since", value: "2009" },
    { label: "Studio", value: "The Dungeon" },
    { label: "Founders", value: "Shadow & Oso" },
] as const;

const KEYWORD = "whitespace-nowrap font-semibold text-[#365332] underline underline-offset-4 hover:text-[#141714]";
const CHIP =
    "rounded-md border border-[#141714]/20 bg-[#F2F1EC] px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#141714]";

function CrewName({ member, anchorPrefix = "" }: { member: CrewMember; anchorPrefix?: string }) {
    return (
        <Link
            href={member.hasPage ? crewMemberPath(member) : `#${anchorPrefix}${member.slug}`}
            className={KEYWORD}
        >
            {member.name}
        </Link>
    );
}

function CollectiveStoryCopy({ anchorPrefix = "" }: { anchorPrefix?: string }) {
    return (
        <>
            <p>
                <span className={KEYWORD}>Loaf Muzik</span> (you&apos;ll also see it written Loaf Music) is the
                independent underground hip-hop collective out of Brooklyn, home to{" "}
                <CrewName member={SHADOW_THE_GREAT} anchorPrefix={anchorPrefix} /> and{" "}
                <CrewName member={OSO_DOPE} anchorPrefix={anchorPrefix} />.{" "}
                <span className={KEYWORD}>Loaf Records</span> is its label, and the two of them founded it.
            </p>
            <p>
                It started out as Meatloaf Muzik and won AFROPUNK&apos;s Battle of the Bands, which put the
                crew on the festival&apos;s bill.
            </p>
            <p>
                Together they&apos;ve performed at AfroPunk, the Apollo Theater, Hot 97&apos;s Hot Box and,
                outside New York, Higher Ground in Burlington, VT.
            </p>
        </>
    );
}

function FounderCard({
    member,
    anchorPrefix = "",
    large = false,
}: {
    member: CrewMember;
    anchorPrefix?: string;
    large?: boolean;
}) {
    return (
        <article
            id={`${anchorPrefix}${member.slug}`}
            aria-labelledby={`${anchorPrefix}${member.slug}-name`}
            className={`scroll-mt-28 flex flex-col justify-between rounded-2xl border-2 border-[#141714]/15 bg-white shadow-[0_12px_32px_rgba(20,23,20,0.06)] ${
                large ? "p-6" : "p-4 bg-[#FAF9F6]"
            }`}
        >
            <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#365332]">
                    {member.founder ? "Co-founder · Loaf Records" : "Member · Loaf Muzik"}
                </p>
                <h2
                    id={`${anchorPrefix}${member.slug}-name`}
                    className={`mt-1.5 font-display uppercase leading-none tracking-wider text-[#141714] ${
                        large ? "text-3xl" : "text-2xl"
                    }`}
                >
                    {member.name}
                </h2>
                <ul aria-label={`${member.name}'s roles`} className="mt-2.5 flex flex-wrap gap-1.5">
                    {member.roles.map((role) => (
                        <li key={role} className={CHIP}>
                            {role}
                        </li>
                    ))}
                </ul>
                <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#3E443B]">
                    {member.story.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            </div>

            {member.hasPage && (
                <div className={large ? "mt-5 pt-4 border-t border-[#141714]/10" : "mt-3"}>
                    <Link
                        href={crewMemberPath(member)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#365332] underline underline-offset-4 hover:text-[#141714]"
                    >
                        <span>{member.name}&apos;s music</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}
        </article>
    );
}

export function BioActionButtons({ className = "" }: { className?: string }) {
    return (
        <nav aria-label="Hear and watch" className={className}>
            <Link
                href="/music"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#141714] bg-[#141714] py-3.5 px-5 font-mono text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm hover:bg-[#365332] hover:border-[#365332] active:scale-[0.98] transition-all"
            >
                <Music2 className="w-4 h-4" />
                <span>Hear The Music</span>
            </Link>
            <Link
                href="/videos"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#365332] bg-white py-3.5 px-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#365332] hover:bg-[#365332] hover:text-white active:scale-[0.98] transition-colors"
            >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch The Videos</span>
            </Link>
        </nav>
    );
}

/**
 * The /bio page: bespoke wide editorial dossier on desktop (`lg+`) and compact
 * stamped zine card on mobile (`< lg`), both styled in crisp White + Tiger-Stripe Camo.
 */
export function ArtistBio() {
    return (
        <section id="bio" className="relative z-10 scroll-mt-28">
            {/* ════════════════════════════════════════════════════════════════
                DESKTOP BUILD — wide asymmetric editorial dossier (`lg+`)
               ════════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block max-w-7xl mx-auto px-8 xl:px-10 py-4 space-y-10">
                {/* 1. Cinema Split Hero */}
                <div className="grid grid-cols-12 gap-8 items-stretch">
                    <div className="col-span-7 relative overflow-hidden rounded-3xl border-2 border-[#141714] bg-white shadow-[0_22px_60px_rgba(20,23,20,0.12)]">
                        <div aria-hidden className="tiger-camo-strip h-2.5 w-full" />
                        <div className="relative h-[calc(100%-0.625rem)] min-h-[380px] aspect-[16/9]">
                            <Image
                                src="/brand/dungeon-studio-4k.webp"
                                alt="The Loaf Records crew inside The Dungeon studio in Brooklyn — writing in blackbooks, recording on the mic, and making beats under the LOAF graffiti piece"
                                fill
                                priority
                                fetchPriority="high"
                                sizes="(min-width: 1280px) 720px, 58vw"
                                className="object-cover object-center"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15"
                            />
                            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-white">
                                <span className="rounded-full border border-white/25 bg-black/75 px-3 py-1 backdrop-blur-sm">
                                    The Dungeon · Brooklyn, NY
                                </span>
                                <span className="rounded-full border border-white/25 bg-black/75 px-3 py-1 backdrop-blur-sm">
                                    Est. 2009
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-5 flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[#141714] bg-white p-7 xl:p-8 shadow-[0_22px_60px_rgba(20,23,20,0.10)]">
                        <div>
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#365332]">
                                Bio · Loaf Records · Label Dossier
                            </p>
                            <h1 className="mt-2 font-display text-6xl xl:text-7xl uppercase leading-[0.86] tracking-[0.02em] text-[#141714]">
                                Loaf{" "}
                                <span className="text-[#365332]">
                                    Muzik
                                </span>
                            </h1>
                            <ul aria-label="Collective attributes" className="mt-4 flex flex-wrap gap-2">
                                {TAGS.map((tag) => (
                                    <li key={tag} className={CHIP}>
                                        {tag}
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-5 text-sm xl:text-base leading-relaxed text-[#3E443B]">
                                Brooklyn&apos;s independent underground hip-hop collective &amp; recording label founded by{" "}
                                <CrewName member={SHADOW_THE_GREAT} anchorPrefix="dt-" /> and{" "}
                                <CrewName member={OSO_DOPE} anchorPrefix="dt-" /> — built inside their basement studio,{" "}
                                <strong className="font-semibold text-[#141714]">The Dungeon</strong>.
                            </p>
                        </div>

                        <div className="space-y-5 pt-6">
                            <dl className="grid grid-cols-2 gap-2.5">
                                {FACTS.map((fact) => (
                                    <div
                                        key={fact.label}
                                        className="rounded-xl border border-[#141714]/15 bg-[#F6F5F0] px-3.5 py-2.5"
                                    >
                                        <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#365332]">
                                            {fact.label}
                                        </dt>
                                        <dd className="mt-0.5 font-display text-xl uppercase tracking-wider text-[#141714]">
                                            {fact.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            <BioActionButtons className="grid grid-cols-2 gap-3" />
                        </div>
                    </div>
                </div>

                {/* 2. Stage Portrait + Collective Story & Side-by-Side Co-Founders */}
                <div className="grid grid-cols-12 gap-8 items-start">
                    <div className="col-span-4 space-y-6">
                        <figure className="relative overflow-hidden rounded-3xl border-2 border-[#141714] bg-white shadow-[0_18px_48px_rgba(20,23,20,0.09)]">
                            <div className="relative aspect-[3/4] w-full bg-[#141714]">
                                <Image
                                    src="/brand/bio-loaf-muzik.jpg"
                                    alt="Shadow The Great and Oso Dope performing live under stage lights"
                                    fill
                                    sizes="(min-width: 1280px) 380px, 30vw"
                                    className="object-cover object-top"
                                />
                            </div>
                            <figcaption className="border-t-2 border-[#141714]/15 bg-white px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#3E443B]">
                                Live Stages: AfroPunk · Apollo · Hot 97 Hot Box · Higher Ground
                            </figcaption>
                        </figure>

                        <div className="flex justify-center rounded-3xl border-2 border-[#141714]/15 bg-[#141714] py-6 px-4 shadow-md">
                            <OnAirSign size="sm">
                                Live From The Dungeon
                                <span className="block">To The World</span>
                            </OnAirSign>
                        </div>
                    </div>

                    <div className="col-span-8 space-y-6">
                        {/* Origin Narrative */}
                        <div className="overflow-hidden rounded-3xl border-2 border-[#141714]/15 bg-white shadow-[0_14px_38px_rgba(20,23,20,0.06)]">
                            <div aria-hidden className="tiger-camo-strip h-1.5 w-full" />
                            <div className="p-7 space-y-3.5 text-base leading-relaxed text-[#3E443B]">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#365332]">
                                    Origin · From Meatloaf Muzik To Loaf Records
                                </p>
                                <CollectiveStoryCopy anchorPrefix="dt-" />
                            </div>
                        </div>

                        {/* Founders Side-by-Side */}
                        <div>
                            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#61675E]">
                                Co-Founders &amp; Roster
                            </p>
                            <div className="grid grid-cols-2 gap-5">
                                {CREW.map((member) => (
                                    <FounderCard
                                        key={member.slug}
                                        member={member}
                                        anchorPrefix="dt-"
                                        large
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. FAQ & Press Spread */}
                <div className="grid grid-cols-12 gap-8 items-start pt-6 border-t-2 border-[#141714]/10">
                    <section aria-labelledby="dt-bio-faq" className="col-span-7 space-y-4">
                        <div>
                            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#365332]">
                                Asked and answered
                            </p>
                            <h2
                                id="dt-bio-faq"
                                className="mt-1 font-display text-3xl uppercase leading-none tracking-wider text-[#141714]"
                            >
                                About {LOAF_MUZIK.name}
                            </h2>
                        </div>
                        <dl className="grid grid-cols-2 gap-3.5">
                            {LOAF_FAQ.map((entry) => (
                                <div
                                    key={entry.question}
                                    className="rounded-2xl border-2 border-[#141714]/12 bg-white p-4 shadow-sm"
                                >
                                    <dt className="font-display text-lg uppercase leading-tight tracking-wider text-[#141714]">
                                        {entry.question}
                                    </dt>
                                    <dd className="mt-1.5 text-sm leading-relaxed text-[#3E443B]">
                                        {entry.answer}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section aria-labelledby="dt-bio-press" className="col-span-5 space-y-4">
                        <div>
                            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#365332]">
                                Coverage &amp; Reviews
                            </p>
                            <h2
                                id="dt-bio-press"
                                className="mt-1 font-display text-3xl uppercase leading-none tracking-wider text-[#141714]"
                            >
                                In The Press
                            </h2>
                        </div>
                        <ul className="space-y-2.5">
                            {PRESS.map((article) => (
                                <li key={article.url}>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-start justify-between gap-3 rounded-2xl border-2 border-[#141714]/12 bg-white p-4 shadow-sm transition-colors hover:border-[#365332]"
                                    >
                                        <div>
                                            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#365332]">
                                                {article.outlet}
                                            </span>
                                            <p className="mt-1 text-sm font-medium leading-snug text-[#141714] group-hover:text-[#365332]">
                                                {article.title}
                                            </p>
                                        </div>
                                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#61675E] transition-colors group-hover:text-[#365332]" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                MOBILE BUILD — white & tiger-camo stamped zine card (`< lg`)
               ════════════════════════════════════════════════════════════════ */}
            <div className="lg:hidden px-3 sm:px-4 py-4 max-w-2xl mx-auto">
                <div className="relative overflow-hidden rounded-[28px] border-2 border-[#141714] bg-white shadow-[0_20px_60px_rgba(20,23,20,0.12)]">
                    <div aria-hidden className="tiger-camo-strip h-2.5 w-full" />
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-[#141714]/15">
                        <Image
                            src="/brand/dungeon-studio-4k.webp"
                            alt="The Loaf Records crew inside The Dungeon studio in Brooklyn"
                            fill
                            priority
                            sizes="96vw"
                            className="object-cover object-center"
                        />
                    </div>

                    <div className="border-b border-[#141714]/12 bg-white px-4 py-4 sm:px-5">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#365332]">
                            Bio · Loaf Records · Brooklyn, NY
                        </p>
                        <h1
                            id="bio-heading"
                            className="mt-1 font-display uppercase leading-[0.88] tracking-[0.02em] text-[#141714]"
                            style={{ fontSize: "clamp(2.5rem, 11vw, 3.75rem)" }}
                        >
                            Loaf{" "}
                            <span className="text-[#365332]">Muzik</span>
                        </h1>
                        <ul aria-label="About" className="mt-2.5 flex flex-wrap gap-1.5">
                            {TAGS.map((tag) => (
                                <li key={tag} className={CHIP}>
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid gap-4 px-4 pt-4 sm:grid-cols-[150px_1fr] sm:items-start sm:px-5">
                        <div className="relative aspect-[2/3] w-36 overflow-hidden rounded-2xl border-2 border-[#141714] bg-[#141714] sm:w-full">
                            <Image
                                src="/brand/bio-loaf-muzik.jpg"
                                alt="Two of Loaf Muzik in black tees on a dark club floor"
                                fill
                                sizes="(max-width: 640px) 144px, 160px"
                                className="object-cover object-top"
                            />
                        </div>
                        <div className="space-y-3 text-sm leading-relaxed text-[#3E443B]">
                            <CollectiveStoryCopy />
                        </div>
                    </div>

                    <div className="space-y-2.5 px-4 pt-4 sm:px-5">
                        {CREW.map((member) => (
                            <FounderCard key={member.slug} member={member} />
                        ))}
                    </div>

                    <dl className="grid grid-cols-2 gap-2 px-4 pt-4 sm:px-5">
                        {FACTS.map((fact) => (
                            <div
                                key={fact.label}
                                className="rounded-2xl border border-[#141714]/15 bg-[#F6F5F0] px-3 py-2.5"
                            >
                                <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#365332]">
                                    {fact.label}
                                </dt>
                                <dd className="mt-1 font-display text-xl uppercase leading-tight tracking-wider text-[#141714]">
                                    {fact.value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <section id="faq" aria-labelledby="bio-faq" className="scroll-mt-28 px-4 pt-6 sm:px-5">
                        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#365332]">
                            Asked and answered
                        </p>
                        <h2
                            id="bio-faq"
                            className="mt-1 font-display text-2xl uppercase leading-none tracking-wider text-[#141714]"
                        >
                            About {LOAF_MUZIK.name}
                        </h2>
                        <dl className="mt-3 space-y-3">
                            {LOAF_FAQ.map((entry) => (
                                <div
                                    key={entry.question}
                                    className="rounded-2xl border border-[#141714]/12 bg-[#FAF9F6] px-3.5 py-3"
                                >
                                    <dt className="font-display text-lg uppercase leading-tight tracking-wider text-[#141714]">
                                        {entry.question}
                                    </dt>
                                    <dd className="mt-1 text-sm leading-relaxed text-[#3E443B]">
                                        {entry.answer}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section aria-labelledby="bio-press" className="px-4 pt-6 sm:px-5">
                        <h2
                            id="bio-press"
                            className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#365332]"
                        >
                            In the press
                        </h2>
                        <ul className="mt-2 space-y-1.5">
                            {PRESS.map((article) => (
                                <li key={article.url} className="text-sm leading-snug text-[#3E443B]">
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#141714]">
                                        {article.outlet}
                                    </span>{" "}
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-4 hover:text-[#365332]"
                                    >
                                        {article.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className="mt-6 flex justify-center bg-[#141714] px-4 py-6 text-center">
                        <OnAirSign size="lg">
                            Live From The Dungeon
                            <span className="block">To The World</span>
                        </OnAirSign>
                    </div>
                </div>
            </div>
        </section>
    );
}
