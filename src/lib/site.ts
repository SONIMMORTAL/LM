/**
 * Canonical site origin, used for metadataBase, canonical URLs, the sitemap,
 * robots.txt and every JSON-LD `url` field.
 *
 * Keep this as the single source of truth. Structured data previously pointed
 * at loafrecords.com while metadataBase, robots.txt and the sitemap pointed at
 * loafrecords.shop, which tells search engines two different canonical homes
 * for the same pages. Change it here and everything follows.
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL (no trailing slash).
 */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://loafrecords.shop"
).replace(/\/$/, "");

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
