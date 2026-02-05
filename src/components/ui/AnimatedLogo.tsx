"use client";

import Image from "next/image";

interface AnimatedLogoProps {
    className?: string;
    size?: number;
    rpm?: number; // Rotations per minute (33 or 45 typical for vinyl)
}

/**
 * Animated spinning vinyl logo
 * Uses CSS rotation for the vinyl disc on top of a static turntable
 */
export function AnimatedLogo({
    className = "",
    size = 64,
    rpm = 33
}: AnimatedLogoProps) {
    // Calculate animation duration from RPM (seconds per rotation)
    const duration = 60 / rpm;

    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Static turntable base */}
            <Image
                src="/turntable-base.png"
                alt="Loaf Records"
                fill
                className="object-contain"
                priority
            />

            {/* Spinning vinyl disc */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    // Position vinyl on the platter (adjust these values as needed)
                    top: '8%',
                    left: '5%',
                    right: '15%',
                    bottom: '12%',
                }}
            >
                <div
                    className="w-full h-full animate-spin"
                    style={{
                        animationDuration: `${duration}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                    }}
                >
                    <Image
                        src="/vinyl-disc.png"
                        alt=""
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
