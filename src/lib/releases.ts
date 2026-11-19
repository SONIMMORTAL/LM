/**
 * The releases sold through the site and delivered by hand: God Is Good, the album, and the
 * God Is Good Audio Book. When one sells, Shadow gets a NEW SALE email with who bought it and
 * sends them the files himself (the email service can't send downloads to buyers yet).
 *
 * The price is checked here, on the server, for every order: the album is name-your-price
 * with a floor, the audio book a fixed price.
 */

export type ReleaseId = "god-is-good" | "god-is-good-audiobook";

export interface ReleaseProduct {
    id: ReleaseId;
    name: string;
    /** What it is, as the order and the emails call it */
    kind: "Digital Album" | "Audio Book";
    by: string;
    cover: string;
    /** The page that sells it */
    path: string;
    /** The least it sells for, in dollars */
    minPrice: number;
    /** Set for a fixed price; left out for name-your-price */
    price?: number;
    /** What Shadow sends the buyer */
    deliverable: string;
}

export const RELEASES: Record<ReleaseId, ReleaseProduct> = {
    "god-is-good": {
        id: "god-is-good",
        name: "God Is Good",
        kind: "Digital Album",
        by: "Shadow The Great",
        cover: "/god-is-good-cover.jpg",
        path: "/music/god-is-good",
        minPrice: 10,
        deliverable: "the GOD IS GOOD zip (all 19 tracks)",
    },
    "god-is-good-audiobook": {
        id: "god-is-good-audiobook",
        name: "God Is Good Audio Book",
        kind: "Audio Book",
        by: "Loaf Records",
        cover: "/god-is-good-audiobook-cover.jpg",
        path: "/audiobook",
        minPrice: 25,
        price: 25,
        deliverable: "the Audio Book zip (all 12 chapters)",
    },
};

/** The Audio Book's chapters, in order */
export const AUDIOBOOK_CHAPTERS = [
    "Desperado",
    "Lost City",
    "Jeeps",
    "Gems",
    "Plot",
    "The Lost Tape",
    "Rasclaat",
    "Crunch Time",
    "Archie Story",
    "Watch This",
    "Save the People",
    "The Essence",
];

/** The most anyone can name for the album in one order: a sanity cap, not a price */
export const MAX_PRICE = 100_000;

export function releaseById(id: unknown): ReleaseProduct | undefined {
    return typeof id === "string" && Object.hasOwn(RELEASES, id) ? RELEASES[id as ReleaseId] : undefined;
}

/**
 * The amount to charge for an order, or why it can't go through. A fixed price ignores what
 * was asked; name-your-price takes the buyer's amount, to the cent, from the floor up.
 */
export function chargeFor(release: ReleaseProduct, requested?: unknown): { amount: number } | { error: string } {
    if (release.price !== undefined) return { amount: release.price };

    const amount = typeof requested === "string" ? Number(requested) : requested;
    if (typeof amount !== "number" || !Number.isFinite(amount)) return { error: "Enter an amount" };
    const cents = Math.round(amount * 100);
    if (Math.abs(cents - amount * 100) > 1e-6) return { error: "Use dollars and cents, like 10 or 12.50" };
    if (cents < release.minPrice * 100) return { error: `The least you can pay is $${release.minPrice}` };
    if (cents > MAX_PRICE * 100) return { error: `For more than $${MAX_PRICE.toLocaleString("en-US")}, get in touch` };
    return { amount: cents / 100 };
}

