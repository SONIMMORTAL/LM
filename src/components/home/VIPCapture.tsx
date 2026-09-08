"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Music2, Gift, Star, ArrowRight, Check } from "lucide-react";
import { toast } from "react-hot-toast";

const perks = [
    { icon: Music2, label: "Early access to unreleased tracks" },
    { icon: Gift, label: "20% off all official merch" },
    { icon: Star, label: "Invite-only events & listening parties" },
];

export function VIPCapture() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "VIP Signup",
                    email,
                    inquiryType: "VIP Inner Circle Signup",
                    message: `New VIP signup from homepage: ${email}`,
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setIsSubmitted(true);
                setEmail("");
                toast.success("Welcome to the inner circle!");
            } else {
                toast.error("Something went wrong. Try again.");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative py-20 md:py-28 px-4 sm:px-6 overflow-hidden bg-noir-charcoal/50">
            {/* Top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-amber-500/40" />

            {/* Ambient glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 50% 60% at 50% 40%, rgba(245,158,11,0.04) 0%, transparent 70%)",
                }}
            />

            <div className="max-w-xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center space-y-6"
                >
                    {/* Crown icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 mx-auto">
                        <Crown className="w-8 h-8 text-amber-500" />
                    </div>

                    <div>
                        <span className="inline-block mb-3 text-amber-500 text-xs tracking-[0.35em] uppercase font-medium">
                            Inner Circle
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.02em] uppercase">
                            Join the{" "}
                            <span className="text-amber-500">VIP</span>
                        </h2>
                    </div>

                    {/* Perks */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
                        {perks.map((perk) => (
                            <div
                                key={perk.label}
                                className="flex items-center gap-2 text-noir-cloud"
                            >
                                <perk.icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <span>{perk.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    {!isSubmitted ? (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
                        >
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="flex-1 px-5 py-3.5 bg-noir-void rounded-xl text-foreground placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-noir-smoke text-sm"
                            />
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-noir-void font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 text-sm uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {isSubmitting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className="w-5 h-5 border-2 border-noir-void/30 border-t-noir-void rounded-full"
                                    />
                                ) : (
                                    <>
                                        Get Access
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center gap-3 py-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-foreground font-semibold">
                                You&apos;re in. Check your inbox.
                            </span>
                        </motion.div>
                    )}

                    <p className="text-noir-ash text-xs">
                        No spam. Exclusive drops & early access only.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
