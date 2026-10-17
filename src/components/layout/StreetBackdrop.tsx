import Image from "next/image";

/**
 * The mobile landing's street atmosphere — brick dungeon mural, amber halftone,
 * noir vignette — for the pages you reach from it (Store, Loaf Films), so tapping
 * through feels like the same place. Painted as page backgrounds rather than a
 * fixed layer, so nothing repaints on scroll.
 */
export function StreetBackdrop({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative isolate overflow-hidden bg-[#060608] text-[#F5F5F7] selection:bg-amber-400 selection:text-black">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[110vh]">
                {/* Brick dungeon mural watermark */}
                <Image
                    src="/ChatGPT Image Jul 12, 2026, 11_17_09 PM.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-top opacity-[0.16]"
                />
                {/* Noir vignette, fading the mural out into the page */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 95% 70% at 50% 15%, rgba(245,158,11,0.12) 0%, rgba(6,6,8,0.88) 55%, #060608 100%)",
                    }}
                />
            </div>
            {/* Halftone dot & street grain, all the way down */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
                style={{
                    backgroundImage: "radial-gradient(rgba(245, 158, 11, 0.22) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                }}
            />
            {children}
        </div>
    );
}
