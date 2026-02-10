"use client";

import { useEffect, useRef } from "react";

interface MatrixRainProps {
    color?: string;
    fontSize?: number;
    speed?: number;
    className?: string;
}

export function MatrixRain({
    color = "#22d3ee",
    fontSize = 14,
    speed = 1,
    className = ""
}: MatrixRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };

        // Initial resize
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Matrix characters (Katakana + Latin)
        const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポvu0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const charArray = chars.split("");

        // Columns
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = [];

        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100; // Start at random positions above
        }

        // Animation loop
        let animationId: number;
        let lastTime = 0;
        const interval = 33 / speed; // Control speed (approx 30fps base)

        const draw = (currentTime: number) => {
            if (currentTime - lastTime < interval) {
                animationId = requestAnimationFrame(draw);
                return;
            }
            lastTime = currentTime;

            // Semi-transparent black clear for trail effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = color;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const text = charArray[Math.floor(Math.random() * charArray.length)];

                // Draw character
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Reset drop if it goes off screen (randomly)
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                // Move drop
                drops[i]++;
            }

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [color, fontSize, speed]);

    return (
        <div ref={containerRef} className={`absolute inset-0 bg-black ${className}`}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
