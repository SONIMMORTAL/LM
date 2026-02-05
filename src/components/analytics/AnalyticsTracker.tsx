"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Track page view when route changes
        async function trackPageView() {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        page: pathname,
                        referrer: document.referrer || null,
                    }),
                });
            } catch (error) {
                // Silently fail - analytics should not break the app
                console.debug('Analytics tracking failed:', error);
            }
        }

        trackPageView();
    }, [pathname]);

    // This component renders nothing
    return null;
}
