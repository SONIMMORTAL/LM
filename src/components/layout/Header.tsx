"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingCart, ShoppingBag, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoafDeck } from "@/components/brand/LoafDeck";
import { useAuth, AuthModal } from "@/components/auth";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { socialLinks } from "@/components/layout/socialLinks";
import { playCrateFlipSfx } from "@/lib/ui-sfx";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/components/layout/navItems";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/music", label: "Music" },
    { href: "/videos", label: "Videos" },
    { href: "/shop", label: "Shop" },
    { href: "/loaf-films", label: "Films" },
    { href: "/gallery", label: "Blackbook" },
    { href: "/bio", label: "Bio" },
];


const isCurrent = (pathname: string, href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [userMenuPath, setUserMenuPath] = useState<string | null>(null);
    const pathname = usePathname();
    const isMobileMenuOpen = mobileMenuPath === pathname;
    const isUserMenuOpen = userMenuPath === pathname;
    const setIsMobileMenuOpen = (open: boolean) => setMobileMenuPath(open ? pathname : null);
    const setIsUserMenuOpen = (open: boolean) => setUserMenuPath(open ? pathname : null);
    const { user, profile, signOut, loading } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const tabsRef = useRef<HTMLElement>(null);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    // Bring the current page's tab into view in the scrolling strip, resting on a whole tab:
    // as near the middle as the strip allows, but never with half a tab cut off at the left
    useEffect(() => {
        const tabs = tabsRef.current;
        const current = tabs?.querySelector<HTMLElement>('[aria-current="page"]');
        if (!tabs || !current) return;
        const pad = parseFloat(getComputedStyle(tabs).paddingLeft) || 0;
        const centred = current.offsetLeft - (tabs.clientWidth - current.offsetWidth) / 2;
        const starts = [...tabs.querySelectorAll<HTMLElement>("a")].map((tab) => tab.offsetLeft - pad);
        const resting = starts.filter((start) => start <= centred).pop() ?? 0;
        const fits = current.offsetLeft + current.offsetWidth - resting <= tabs.clientWidth;
        tabs.scrollLeft = fits ? resting : current.offsetLeft - pad;
    }, [pathname]);

    // Fade only the edges that have more tabs past them
    useEffect(() => {
        const tabs = tabsRef.current;
        if (!tabs) return;
        const mark = () => {
            const atStart = tabs.scrollLeft <= 2;
            const atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 2;
            tabs.dataset.edge = atStart && atEnd ? "none" : atStart ? "start" : atEnd ? "end" : "middle";
        };
        mark();
        tabs.addEventListener("scroll", mark, { passive: true });
        window.addEventListener("resize", mark);
        return () => {
            tabs.removeEventListener("scroll", mark);
            window.removeEventListener("resize", mark);
        };
    }, []);

    async function handleSignOut() {
        await signOut();
        setIsUserMenuOpen(false);
    }

    // Don't show header on admin pages (Moved here to satisfy Rules of Hooks)
    if (pathname.startsWith("/admin")) return null;

    // Home is the full-screen menu — it owns the viewport, no chrome
    if (pathname === "/") return null;

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 transition-all duration-200",
                    "max-md:bg-white/95 max-md:backdrop-blur-xl max-md:border-b-2 max-md:border-[#141714]/20 max-md:safe-top",
                    isScrolled
                        ? "md:bg-white/96 md:backdrop-blur-md md:border-b-2 md:border-[#141714]/15 md:shadow-sm"
                        : "md:bg-white/90 md:backdrop-blur-sm md:border-b md:border-[#141714]/10"
                )}
            >
                <div aria-hidden className="tiger-camo-strip h-[3px] w-full" />
                {/* Phones: deck, every section as a stamped tab, bag and the fold-out menu */}
                <div className="md:hidden flex items-center gap-2 px-3 py-2">
                    <Link href="/" aria-label="Loaf Records — home" className="relative z-50 shrink-0">
                        <LoafDeck size={40} priority />
                    </Link>

                    <nav
                        ref={tabsRef}
                        aria-label="Site sections"
                        className={cn(
                            "relative min-w-0 flex-1 flex items-center gap-1.5 overflow-x-auto overscroll-x-contain snap-x snap-proximity scroll-px-1 hide-scrollbar px-1",
                            "[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]",
                            "data-[edge=middle]:[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)]",
                            "data-[edge=end]:[mask-image:linear-gradient(to_right,transparent,black_16px)]",
                            "data-[edge=none]:[mask-image:none]"
                        )}
                    >
                        {PRIMARY_NAV.map((item) => {
                            const current = isCurrent(pathname, item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => playCrateFlipSfx()}
                                    aria-current={current ? "page" : undefined}
                                    className={cn(
                                        "shrink-0 snap-start inline-flex items-center rounded-lg border px-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition-colors",
                                        current
                                            ? "border-[#141714] bg-[#141714] text-white"
                                            : "border-[#141714]/15 bg-[#F2F1EC] text-[#3E443B] hover:text-[#141714] hover:border-[#365332]/60"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setIsCartOpen(true)}
                        aria-label={
                            cartCount > 0
                                ? `Open bag, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                                : "Open bag, empty"
                        }
                        className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-[#141714]/25 bg-[#F2F1EC] text-[#141714] hover:bg-[#141714] hover:text-white transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                        {cartCount > 0 && (
                            <span
                                aria-hidden="true"
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#365332] text-white font-mono text-[9px] font-black flex items-center justify-center"
                            >
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            playCrateFlipSfx();
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                        }}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                        className={cn(
                            "relative z-50 shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border transition-colors",
                            isMobileMenuOpen
                                ? "border-[#141714] bg-[#141714] text-white"
                                : "border-[#141714]/25 bg-white text-[#141714] hover:border-[#365332]"
                        )}
                    >
                        {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>

                <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-20 md:h-24">
                        {/* Logo — the Loaf Records deck, same mark as the mobile landing */}
                        <Link
                            href="/"
                            aria-label="Loaf Records — home"
                            className="relative z-50 flex items-center"
                        >
                            <LoafDeck size={56} priority />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "relative px-2.5 lg:px-4 py-2 text-xs lg:text-sm font-medium uppercase tracking-wider transition-colors whitespace-nowrap",
                                            isActive
                                                ? "text-accent-cyan"
                                                : "text-foreground hover:text-accent-cyan"
                                        )}
                                    >
                                        {item.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-cyan"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right side - Login & Cart */}
                        <div className="hidden md:flex items-center gap-4">
                            {loading ? (
                                <div className="w-20 h-8 bg-noir-slate animate-pulse rounded-lg" />
                            ) : user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:text-accent-cyan transition-colors rounded-lg hover:bg-noir-slate"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-accent-cyan text-noir-void flex items-center justify-center font-bold uppercase">
                                            {profile?.username?.charAt(0) || user.email?.charAt(0) || "U"}
                                        </div>
                                        <span className="max-w-[100px] truncate">
                                            {profile?.display_name || profile?.username || user.email?.split("@")[0]}
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 transition-transform", isUserMenuOpen && "rotate-180")} />
                                    </button>

                                    {/* User Dropdown */}
                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                className="absolute right-0 top-full mt-2 w-48 bg-noir-charcoal border border-noir-smoke rounded-xl overflow-hidden shadow-xl"
                                            >
                                                <div className="p-3 border-b border-noir-smoke">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {profile?.display_name || profile?.username}
                                                    </p>
                                                    <p className="text-xs text-noir-ash truncate">{user.email}</p>
                                                </div>
                                                <div className="p-1">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent-cyan transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Log in
                                </button>
                            )}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                aria-label={
                                    cartCount > 0
                                        ? `Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                                        : "Open cart, empty"
                                }
                                className="relative p-2 text-foreground hover:text-accent-cyan transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                                {cartCount > 0 && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-accent-cyan text-noir-void text-xs font-bold rounded-full flex items-center justify-center"
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Theme Toggle */}
                            <ThemeToggle />
                        </div>

                    </div>
                </div>
            </header>

            {/* Mobile menu: crisp white & tiger-stripe camo backdrop with stamped section names */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-30 md:hidden tiger-camo-surface text-[#141714]"
                    >
                        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                            <Image
                                src="/brand/dungeon-studio-4k.webp"
                                alt=""
                                fill
                                sizes="50vw"
                                quality={70}
                                className="object-cover object-top opacity-[0.07] scale-105"
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(ellipse 95% 70% at 50% 15%, rgba(255,255,255,0.65) 0%, rgba(250,249,246,0.92) 60%, #FAF9F6 100%)",
                                }}
                            />
                        </div>

                        <nav
                            aria-label="Menu"
                            className="relative h-full overflow-y-auto overscroll-contain px-5 pt-24 pb-32"
                        >
                            {/* Socials sit up top, where the floating mini player can't cover them */}
                            <div className="flex items-center justify-between gap-2">
                                <p className="min-w-0 truncate font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#365332]">
                                    Loaf Records · Brooklyn NY
                                </p>
                                <div className="flex shrink-0 items-center">
                                    {socialLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={link.label}
                                            className="inline-flex h-10 w-8 items-center justify-center text-[#3E443B] transition-colors hover:text-[#141714]"
                                        >
                                            <link.icon className="h-[18px] w-[18px]" />
                                        </a>
                                    ))}
                                    <ThemeToggle />
                                </div>
                            </div>

                            <ul className="mt-2 border-t-2 border-[#141714]/15">
                                {PRIMARY_NAV.map((item, index) => {
                                    const current = isCurrent(pathname, item.href);
                                    return (
                                        <motion.li
                                            key={item.href}
                                            initial={{ opacity: 0, x: 18 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.04 + index * 0.04, type: "spring", stiffness: 320, damping: 28 }}
                                            className="border-b border-[#141714]/12"
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={() => playCrateFlipSfx()}
                                                aria-current={current ? "page" : undefined}
                                                className="group flex items-center gap-3 py-2"
                                            >
                                                <span className="w-6 font-mono text-[10px] font-bold tracking-widest text-[#365332]">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "font-display text-[2.25rem] uppercase leading-none tracking-[0.04em] transition-colors",
                                                        current ? "text-[#365332]" : "text-[#141714] group-hover:text-[#365332]"
                                                    )}
                                                >
                                                    {item.label}
                                                </span>
                                                {current && (
                                                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-[#141714]/25 bg-white px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#141714]">
                                                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#365332] motion-safe:animate-pulse" />
                                                        Active
                                                    </span>
                                                )}
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>

                            {/* The rest of the site, small, so nothing is unreachable */}
                            <p className="mt-3 flex flex-wrap items-center gap-x-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#3E443B]">
                                {SECONDARY_NAV.map((item, index) => (
                                    <span key={item.href} className="inline-flex items-center">
                                        {index > 0 && <span aria-hidden className="mx-1.5 text-[#365332]/60">·</span>}
                                        <Link
                                            href={item.href}
                                            onClick={() => playCrateFlipSfx()}
                                            aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                                            className={cn(
                                                "inline-flex min-h-11 items-center transition-colors hover:text-[#365332]",
                                                isCurrent(pathname, item.href) && "text-[#365332]"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    </span>
                                ))}
                            </p>

                            {/* Account & bag */}
                            <div className="mt-6 grid grid-cols-2 gap-2.5">
                                {user ? (
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 rounded-xl border-2 border-[#141714]/20 bg-white py-3 px-3 text-left text-[#141714] active:scale-[0.98] transition-transform"
                                    >
                                        <LogOut className="w-4 h-4 shrink-0 text-red-600" />
                                        <span className="min-w-0">
                                            <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#61675E] truncate">
                                                {profile?.display_name || profile?.username || user.email?.split("@")[0]}
                                            </span>
                                            <span className="block font-display text-[17px] uppercase leading-[1.05] tracking-[0.03em]">
                                                Sign out
                                            </span>
                                        </span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsAuthModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 rounded-xl border-2 border-[#365332] bg-white py-3 px-3 text-left text-[#365332] active:scale-[0.98] transition-transform"
                                    >
                                        <User className="w-4 h-4 shrink-0" />
                                        <span className="min-w-0">
                                            <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.24em] opacity-80">
                                                Account
                                            </span>
                                            <span className="block font-display text-[17px] uppercase leading-[1.05] tracking-[0.03em]">
                                                Log in
                                            </span>
                                        </span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsCartOpen(true);
                                    }}
                                    className="flex items-center gap-2 rounded-xl border-2 border-[#141714] bg-[#141714] py-3 px-3 text-left text-white shadow-md active:scale-[0.98] transition-transform"
                                >
                                    <ShoppingBag className="w-4 h-4 shrink-0" />
                                    <span className="min-w-0">
                                        <span className="block font-mono text-[9px] font-black uppercase tracking-[0.24em] text-zinc-300">
                                            {cartCount} {cartCount === 1 ? "item" : "items"}
                                        </span>
                                        <span className="block font-display text-[17px] uppercase leading-[1.05] tracking-[0.03em]">
                                            Your bag
                                        </span>
                                    </span>
                                </button>
                            </div>

                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
}
