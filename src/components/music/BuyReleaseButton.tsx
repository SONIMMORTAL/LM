"use client";

import { useState } from "react";
import { RELEASES, formatPrice, type ReleaseId, type ReleaseProduct } from "@/lib/releases";
import { ReleasePurchaseModal } from "@/components/music/ReleasePurchaseModal";

/** The buy button for a release, with its checkout, for pages that are otherwise server-rendered */
export function BuyReleaseButton({ releaseId, label }: { releaseId: ReleaseId; label: string }) {
    const release = RELEASES[releaseId];
    const [buying, setBuying] = useState<ReleaseProduct | null>(null);

    return (
        <>
            <button
                type="button"
                onClick={() => setBuying(release)}
                className="w-full rounded-2xl bg-[#141714] px-5 py-4 text-left text-white shadow-lg transition-transform active:scale-[0.99]"
            >
                <span className="block font-display text-2xl uppercase leading-none tracking-wide">{label}</span>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-white/75">
                    {release.price === undefined ? `Name your price · from ${formatPrice(release.minPrice)}` : formatPrice(release.minPrice)}
                </span>
            </button>
            <ReleasePurchaseModal release={buying} onClose={() => setBuying(null)} />
        </>
    );
}
