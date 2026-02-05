"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Custom hook for Lenis smooth scrolling
 * Provides fluid, inertia-based scroll behavior
 */
export function useLenis() {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.6,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.2,
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return lenisRef;
}
