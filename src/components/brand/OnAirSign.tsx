import { cn } from "@/lib/utils";

// Red neon: a hot pale core with the glow falling off around it
const NEON = "0 0 4px #ff3b3b, 0 0 10px rgba(255,40,40,0.8), 0 0 22px rgba(255,30,30,0.5)";

interface OnAirSignProps {
    children: React.ReactNode;
    size?: "sm" | "lg";
    className?: string;
}

/**
 * The on-air lightbox from over the studio door: red neon lettering in a dark glass
 * box, the REC light blinking. Wherever the site says "Live from the Dungeon", it's lit like this.
 */
export function OnAirSign({ children, size = "sm", className }: OnAirSignProps) {
    const lg = size === "lg";

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md border border-red-500/70 bg-[#1a0606]/85 shadow-[0_0_14px_rgba(255,45,45,0.45),inset_0_0_10px_rgba(255,45,45,0.25)]",
                lg ? "gap-3 px-4 py-3" : "gap-2 px-2.5 py-1.5",
                className
            )}
        >
            <span aria-hidden className={cn("relative flex shrink-0", lg ? "h-2.5 w-2.5" : "h-2 w-2")}>
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-full w-full rounded-full bg-red-500" />
            </span>
            <span
                className={cn(
                    "font-display uppercase text-[#FFE1E1]",
                    lg ? "text-[22px] sm:text-[26px] leading-[1.05] tracking-[0.12em]" : "text-[15px] leading-none tracking-[0.14em]"
                )}
                style={{ textShadow: NEON }}
            >
                {children}
            </span>
        </span>
    );
}
