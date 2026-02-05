import { motion } from "framer-motion";
import { ShoppingBag, Star, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getPrintfulProducts } from "@/lib/printful";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { TextReveal } from "@/components/ui/TextReveal";

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    // Fetch products from Printful
    const products = await getPrintfulProducts();

    return (

        <div className="min-h-screen pt-24 pb-16">
            {/* Hero Section */}
            <AuroraBackground className="mb-8 py-20">
                <section className="px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-0">
                            <span className="inline-block mb-4 text-accent-cyan text-sm tracking-[0.3em] uppercase">
                                Official Merch
                            </span>
                            <div className="flex justify-center mb-4">
                                <TextReveal
                                    text="The Drop"
                                    className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase justify-center"
                                />
                            </div>
                            <p className="text-noir-cloud max-w-lg mx-auto">
                                Limited edition gear. Raw aesthetics. Wear the movement.
                            </p>
                        </div>
                    </div>
                </section>
            </AuroraBackground>

            {/* Products Grid */}
            <ShopGrid products={products} />

            {/* Official Store Banner */}
            <section className="px-6 mt-16">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 rounded-2xl text-center relative overflow-hidden group">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-accent-cyan/20 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute inset-0 bg-noir-void/40 backdrop-blur-[2px]" />

                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4 text-white">
                                Join The Inner Circle
                            </h2>
                            <p className="text-noir-cloud mb-6 max-w-md mx-auto">
                                Get early access to limited drops, exclusive variants, and behind-the-scenes content.
                            </p>
                            <Link
                                href="/vip"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-cyan text-noir-void font-bold rounded-full hover:bg-white hover:scale-105 transition-all shadow-glow-sm"
                            >
                                <Star className="w-5 h-5 fill-current" />
                                UNLOCK VIP ACCESS
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="px-6 mt-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        {[
                            { icon: Check, title: "Authentic Merch", desc: "100% official gear" },
                            { icon: Star, title: "Premium Quality", desc: "Made to last" },
                            { icon: ShoppingBag, title: "Worldwide Shipping", desc: "We ship everywhere" },
                        ].map((badge, i) => (
                            <div
                                key={badge.title}
                                className="flex items-center gap-4 p-4 glass-card rounded-xl"
                            >
                                <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                                    <badge.icon className="w-5 h-5 text-accent-cyan" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">{badge.title}</h4>
                                    <p className="text-sm text-noir-cloud">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

