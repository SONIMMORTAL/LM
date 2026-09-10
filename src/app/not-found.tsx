import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found",
    description: "That page does not exist. Head back to Loaf Records.",
    robots: { index: false, follow: true },
};

const LINKS = [
    { href: "/music", label: "Music" },
    { href: "/videos", label: "Videos" },
    { href: "/shop", label: "Shop" },
    { href: "/loaf-films", label: "Films" },
];

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center">
            <p className="text-accent-cyan text-xs sm:text-sm tracking-[0.35em] uppercase font-mono mb-6">
                Error 404
            </p>

            <h1 className="font-druk text-6xl sm:text-7xl md:text-8xl uppercase tracking-tight text-noir-snow mb-5">
                Off The Record
            </h1>

            <p className="text-noir-cloud max-w-md mb-10 text-balance">
                We could not find that page. It may have moved, or the link may be
                wrong.
            </p>

            <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-6 py-3 text-sm font-mono uppercase tracking-wider text-accent-cyan transition-colors hover:bg-accent-cyan hover:text-noir-void"
            >
                Back to Home
            </Link>

            <nav
                aria-label="Popular pages"
                className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
                {LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-xs uppercase tracking-[0.2em] text-noir-cloud transition-colors hover:text-noir-snow"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
