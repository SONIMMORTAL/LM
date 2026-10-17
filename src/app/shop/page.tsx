import { Flame, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import { getPrintfulProducts } from "@/lib/printful";
import { ShopGrid } from "@/components/shop/ShopGrid";
import type { Metadata } from "next";

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Shop | Loaf Records — Official Merch",
    description: "Browse the official Loaf Records merch store. Limited edition apparel, vinyl, accessories, and more from Shadow The Great. Worldwide shipping.",
    openGraph: {
        images: [
            { url: "/og/og-default.jpg", width: 1200, height: 630, alt: "Loaf Records official merch" },
        ],
        title: "Shop | Loaf Records — Official Merch",
        description: "Limited edition apparel, vinyl, accessories, and more from Shadow The Great.",
        type: "website",
        siteName: "Loaf Records",
    },
    twitter: {
        images: ["/og/og-default.jpg"],
        card: "summary_large_image",
        title: "Shop | Loaf Records — Official Merch",
        description: "Limited edition apparel, vinyl, accessories, and more from Shadow The Great.",
    },
};

export default async function ShopPage() {
    // Fetch products from Printful (now cached and lightning fast)
    const products = await getPrintfulProducts();

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* ═══════════════════════════════════════════════════════════
                HERO — the same stamped monument as the mobile landing, kept
                short so the merch starts on the first screen
               ═══════════════════════════════════════════════════════════ */}
            <section className="px-3 sm:px-4 max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-[26px] border-2 border-amber-400/35 bg-[#0B0B0F] shadow-[0_28px_80px_rgba(0,0,0,0.95)]">
                    <div className="relative h-44 sm:h-60 w-full overflow-hidden">
                        <Image
                            src="/gallery/rooftop-throwies.jpg"
                            alt=""
                            fill
                            priority
                            sizes="(max-width: 1152px) 96vw, 1100px"
                            className="object-cover object-center opacity-80"
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/50 to-black/30"
                        />

                        {/* Stamped badge */}
                        <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/50 bg-black/85 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">
                                <Flame className="h-3 w-3 fill-amber-400" />
                                Official Merch
                            </span>
                        </div>

                        {/* Loaf Man stamp */}
                        <div className="pointer-events-none absolute -bottom-2 right-2 h-24 w-24 sm:h-32 sm:w-32 drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]">
                            <Image src="/loafman.png" alt="" fill sizes="128px" className="object-contain" priority />
                        </div>

                        <div className="absolute bottom-3 left-4 right-28">
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400">
                                Loaf Records · Brooklyn NY
                            </p>
                            <h1
                                className="font-display uppercase leading-[0.86] tracking-[0.02em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                                style={{ fontSize: "clamp(2.75rem, 13vw, 4.5rem)" }}
                            >
                                The{" "}
                                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-accent-cyan bg-clip-text text-transparent">
                                    Drop
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Stamped ticker */}
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar border-t border-amber-400/20 bg-black/90 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em]">
                        <span className="shrink-0 font-bold text-amber-400">Limited Edition:</span>
                        <span className="shrink-0 text-white/85">Raw Aesthetics</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="shrink-0 text-white/85">Wear The Movement</span>
                    </div>
                </div>
            </section>

            {/* Products */}
            <div className="mt-4">
                <ShopGrid products={products} />
            </div>

            {/* Trust strip */}
            <section className="px-3 sm:px-4 max-w-6xl mx-auto mt-5">
                <ul className="grid grid-cols-3 gap-2">
                    {[
                        { icon: ShieldCheck, label: "100% Official" },
                        { icon: Sparkles, label: "Premium Quality" },
                        { icon: Truck, label: "Ships Worldwide" },
                    ].map((badge) => (
                        <li
                            key={badge.label}
                            className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/15 bg-black/70 px-2 py-3 text-center sm:flex-row sm:justify-center sm:gap-2"
                        >
                            <badge.icon className="h-4 w-4 shrink-0 text-amber-400" />
                            <span className="font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-white/85">
                                {badge.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
