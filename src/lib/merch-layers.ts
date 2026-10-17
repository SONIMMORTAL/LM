/** The slice of a Printful product's details the merch break-apart reads. */
export interface MerchDetails {
    sync_variants?: {
        files?: { type: string; preview_url?: string | null }[];
    }[];
}

export interface MerchLayerArt {
    /** The design as it's printed on the garment */
    artwork?: string;
    /** Mockups of the garment in each colour it comes in, in store order */
    colorways: string[];
}

/**
 * Pulls the product's own art for the layers that fan out behind it: the print design and
 * the garment in its other colours. Variants repeat the same files once per size, so each
 * image is only taken once.
 */
export function merchLayerArt(details: MerchDetails | undefined): MerchLayerArt {
    let artwork: string | undefined;
    const colorways: string[] = [];

    for (const variant of details?.sync_variants ?? []) {
        for (const file of variant.files ?? []) {
            const url = file.preview_url;
            if (!url) continue;
            if (file.type === "default") artwork ??= url;
            else if (file.type === "preview" && !colorways.includes(url)) colorways.push(url);
        }
    }

    return { artwork, colorways };
}
