"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingCart, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { useAuth, AuthModal } from "@/components/auth";
import { useCart } from "@/context/CartContext";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/music", label: "Music" },
    { href: "/videos", label: "Videos" },
    { href: "/shop", label: "Shop" },
    { href: "/forum", label: "Forum" },
    { href: "/contact", label: "Contact" },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, profile, signOut, loading } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();

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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [pathname]);

    async function handleSignOut() {
        await signOut();
        setIsUserMenuOpen(false);
    }

    // Don't show header on admin pages (Moved here to satisfy Rules of Hooks)
    if (pathname.startsWith("/admin")) return null;

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 transition-all duration-200",
                    isScrolled
                        ? "bg-noir-void/95 backdrop-blur-md border-b border-noir-smoke/50"
                        : "bg-noir-void/90"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-20 md:h-24">
                        {/* Logo - Turntable with Spinning Vinyl */}
                        <Link
                            href="/"
                            className="relative z-50 flex items-center group"
                        >
                            <div className="relative w-[100px] h-[100px] md:w-[130px] md:h-[130px]">
                                {/* Static Turntable Base */}
                                <img
                                    src="/static-logo.jpg"
                                    alt="Turntable"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            </div>
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
                                            "relative px-5 py-2 text-sm font-medium uppercase tracking-wider transition-colors",
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
                                                    <Link
                                                        href="/stoop"
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-noir-slate rounded-lg transition-colors"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        The Stoop
                                                    </Link>
                                                    <Link
                                                        href="/forum"
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-noir-slate rounded-lg transition-colors"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        Forum
                                                    </Link>
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
                                className="relative p-2 text-foreground hover:text-accent-cyan transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-cyan text-noir-void text-xs font-bold rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="relative z-50 md:hidden p-2 text-foreground"
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu className="w-6 h-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-30 md:hidden"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-noir-void/98"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Content */}
                        <motion.nav
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-noir-charcoal border-l border-noir-smoke flex flex-col pt-24 pb-8 px-6"
                        >
                            <div className="flex flex-col gap-2">
                                {navItems.map((item, index) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <motion.div
                                            key={item.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-4 px-4 py-4 rounded-xl transition-colors uppercase tracking-wider",
                                                    isActive
                                                        ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                                                        : "text-foreground hover:bg-noir-slate"
                                                )}
                                            >
                                                <span className="text-lg font-medium">{item.label}</span>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Login & Cart for mobile */}
                            <div className="mt-8 pt-8 border-t border-noir-smoke flex flex-col gap-4">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-noir-slate/50 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-accent-cyan text-noir-void flex items-center justify-center font-bold uppercase text-lg">
                                                {profile?.username?.charAt(0) || user.email?.charAt(0) || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">
                                                    {profile?.display_name || profile?.username}
                                                </p>
                                                <p className="text-xs text-noir-ash truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 px-4 py-3 bg-noir-slate rounded-xl text-red-400"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="font-medium">Sign out</span>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsAuthModalOpen(true);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 bg-noir-slate rounded-xl text-foreground"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">Log in</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsCartOpen(true);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 bg-accent-cyan text-noir-void rounded-xl"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span className="font-medium">Cart ({cartCount})</span>
                                </button>
                            </div>

                            {/* Bottom branding */}
                            <div className="mt-auto pt-8 border-t border-noir-smoke">
                                <p className="text-noir-ash text-sm">Loaf Records</p>
                                <p className="text-accent-cyan text-xs mt-1">Brooklyn, NY</p>
                            </div>
                        </motion.nav>
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
