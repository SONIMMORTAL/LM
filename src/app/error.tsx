"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-noir-void px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md"
            >
                <div className="text-accent-cyan text-sm tracking-[0.2em] uppercase font-bold mb-4">
                    System Error
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-6">
                    Signal Lost
                </h1>
                <p className="text-noir-ash mb-10">
                    We encountered an unexpected error. Please try again or return to the home page.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto px-8 py-3 bg-accent-cyan text-noir-void font-bold uppercase text-sm tracking-wider hover:bg-accent-cyanMuted transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-3 border border-noir-smoke text-foreground hover:border-accent-cyan transition-colors font-medium uppercase text-sm tracking-wider"
                    >
                        Return Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
