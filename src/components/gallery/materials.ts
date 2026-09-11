import { Permanent_Marker } from "next/font/google";

/**
 * What the gallery is made of — shared by the wall, the book and the viewer, so
 * a print looks like the same print wherever you run into it.
 */

/** The marker hand for anything written on the wall or in the book. */
export const marker = Permanent_Marker({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
});

/** A torn length of masking tape. Where it sits and its angle are set per use. */
export const TAPE =
    "pointer-events-none absolute z-10 bg-[#d9ceb0]/85 shadow-[0_1px_2px_rgba(0,0,0,0.35)] [clip-path:polygon(3%_0,97%_6%,100%_45%,96%_100%,4%_94%,0_55%)]";

/** Fine grit, for paper and for paint rolled over block. */
export const GRIT =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const pad2 = (n: number) => String(n).padStart(2, "0");
