import { ShoppingBag } from "lucide-react";
import type { PrintfulProduct } from "@/lib/printful";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

interface ShopGridProps {
    products: PrintfulProduct[];
}

interface Collection {
    id: string;
    kicker: string;
    title: string;
    blurb: string;
    items: PrintfulProduct[];
    /** Card frame + kicker colour, from the landing's palette */
    frame: string;
    accent: string;
    glow: string;
}

export function ShopGrid({ products }: ShopGridProps) {
    // 1. Featured Drop (Lost City, Commission)
    const featuredDrop = products.filter((p) => {
        const name = p.name.toLowerCase();
        return name.includes("lost city") || name.includes("commission");
    });

    // 2. Best Sellers (Bear, Jeeps, Champion, Dungeon, Puffer, fleece, heavyweight)
    const bestSellers = products.filter((p) => {
        if (featuredDrop.includes(p)) return false;
        const name = p.name.toLowerCase();
        return (
            name.includes("bear") ||
            name.includes("jeep") ||
            name.includes("champion") ||
            name.includes("dungeon") ||
            name.includes("puffer") ||
            name.includes("shorts") ||
            name.includes("jacket") ||
            name.includes("fleece") ||
            name.includes("heavyweight")
        );
    });

    // 3. For The City (Everything else: Knowledge Born, More Life, Panther, etc.)
    const forTheCity = products.filter((p) => {
        return !featuredDrop.includes(p) && !bestSellers.includes(p);
    });

    const collections: Collection[] = [
        {
            id: "featured-drop",
            kicker: "New Arrival",
            title: "Featured Drop",
            blurb: "Limited quantities. Lost City and Commission drop.",
            items: featuredDrop,
            frame: "border-amber-400/40",
            accent: "text-amber-400",
            glow: "rgba(245, 158, 11, 0.2)",
        },
        {
            id: "best-sellers",
            kicker: "Customer Favorites",
            title: "Best Sellers",
            blurb: "Loaf Records essentials. Bear gear and heavyweight fleece.",
            items: bestSellers,
            frame: "border-accent-cyan/30",
            accent: "text-accent-cyan",
            glow: "rgba(0, 217, 255, 0.16)",
        },
        {
            id: "for-the-city",
            kicker: "Brooklyn Originals",
            title: "For The City",
            blurb: "Knowledge Born and More Life collectibles for the streets.",
            items: forTheCity,
            frame: "border-white/15",
            accent: "text-amber-300",
            glow: "rgba(245, 158, 11, 0.12)",
        },
    ].filter((c) => c.items.length > 0);

    return (
        <div className="px-3 sm:px-4 max-w-6xl mx-auto space-y-5">
            {/* Stamped jump tabs, like the landing's section pills */}
            {collections.length > 1 && (
                <nav
                    aria-label="Store collections"
                    className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar"
                >
                    {collections.map((c) => (
                        <a
                            key={c.id}
                            href={`#${c.id}`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-black/70 px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-noir-cloud transition-colors hover:border-amber-400/50 hover:text-amber-400"
                        >
                            {c.title}
                            <span className="text-amber-400/80">{c.items.length}</span>
                        </a>
                    ))}
                </nav>
            )}

            {collections.map((c) => (
                <section
                    key={c.id}
                    id={c.id}
                    aria-labelledby={`${c.id}-heading`}
                    className={cn(
                        "relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)]",
                        c.frame
                    )}
                >
                    {/* Ambient glow, as on the landing's chapters */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-full -translate-x-1/2"
                        style={{ background: `radial-gradient(circle at 50% 30%, ${c.glow} 0%, transparent 70%)` }}
                    />

                    <div className="relative flex items-end justify-between gap-3 border-b border-white/10 bg-black/60 p-4 sm:p-5">
                        <div className="min-w-0">
                            <p className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.26em]", c.accent)}>
                                {c.kicker}
                            </p>
                            <h2
                                id={`${c.id}-heading`}
                                className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-white"
                            >
                                {c.title}
                            </h2>
                            <p className="mt-1.5 text-xs text-noir-cloud">{c.blurb}</p>
                        </div>
                        <span className="shrink-0 rounded border border-white/15 bg-black/70 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/70">
                            {c.items.length} {c.items.length === 1 ? "Piece" : "Pieces"}
                        </span>
                    </div>

                    <div className="relative grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5 lg:grid-cols-4">
                        {c.items.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))}
                    </div>
                </section>
            ))}

            {products.length === 0 && (
                <div className="rounded-[28px] border-2 border-white/15 bg-[#0A0B10]/95 px-6 py-16 text-center">
                    <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-amber-400/70" />
                    <p className="font-display text-2xl uppercase tracking-wider text-white">No products found</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-noir-cloud">
                        Check back soon for the next drop
                    </p>
                </div>
            )}
        </div>
    );
}
