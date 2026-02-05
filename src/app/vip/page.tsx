"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Lock, Gift, Music2, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const vipPerks = [
    {
        icon: Music2,
        title: "Exclusive Drops",
        description: "Early access to unreleased tracks and demos",
    },
    {
        icon: Gift,
        title: "Merch Discounts",
        description: "20% off all official merchandise",
    },
    {
        icon: Star,
        title: "VIP Events",
        description: "Invite-only listening parties and meetups",
    },
];

export default function VipPage() {
    const [phoneOrEmail, setPhoneOrEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);

    const handleRequestAccess = async () => {
        if (!phoneOrEmail.trim()) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsCodeSent(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Hero */}
            <section className="px-6 mb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Crown Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 mb-6">
                            <Crown className="w-10 h-10 text-amber-500" />
                        </div>

                        <span className="inline-block mb-4 text-amber-500 text-sm tracking-[0.3em] uppercase">
                            Inner Circle
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase mb-4">
                            <span className="text-foreground">VIP</span>
                            <span className="text-accent-cyan"> Access</span>
                        </h1>
                        <p className="text-noir-cloud max-w-lg mx-auto text-lg">
                            Exclusive content. Early access. Direct connection.
                            Join the inner circle.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Perks Grid */}
            <section className="px-6 mb-16">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {vipPerks.map((perk, index) => (
                            <motion.div
                                key={perk.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-6 rounded-2xl text-center group hover:border-amber-500/30 transition-colors"
                            >
                                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                                    <perk.icon className="w-6 h-6 text-amber-500" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">
                                    {perk.title}
                                </h3>
                                <p className="text-noir-cloud text-sm">
                                    {perk.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Access Gate */}
            <section className="px-6">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-8 rounded-3xl"
                    >
                        {!isCodeSent ? (
                            <>
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <Lock className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-xl font-bold uppercase">
                                        Request Access
                                    </h2>
                                </div>

                                <p className="text-noir-cloud text-sm text-center mb-6">
                                    Enter your phone or email to receive a one-time verification code.
                                </p>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={phoneOrEmail}
                                        onChange={(e) => setPhoneOrEmail(e.target.value)}
                                        placeholder="Phone number or email"
                                        className="w-full px-4 py-3 bg-noir-charcoal rounded-xl text-foreground placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-noir-smoke"
                                    />

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRequestAccess}
                                        disabled={!phoneOrEmail.trim() || isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-noir-void font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-noir-void/30 border-t-noir-void rounded-full"
                                            />
                                        ) : (
                                            <>
                                                Get Access Code
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                                <p className="text-noir-ash text-xs text-center mt-4">
                                    By requesting access, you agree to receive messages from Loaf Records.
                                </p>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                    <span className="text-3xl">✓</span>
                                </div>
                                <h2 className="text-xl font-bold mb-2">Code Sent!</h2>
                                <p className="text-noir-cloud text-sm mb-6">
                                    Check your {phoneOrEmail.includes("@") ? "email" : "phone"} for the verification code.
                                </p>
                                <Link
                                    href="/vip/verify"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-noir-void font-semibold rounded-xl hover:bg-amber-400 transition-colors"
                                >
                                    Enter Code
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Blurred Preview */}
            <section className="px-6 mt-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Blurred content preview */}
                        <div className="blur-md opacity-50 pointer-events-none">
                            <div className="bg-noir-charcoal p-8 rounded-3xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="aspect-video bg-noir-slate rounded-xl" />
                                    <div className="space-y-4">
                                        <div className="h-6 bg-noir-slate rounded w-3/4" />
                                        <div className="h-4 bg-noir-slate rounded w-full" />
                                        <div className="h-4 bg-noir-slate rounded w-5/6" />
                                        <div className="h-10 bg-amber-500/20 rounded-xl w-1/2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-noir-void/50">
                            <div className="text-center">
                                <Lock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                <p className="text-foreground font-medium">
                                    VIP Content Locked
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
