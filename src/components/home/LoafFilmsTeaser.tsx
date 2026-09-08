"use client";

import { motion } from "framer-motion";
import { Camera, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LoafFilmsTeaser() {
    return (
        <section className="relative py-20 md:py-28 px-4 sm:px-6 overflow-hidden">
            {/* Cinematic gradient background */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(135deg, #050505 0%, #0a1628 30%, #0d0d1a 60%, #050505 100%)",
                }}
            />

            {/* Film grain texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                }}
            />

            {/* Ambient lens flare */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(0,217,255,0.08) 0%, transparent 60%)",
                }}
            />

            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center space-y-6"
                >
                    {/* Icon badge */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 mx-auto">
                        <Camera className="w-7 h-7 text-accent-cyan" />
                    </div>

                    {/* Tagline */}
                    <span className="block text-accent-cyan text-xs tracking-[0.4em] uppercase font-medium">
                        Video Production
                    </span>

                    {/* Headline */}
                    <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] uppercase leading-[0.95]">
                        LOAF{" "}
                        <span className="text-accent-cyan">FILMS</span>
                    </h2>

                    {/* Subtext */}
                    <p className="text-noir-cloud text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        Loaf Films crafts concept-driven music videos and commercial films
                        that reflect visual soul. Cinema-grade production packages starting
                        at <span className="text-foreground font-semibold">$1,500</span>.
                    </p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="pt-4"
                    >
                        <Link
                            href="/loaf-films"
                            className="inline-flex items-center gap-2.5 px-8 py-4 bg-accent-cyan text-noir-void font-bold rounded-xl shadow-lg shadow-accent-cyan/25 hover:shadow-accent-cyan/40 hover:scale-[1.02] transition-all text-sm uppercase tracking-wider"
                        >
                            <Camera className="w-5 h-5" />
                            View Packages & Book
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Package pills */}
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        {[
                            { name: "Bronze", price: "$1,500" },
                            { name: "Silver", price: "$3,000" },
                            { name: "Gold", price: "$6,000" },
                        ].map((pkg) => (
                            <span
                                key={pkg.name}
                                className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium tracking-wider text-noir-cloud"
                            >
                                {pkg.name}{" "}
                                <span className="text-foreground">{pkg.price}</span>
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
