"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Instagram,
    Youtube,
    ArrowUpRight,
    Disc3,
    Music2
} from "lucide-react";

// Custom Facebook icon (Lucide doesn't include one)
function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 7.834 7.834 0 0 0-.567-.01c-.69 0-1.18.093-1.544.298-.356.2-.594.474-.733.874-.13.382-.2.86-.2 1.467v1.342h3.266l-.391 1.69-.34 1.493-.455 1.484H13.27v7.98h-4.17z" />
        </svg>
    );
}
import Letter3DSwap from "@/components/fancy/text/letter-3d-swap";

const socialLinks = [
    { href: "https://instagram.com/loafrecords", icon: Instagram, label: "Instagram" },
    { href: "https://www.youtube.com/@LoafRecords", icon: Youtube, label: "YouTube" },
    { href: "https://www.facebook.com/loafrecords", icon: FacebookIcon, label: "Facebook" },
];

const navLinks = [
    { href: "/music", label: "Music" },
    { href: "/videos", label: "Videos" },
    { href: "/shop", label: "Shop" },
    { href: "/loaf-films", label: "Films" },
];

export function Footer() {
    const pathname = usePathname();

    // Home is the full-screen menu — no footer
    if (pathname === "/") return null;

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

                        {/* Social Links */}
                        <div className="flex items-center gap-4 mt-2">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-11 w-11 items-center justify-center -m-2 text-noir-ash hover:text-accent-cyan transition-colors"
                                    aria-label={link.label}
                                >
                                    <link.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 className="text-foreground font-semibold mb-4 uppercase tracking-wider text-sm">
                            Navigate
                        </h4>
                        <ul className="space-y-1">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex min-h-11 items-center text-noir-cloud hover:text-accent-cyan transition-colors"
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

                {/* Clearance so the floating player never parks on the last row */}
                <div aria-hidden className="h-24 sm:h-0" />
            </div>
        </footer>
    );
}
