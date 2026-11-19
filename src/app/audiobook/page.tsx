import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Disc3 } from "lucide-react";
import { StreetBackdrop } from "@/components/layout/StreetBackdrop";
import { BuyReleaseButton } from "@/components/music/BuyReleaseButton";
import { AUDIOBOOK_CHAPTERS, RELEASES, formatPrice } from "@/lib/releases";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, WEBSITE_ID, breadcrumbNode, jsonLd } from "@/lib/structured-data";

const book = RELEASES["god-is-good-audiobook"];
const album = RELEASES["god-is-good"];

const TITLE = "God Is Good Audio Book | Loaf Records";
const DESCRIPTION = `The God Is Good Audio Book, a Loaf Records publication: ${AUDIOBOOK_CHAPTERS.length} chapters, from ${AUDIOBOOK_CHAPTERS[0]} to ${AUDIOBOOK_CHAPTERS[AUDIOBOOK_CHAPTERS.length - 1]}. ${formatPrice(book.minPrice)}, sent to your email.`;

export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: book.path },
    openGraph: {
        url: book.path,
        title: TITLE,
        description: DESCRIPTION,
        type: "book",
        siteName: "Loaf Records",
        images: [{ url: book.cover, width: 1024, height: 1536, alt: "God Is Good Audio Book cover" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [book.cover] },
};

const structuredData = jsonLd([
    {
        "@type": "Audiobook",
        "@id": absoluteUrl(`${book.path}#audiobook`),
        name: "God Is Good",
        url: absoluteUrl(book.path),
        image: absoluteUrl(book.cover),
        publisher: { "@id": ORGANIZATION_ID },
        isPartOf: { "@id": WEBSITE_ID },
        numberOfChapters: AUDIOBOOK_CHAPTERS.length,
        hasPart: AUDIOBOOK_CHAPTERS.map((chapter, index) => ({ "@type": "Chapter", name: chapter, position: index + 1 })),
        offers: {
            "@type": "Offer",
            price: book.minPrice,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(book.path),
        },
    },
    breadcrumbNode([
        { name: "Home", path: "/" },
        { name: "Music", path: "/music" },
        { name: "God Is Good Audio Book", path: book.path },
    ]),
]);

/** The God Is Good Audio Book: its cover, its chapters, $25, sent by email after payment */
export default function AudiobookPage() {
    return (
        <StreetBackdrop>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
            <div className="min-h-screen px-4 pb-24 pt-24 sm:px-6">
                <div className="mx-auto max-w-5xl">
                    <Link href="/music" className="mb-6 inline-flex items-center gap-2 text-sm text-[#61675E] hover:text-[#141714]">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Music
                    </Link>

                    <div className="overflow-hidden rounded-3xl border-2 border-[#141714] bg-white shadow-[0_24px_60px_rgba(20,23,20,0.12)]">
                        <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                        <div className="grid md:grid-cols-12">
                            <div className="space-y-6 p-5 sm:p-8 md:col-span-5">
                                <div className="relative mx-auto aspect-[2/3] w-full max-w-xs overflow-hidden rounded-xl border-2 border-[#141714]/15 shadow-xl">
                                    <Image
                                        src={book.cover}
                                        alt="God Is Good Audio Book: two men in front of the Brooklyn Bridge, a Loaf Records publication"
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 80vw, 320px"
                                        className="object-cover"
                                    />
                                </div>
                                <BuyReleaseButton releaseId={book.id} label="Get the audio book" />
                                <p className="text-center text-xs text-[#61675E]">Shadow emails the files to you once your payment is in.</p>
                            </div>

                            <div className="border-t-2 border-[#141714]/10 p-5 sm:p-8 md:col-span-7 md:border-l-2 md:border-t-0">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#9B2C1F]">
                                    Audio book · A Loaf Records publication
                                </p>
                                <h1 className="mt-1 font-display text-5xl uppercase leading-[0.9] tracking-wide text-[#141714] sm:text-6xl">God Is Good</h1>
                                <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-[#61675E]">
                                    {AUDIOBOOK_CHAPTERS.length} chapters · {formatPrice(book.minPrice)}
                                </p>

                                <h2 className="mb-3 mt-8 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#61675E]">Chapters</h2>
                                <ol className="divide-y-2 divide-[#141714]/5">
                                    {AUDIOBOOK_CHAPTERS.map((chapter, index) => (
                                        <li key={chapter} className="flex items-baseline gap-4 py-3">
                                            <span className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-[#61675E]">
                                                Ch. {index + 1}
                                            </span>
                                            <span className="font-semibold text-[#141714]">{chapter}</span>
                                        </li>
                                    ))}
                                </ol>

                                <Link
                                    href={album.path}
                                    className="mt-8 flex items-center gap-3 rounded-2xl border-2 border-[#141714]/15 bg-[#FAF9F6] p-3 hover:border-[#365332]"
                                >
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                                        <Image src={album.cover} alt="" fill sizes="56px" className="object-cover" />
                                    </div>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#61675E]">
                                            <Disc3 className="h-3.5 w-3.5" /> The album
                                        </span>
                                        <span className="block font-display text-xl uppercase leading-tight">God Is Good</span>
                                        <span className="block text-sm text-[#3E443B]">19 tracks · hear previews · name your price</span>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StreetBackdrop>
    );
}
