"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Instagram,
    Youtube,
    Music2,
    ArrowUpRight,
    Disc3
} from "lucide-react";
import Letter3DSwap from "@/components/fancy/text/letter-3d-swap";

const socialLinks = [
    { href: "https://instagram.com/loafrecords", icon: Instagram, label: "Instagram" },
    { href: "https://www.youtube.com/@LoafRecords", icon: Youtube, label: "YouTube" },
    { href: "https://www.facebook.com/loafrecords", icon: Music2, label: "Facebook" },
];

const navLinks = [
    { href: "/music", label: "Music" },
    { href: "/videos", label: "Videos" },
    { href: "/shop", label: "Shop" },
    { href: "/forum", label: "Forum" },
    { href: "/stoop", label: "The Stoop" },
    { href: "/contact", label: "Contact" },
];

export function Footer() {
    return (
        <footer className="relative border-t border-noir-smoke bg-noir-void">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-noir-charcoal/50 to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 safe-bottom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-4">
                            <Letter3DSwap
                                mainClassName="text-2xl font-bold tracking-tight uppercase"
                                frontFaceClassName="text-foreground"
                                secondFaceClassName="text-accent-cyan"
                                rotateDirection="top"
                                staggerDuration={0.03}
                                staggerFrom="first"
                                transition={{ type: "spring", damping: 25, stiffness: 160 }}
                                loop={true}
                                loopDelay={5000}
                            >
                                LOAF RECORDS
                            </Letter3DSwap>
                        </Link>


                        {/* Social Links - REMOVED */}
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 className="text-foreground font-semibold mb-4 uppercase tracking-wider text-sm">
                            Navigate
                        </h4>
                        <ul className="space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-noir-cloud hover:text-accent-cyan transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Music & Shop Column */}
                    <div>
                        <h4 className="text-foreground font-semibold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                            <Music2 className="w-4 h-4 text-accent-cyan" />
                            Listen
                        </h4>
                        <Link
                            href="/music"
                            className="inline-flex items-center gap-2 text-noir-cloud hover:text-accent-cyan transition-colors font-medium group"
                        >
                            Stream the catalog
                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        {/* Official Store Link */}
                        <div className="mt-6 pt-4 border-t border-noir-smoke">
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyanMuted transition-colors font-medium"
                            >
                                VISIT SHOP
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-noir-smoke flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-noir-ash text-sm">
                        © {new Date().getFullYear()} Loaf Records. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                        <a href="/contact" className="text-noir-cloud hover:text-accent-cyan transition-colors">
                            Contact
                        </a>
                        <span className="text-noir-smoke">•</span>
                        <span className="text-noir-cloud">
                            Brooklyn, NY
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
