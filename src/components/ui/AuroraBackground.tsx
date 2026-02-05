"use client";

import { ReactNode } from "react";

interface AuroraBackgroundProps {
    children: ReactNode;
    className?: string;
}

export function AuroraBackground({ children, className = "" }: AuroraBackgroundProps) {
    return (
        <div className={`relative w-full overflow-hidden bg-noir-void ${className}`}>

            {/* Aurora Blobs */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora-spin bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(0,255,204,0.1)_25%,transparent_50%,rgba(255,0,128,0.1)_75%,transparent_100%)] blur-[100px]" />
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-accent-cyan/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
