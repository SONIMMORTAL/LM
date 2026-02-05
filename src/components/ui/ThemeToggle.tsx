"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={toggleTheme}
            className={cn(
                "relative p-2 rounded-full transition-colors",
                "hover:bg-noir-slate focus:outline-none focus:ring-2 focus:ring-accent-cyan/50",
                className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {isDark ? (
                    <Moon className="w-5 h-5 text-accent-cyan" />
                ) : (
                    <Sun className="w-5 h-5 text-accent-cyan" />
                )}
            </motion.div>
        </motion.button>
    );
}
