import Image from "next/image";

/**
 * Clean White + Tiger-Stripe Camo canvas backdrop framing content pages (`/bio`,
 * `/loaf-films`, `/artists/*`) so every page matches Loaf Records' white & tiger-camo aesthetic.
 */
export function StreetBackdrop({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative isolate overflow-hidden bg-[#FAF9F6] text-[#141714] selection:bg-[#365332] selection:text-white">
            {/* Soft washed tiger-stripe camo wallpaper */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="tiger-camo-strip absolute inset-0 opacity-[0.14]" />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 90% 70% at 50% 12%, rgba(255,255,255,0.78) 0%, rgba(250,249,246,0.92) 70%, #FAF9F6 100%)",
                    }}
                />
                {/* Faint top studio watermark */}
                <div className="relative mx-auto h-[520px] max-w-6xl opacity-[0.06]">
                    <Image
                        src="/brand/dungeon-studio-4k.webp"
                        alt=""
                        fill
                        sizes="50vw"
                        quality={70}
                        className="object-cover object-top"
                    />
                </div>
            </div>
            {children}
        </div>
    );
}
