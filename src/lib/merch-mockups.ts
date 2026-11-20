/**
 * Our own pictures for merch whose Printful previews show the side with no print.
 *
 * The Men's Commission box tee is printed on the front only (The Commission cover),
 * but Printful's previews for it are the blank backs, so the shop showed a plain shirt.
 * These are Printful mockup-generator renders of that cover at full print width on each
 * colour of the real blank: a flat front, and the same shirt worn.
 *
 * Keyed by Printful sync product id, then colour as Printful names it.
 */
interface ColorShots {
    front: string;
    worn: string;
}

const COMMISSION_TEE = "/shop-mockups/commission-box-tee";

const SHOTS: Record<number, Record<string, ColorShots>> = {
    401419855: {
        Black: { front: `${COMMISSION_TEE}/black-front.webp`, worn: `${COMMISSION_TEE}/black-worn.webp` },
        "Navy Blazer": { front: `${COMMISSION_TEE}/navy-blazer-front.webp`, worn: `${COMMISSION_TEE}/navy-blazer-worn.webp` },
        "Vintage Black": { front: `${COMMISSION_TEE}/vintage-black-front.webp`, worn: `${COMMISSION_TEE}/vintage-black-worn.webp` },
        "Vintage White": { front: `${COMMISSION_TEE}/vintage-white-front.webp`, worn: `${COMMISSION_TEE}/vintage-white-worn.webp` },
        White: { front: `${COMMISSION_TEE}/white-front.webp`, worn: `${COMMISSION_TEE}/white-worn.webp` },
    },
};

/** The printed front in this colour, when we have our own picture of it */
export function colorFront(productId: number, color: string | null | undefined): string | undefined {
    if (!color) return undefined;
    return SHOTS[productId]?.[color]?.front;
}

/** Every picture we have for the product: each colour's front, then each worn shot */
export function productGallery(productId: number): string[] | undefined {
    const shots = SHOTS[productId];
    if (!shots) return undefined;
    const colors = Object.values(shots);
    return [...colors.map((c) => c.front), ...colors.map((c) => c.worn)];
}
