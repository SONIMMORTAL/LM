const SEEN = "hasSeenIntro";

/** Phones and tablets get the 720p cut, desktops the 1080p: the hero tape's phone test */
const PHONE_MEDIA = "(max-width: 1023px), (pointer: coarse)";
const PHONE_FILM = "/intro/loaf-intro-mobile.mp4";
const DESKTOP_FILM = "/intro/loaf-intro-desktop.mp4";

/** A skip fades out over this long */
const SKIP_MS = 350;
/** The natural end fades out over this long (matches introOut in globals.css) */
const OUT_MS = 600;
/** The film's length */
const FILM_MS = 10000;
/** Reduce Motion: the first frame holds this long, then goes */
const STILL_MS = 1800;
/** How long playback gets to start before the intro stops waiting on the video */
const START_MS = 3000;

/*
 * Runs during the HTML parse, before any of the page's JavaScript and before the first paint.
 * The intro only shows once this script has marked the page with intro-boot, which happens
 * only when someone arrives on the home page fresh — not when they tap over to it from another
 * page, and not with JavaScript off. Anyone who has seen it this visit is marked to skip it,
 * and the film isn't fetched for them at all.
 *
 * It starts the film itself (muted, so every browser allows it), and if React ever swaps the
 * <video> for a new one (Fast Refresh does in development) it picks the film up on the new one
 * where it left off. If a phone refuses to play (iPhones in Low Power Mode do) or it hasn't
 * started within START_MS, Safari still plays an MP4 through an <img>, so the film runs there;
 * anywhere else the intro steps aside. A tap, Escape, Enter or Space skips it, listened for on
 * the document so it holds before React is up.
 * Classes go on <html>, which the root layout marks suppressHydrationWarning.
 */
const BOOT = `(function () {
  var d = document.documentElement, c = d.classList;
  try { if (sessionStorage.getItem('${SEEN}')) { c.add('intro-seen'); return; } } catch (e) {}
  c.add('intro-boot');

  var v = null, over = 0, playing = 0, fell = 0, watch = 0;
  var film = matchMedia('${PHONE_MEDIA}').matches ? '${PHONE_FILM}' : '${DESKTOP_FILM}';
  function el(id) { return document.getElementById(id); }
  function done() {
    c.add('intro-done');
    try { sessionStorage.setItem('${SEEN}', 'true'); } catch (e) {}
    clearInterval(watch);
    document.removeEventListener('click', tap);
    document.removeEventListener('keydown', key);
    try { el('loaf-intro-film').pause(); } catch (e) {}
  }
  function end(k, ms) { if (over) return; over = 1; c.add(k); setTimeout(done, ms); }
  function skip() { end('intro-skip', ${SKIP_MS}); }
  function out(ms) { setTimeout(function () { end('intro-out', ${OUT_MS}); }, ms); }
  function tap(e) { if (e.target.closest && e.target.closest('#loaf-intro')) skip(); }
  function key(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip(); }
  document.addEventListener('click', tap);
  document.addEventListener('keydown', key);
  setTimeout(skip, ${START_MS + FILM_MS + 4000});
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { out(${STILL_MS}); return; }

  function fallback() {
    if (playing || fell || over) return;
    fell = 1;
    var s = el('loaf-intro-image');
    if (!s) { skip(); return; }
    s.onload = function () { c.add('intro-film'); out(${FILM_MS}); };
    s.onerror = skip;
    s.src = film;
  }
  function adopt() {
    var n = el('loaf-intro-film');
    if (!n || n === v || over) return;
    var t = v ? v.currentTime : 0;
    v = n;
    n.muted = true;
    n.addEventListener('playing', function () { if (playing || fell) return; playing = 1; out(${FILM_MS + 3000}); });
    n.addEventListener('ended', function () { end('intro-out', ${OUT_MS}); });
    if (t) try { n.currentTime = t; } catch (e) {}
    var p;
    try { p = n.play(); } catch (e) { fallback(); }
    // Removed from the page mid-start: the next tick adopts its replacement
    if (p && p.catch) p.catch(function (e) { if (!(e && e.name === 'AbortError')) fallback(); });
  }
  function tick() {
    if (!fell) { adopt(); return; }
    var s = el('loaf-intro-image');
    if (s && !s.getAttribute('src')) { s.onerror = skip; s.src = film; }
  }
  adopt();
  watch = setInterval(tick, 250);
  setTimeout(fallback, ${START_MS});
})();`;

/**
 * The opening: the crew runs in carrying the LOAF letters, hoists them overhead and heads off
 * down the block in a cloud of dust — a ten-second film, once per visit, on desktop and phones
 * alike. Phones get a lighter cut, and on a tall screen the film sits whole across the middle
 * on a backdrop the colour of its own sky, so nothing is cropped or faded out. A tap, a click
 * or a key skips it.
 */
export function LoafIntro() {
    return (
        <>
            <div id="loaf-intro" className="loaf-intro">
                {/* Not fetched until the boot script plays it; its first frame is painted underneath by CSS */}
                <video id="loaf-intro-film" className="loaf-intro__film" playsInline preload="none" disablePictureInPicture aria-hidden>
                    <source media={PHONE_MEDIA} src={PHONE_FILM} type="video/mp4" />
                    <source src={DESKTOP_FILM} type="video/mp4" />
                </video>
                {/* The same film for browsers that refuse to autoplay video but will animate an MP4 image */}
                {/* eslint-disable-next-line @next/next/no-img-element -- an MP4 source, which next/image can't serve */}
                <img id="loaf-intro-image" className="loaf-intro__film loaf-intro__film--image" alt="" />
                <p className="sr-only">Loaf Records: the crew carrying the LOAF letters down the block</p>
                <button type="button" className="loaf-intro__skip">
                    Skip intro
                </button>
            </div>
            <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        </>
    );
}
