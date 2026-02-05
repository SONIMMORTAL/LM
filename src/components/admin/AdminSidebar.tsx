"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    BarChart3,
    DollarSign,
    Music,
    Video,
    Package,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/sales", label: "Sales", icon: DollarSign },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/music", label: "Music", icon: Music },
    { href: "/admin/videos", label: "Videos", icon: Video },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    }

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-noir-charcoal border border-noir-smoke rounded-lg text-foreground"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-noir-void/80 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-noir-charcoal border-r border-noir-smoke z-40 transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-noir-smoke">
                        <h1 className="text-lg font-bold text-foreground">Shadow Admin</h1>
                        <p className="text-xs text-noir-ash">Management Dashboard</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                                        ? "bg-accent-cyan/10 text-accent-cyan"
                                        : "text-noir-cloud hover:bg-noir-slate hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-noir-smoke">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-noir-cloud hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