/** "$10.00" */
export function formatPrice(amount: number): string {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type SaleMethod = "PayPal" | "Cash App";

export interface Sale {
    release: ReleaseProduct;
    buyerName: string;
    buyerEmail: string;
    amount: number;
    method: SaleMethod;
    /** PayPal's capture ID, or what the buyer gave for their Cash App payment */
    reference: string;
    /** Whether the payment is confirmed (PayPal) or only claimed (Cash App, until Shadow checks) */
    confirmed: boolean;
}

export const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const escape = escapeHtml;

/** The buyer's name and email, tidied, or what's wrong with them */
export function checkBuyer(name: unknown, email: unknown): { name: string; email: string } | { error: string } {
    const cleanName = typeof name === "string" ? name.replace(/\s+/g, " ").trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (cleanName.length < 2 || cleanName.length > 80) return { error: "Enter your name" };
    if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(cleanEmail) || cleanEmail.length > 200) {
        return { error: "Enter a valid email so Shadow can send your files" };
    }
    return { name: cleanName, email: cleanEmail };
}

/**
 * The NEW SALE email to Shadow: who bought what, for how much, how they paid, and a reply
 * link already addressed to the buyer so sending the files is one tap.
 */
export function newSaleEmail(sale: Sale): { subject: string; html: string; text: string } {
    const { release, buyerName, buyerEmail, amount, method, reference, confirmed } = sale;
    const price = formatPrice(amount);
    const subject = `NEW SALE! ${release.name} — ${price} from ${buyerName}`;
    const replySubject = `Your ${release.name} download`;
    const replyBody = `Hey ${buyerName},\n\nThank you for picking up ${release.name}! Here are your files:\n\n[paste the download link here]\n\nLoaf Records`;
    const reply = `mailto:${encodeURIComponent(buyerEmail)}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
    const check = confirmed
        ? `PayPal confirmed the payment.`
        : `Check that ${price} arrived in Cash App (${reference}) before sending — Cash App payments aren't confirmed automatically.`;

    const text = [
        "NEW SALE!",
        "",
        `${release.name} (${release.kind}) — ${price}`,
        `Buyer: ${buyerName}`,
        `Email: ${buyerEmail}`,
        `Paid with: ${method} (${reference})`,
        "",
        check,
        `Send ${release.deliverable} to ${buyerEmail}.`,
    ].join("\n");

    const row = (label: string, value: string) =>
        `<tr><td style="padding:8px 0;color:#61675E;font:600 12px monospace;text-transform:uppercase;letter-spacing:.12em;width:110px">${label}</td><td style="padding:8px 0;color:#141714;font:16px sans-serif">${value}</td></tr>`;

    const html = `<!doctype html><html><body style="margin:0;background:#FAF9F6;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fff;border:2px solid #141714;border-radius:16px;overflow:hidden">
  <div style="background:#141714;color:#fff;padding:20px 24px;font:900 28px sans-serif;letter-spacing:.04em">NEW SALE!</div>
  <div style="padding:20px 24px">
    <p style="margin:0 0 4px;font:700 20px sans-serif;color:#141714">${escape(release.name)}</p>
    <p style="margin:0 0 16px;font:14px sans-serif;color:#61675E">${release.kind} · ${price}</p>
    <table style="border-collapse:collapse;width:100%">
      ${row("Buyer", escape(buyerName))}
      ${row("Email", `<a href="mailto:${escape(buyerEmail)}" style="color:#365332">${escape(buyerEmail)}</a>`)}
      ${row("Paid with", `${method} · ${escape(reference)}`)}
    </table>
    <p style="margin:16px 0;padding:12px 14px;border-radius:10px;font:14px sans-serif;${confirmed ? "background:#EAF2E8;color:#365332" : "background:#FFF4E5;color:#7A4A00"}">${escape(check)}</p>
    <p style="margin:0 0 16px;font:15px sans-serif;color:#141714">Send ${escape(release.deliverable)} to <strong>${escape(buyerEmail)}</strong>.</p>
    <a href="${reply}" style="display:inline-block;background:#141714;color:#fff;text-decoration:none;font:700 14px sans-serif;padding:12px 18px;border-radius:10px">Reply to ${escape(buyerName)} with the files</a>
  </div>
</div></body></html>`;

    return { subject, html, text };
}
