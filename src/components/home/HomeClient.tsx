"use client";

import { useState, useSyncExternalStore } from "react";
import { IntroVideo } from "@/components/home/IntroVideo";
import dynamic from "next/dynamic";

import { MobileStudioLanding } from "@/components/home/MobileStudioLanding";
import type { Track } from "@/lib/tracks-server";
import type { ChannelUpload } from "@/lib/youtube-feed";

const DungeonMenu = dynamic(() => import("@/components/home/DungeonMenu").then(mod => mod.DungeonMenu));

function subscribeToMobileViewport(onChange: () => void) {
    const mqWidth = window.matchMedia("(max-width: 1023px)");
    const mqTouch = window.matchMedia("(pointer: coarse)");
    mqWidth.addEventListener("change", onChange);
    mqTouch.addEventListener("change", onChange);
    return () => {
        mqWidth.removeEventListener("change", onChange);
        mqTouch.removeEventListener("change", onChange);
    };
}

function readIsMobileViewport() {
    return (
        window.matchMedia("(max-width: 1023px)").matches ||
        window.matchMedia("(pointer: coarse)").matches
    );
}

const isMobileOnServer = () => true;

interface HomeClientProps {
    initialTracks?: Track[];
    /** The newest upload on the Loaf Records YouTube channel */
    newRelease?: ChannelUpload;
}

export default function HomeClient({
    initialTracks = [],
    newRelease,
}: HomeClientProps) {
    const isMobileViewport = useSyncExternalStore(
        subscribeToMobileViewport,
        readIsMobileViewport,
        isMobileOnServer
    );

    const [viewOverride, setViewOverride] = useState<"studio" | "room" | null>(null);

    const activeExperience =
        viewOverride !== null ? viewOverride : isMobileViewport ? "studio" : "room";

    return (
        <div className="relative">
            <IntroVideo />

            {/* BESPOKE MOBILE 3D STUDIO LANDING vs DESKTOP 3D CRATE ROOM */}
            {activeExperience === "studio" ? (
                <MobileStudioLanding
                    tracks={initialTracks}
                    newRelease={newRelease}
                    onSwitchToRoom={() => setViewOverride("room")}
                />
            ) : (
                <DungeonMenu onSwitchToStudio={() => setViewOverride("studio")} />
            )}
        </div>
    );
}
