/**
 * The welcome track — the song that greets a visitor when the site first boots.
 *
 * The page that wants it (the mobile landing) and the thing that plays it (the
 * global MusicPlayer, which is dynamically imported and mounts *after* the
 * page) don't load in a predictable order, so the request is parked here until
 * the player is ready to pick it up.
 *
 * It only ever fires once per full page load: navigating away and back must
 * never restart it over whatever the visitor has since chosen to play.
 */

const REQUEST_EVENT = "loaf:welcome-track";

let pendingTitle: string | null = null;
let consumed = false;

/** Ask for `title` to start playing as the site's welcome. No-op after the first time. */
export function requestWelcomeTrack(title: string) {
    if (typeof window === "undefined" || consumed) return;
    pendingTitle = title;
    window.dispatchEvent(new CustomEvent(REQUEST_EVENT));
}

/** Claim the pending request, if any. Returns the title once, then null forever. */
export function takeWelcomeRequest(): string | null {
    if (consumed || !pendingTitle) return null;
    consumed = true;
    const title = pendingTitle;
    pendingTitle = null;
    return title;
}

/** Be told when a welcome request arrives. Returns an unsubscribe function. */
export function onWelcomeRequest(handler: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(REQUEST_EVENT, handler);
    return () => window.removeEventListener(REQUEST_EVENT, handler);
}
