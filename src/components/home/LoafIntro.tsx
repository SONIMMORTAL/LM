"use client";

import { useEffect } from "react";
import Image from "next/image";

const ART = "/brand/loaf-intro.webp";
const SEEN = "hasSeenIntro";

/** A skip fades out over this long */
const SKIP_MS = 350;

/** The full run, in ms: matches the CSS timeline in globals.css (the overlay is gone by 5.6s) */
const RUN_MS = 5600;
/** Reduce Motion: the art fades in, holds, and goes */
const STILL_MS = 2300;

/*
 * Runs during the HTML parse, before any of the page's JavaScript and before the first paint.
 * The intro only shows once this script has marked the page with intro-boot, which happens
 * only when someone arrives on the home page fresh — not when they tap over to it from another
 * page, and not with JavaScript off. Anyone who has seen it this visit is marked to skip it.
 * The run starts the moment the art has loaded (or after 2.5s, whatever happens to the image),
 * and a tap skips it straight away, even on a slow phone that hasn't finished loading the page
 * (listened for on the document, so it holds even if React swaps the overlay's element).
 * Classes go on <html>, which the root layout marks suppressHydrationWarning.
 */
const BOOT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('${SEEN}')){d.classList.add('intro-seen');return}}catch(e){}d.classList.add('intro-boot');var i=document.getElementById('loaf-intro-art'),g=function(){d.classList.add('intro-go')};if(!i||i.complete)g();else{i.addEventListener('load',g);i.addEventListener('error',g);setTimeout(g,2500)}document.addEventListener('click',function k(e){if(!e.target.closest||!e.target.closest('#loaf-intro'))return;document.removeEventListener('click',k);d.classList.add('intro-skip');setTimeout(function(){d.classList.add('intro-done');try{sessionStorage.setItem('${SEEN}','true')}catch(e){}},${SKIP_MS})})})();`;

/**
 * The opening: a blank white screen, then the crew runs in from the left carrying the LOAF
 * letters, skids to a stop in the middle in a kick of dust, and the camera eases in on them
 * before the site comes up. About five and a half seconds, once per visit, on desktop and
 * phones alike.
 *
 * It's drawn with CSS on top of the server HTML rather than played as a video, so it shows
 * from the first paint and no phone can hold it back the way some hold back video autoplay.
 * A tap, a click or a key skips it.
 */
export function LoafIntro() {
    useEffect(() => {
        const root = document.documentElement;
        // Not showing: they've seen it, or came to home from another page
        if (!root.classList.contains("intro-boot") || root.classList.contains("intro-seen") || root.classList.contains("intro-done")) {
            return;
        }

        const finish = () => {
            root.classList.add("intro-done");
            try {
                sessionStorage.setItem(SEEN, "true");
            } catch {
                // Private browsing: it simply plays again next visit
            }
            cleanup();
        };

        const skip = () => {
            root.classList.add("intro-skip");
            window.clearTimeout(done);
            done = window.setTimeout(finish, SKIP_MS);
        };
        const onKey = (e: KeyboardEvent) => {
            if (["Escape", "Enter", " ", "Spacebar"].includes(e.key)) skip();
        };

        // Counted from when the run actually starts, which waits on the art
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let done = 0;
        const startClock = () => {
            window.clearTimeout(done);
            done = window.setTimeout(finish, still ? STILL_MS : RUN_MS);
        };
        const watch = new MutationObserver(() => {
            if (root.classList.contains("intro-go")) {
                watch.disconnect();
                startClock();
            }
        });
        if (root.classList.contains("intro-go")) startClock();
        else watch.observe(root, { attributes: true, attributeFilter: ["class"] });
        // Never strand anyone behind it
        const ceiling = window.setTimeout(finish, RUN_MS + 4000);

        // Taps are the boot script's; the keyboard is handled here
        window.addEventListener("keydown", onKey);

        function cleanup() {
            watch.disconnect();
            window.clearTimeout(done);
            window.clearTimeout(ceiling);
            window.removeEventListener("keydown", onKey);
        }
        return cleanup;
    }, []);

    return (
        <>
            <div id="loaf-intro" className="loaf-intro">
                <div className="loaf-intro__stage">
                    <div className="loaf-intro__run">
                        <span aria-hidden className="loaf-intro__lines">
                            <span />
                            <span />
                            <span />
                        </span>
                        <div className="loaf-intro__bob">
                            {/* Preloaded; the boot script finds it by id to start the run once it's in */}
                            <Image
                                id="loaf-intro-art"
                                src={ART}
                                width={1600}
                                height={654}
                                priority
                                sizes="(max-width: 1170px) 94vw, 1100px"
                                alt="Loaf Records: the crew running with the LOAF letters on their backs"
                                draggable={false}
                            />
                        </div>
                        <span aria-hidden className="loaf-intro__dust">
                            <span />
                            <span />
                            <span />
                        </span>
                    </div>
                    <p aria-hidden className="loaf-intro__label">
                        Loaf Records · Brooklyn, NY
                    </p>
                </div>
                <button type="button" className="loaf-intro__skip">
                    Skip intro
                </button>
            </div>
            <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        </>
    );
}
