"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Film, Play, Check, Send, Sparkles, Clock, Layers } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { FilmStrip } from "@/components/films/FilmStrip";

const packages = [
    {
        name: "Bronze",
        price: "$1,500",
        tagline: "Perfect for indie artists & single releases.",
        deliverables: [
            "1 Location (indoor or outdoor)",
            "4 Hours shooting duration",
            "1 Cinema-grade camera rig (1080p)",
            "Basic editing & color grading",
            "1 Revision round",
            "5-7 Days delivery turnaround"
        ],
        icon: Camera,
        color: "from-amber-700/20 to-amber-900/10 border-amber-700/30 text-amber-500"
    },
    {
        name: "Silver",
        price: "$3,000",
        tagline: "Bestseller. The standard for official music videos.",
        deliverables: [
            "2 Locations (concept-driven)",
            "8 Hours shooting duration (Full Day)",
            "Dual-camera cinema rig setup (4K)",
            "Advanced color grading & stylistic look",
            "2 Revision rounds",
            "30-second social media teaser trailer",
            "10-14 Days delivery turnaround"
        ],
        icon: Film,
        color: "from-slate-400/20 to-slate-600/10 border-slate-400/30 text-accent-cyan",
        popular: true
    },
    {
        name: "Gold",
        price: "$6,000",
        tagline: "Fully cinematic. High production value commercial scale.",
        deliverables: [
            "Pre-production (concept storyboard & casting assistance)",
            "Unlimited locations (up to 2 shoot days)",
            "3-person professional crew (Director, DP, Gaffer)",
            "Elite cinema camera package (RED/Arri/Sony FX)",
            "Custom titles, visual effects & sound design",
            "Dolby color grading & mastering",
            "3 Revision rounds",
            "BTS (Behind-The-Scenes) video + 2 socials cuts"
        ],
        icon: Sparkles,
        color: "from-amber-400/20 to-amber-600/10 border-amber-500/30 text-amber-400"
    }
];

const timelineSteps = [
    {
        title: "01. Discovery",
        desc: "We align on your track, dissect references, mood boards, and map out visual scripts that reflect your artistic persona.",
        icon: Clock
    },
    {
        title: "02. Pre-Production",
        desc: "Location scouting, casting, storyboarding, and securing props. We lock down the logistics before stepping on set.",
        icon: Layers
    },
    {
        title: "03. Production",
        desc: "Lights, camera, action. Our crew sets up cinema-grade rigs to capture raw energy and dramatic composition.",
        icon: Camera
    },
    {
        title: "04. Post-Production",
        desc: "Editing, sound mapping, custom titles, VFX overlays, and color grading. We shape the narrative of the video.",
        icon: Film
    },
    {
        title: "05. The Drop",
        desc: "We deliver your 4K final cut alongside social media trailers, ready to command views on YouTube and Instagram.",
        icon: Play
    }
];

export default function LoafFilmsPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedPackage, setSelectedPackage] = useState("Silver");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    inquiryType: `Loaf Films Booking: ${selectedPackage} Package`,
                    message
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success("Booking request sent! We'll review your project details and get back to you shortly.");
                setName("");
                setEmail("");
                setMessage("");
            } else {
                toast.error(data.error || "Failed to submit booking inquiry.");
            }
        } catch (error) {
            toast.error("Network error. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-noir-void text-foreground selection:bg-accent-cyan/30 relative overflow-hidden">
            
            {/* Visual background details */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px] opacity-30" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6 z-10">
                <div className="max-w-5xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-4"
                    >
                        <span className="inline-block px-3 py-1 rounded-full border border-accent-cyan/50 text-accent-cyan text-xs font-bold tracking-widest uppercase bg-accent-cyan/5">
                            Cinematic Services
                        </span>
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                            LOAF <span className="text-accent-cyan">FILMS</span>
                        </h1>
                        <p className="text-noir-cloud text-base sm:text-lg md:text-xl max-w-2xl mx-auto tracking-wide font-light">
                            Brooklyn-born cinematic execution. We shoot raw, concept-driven music videos and commercial films that reflect visual soul.
                        </p>
                        <div className="pt-4">
                            <a
                                href="#booking"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-cyan text-noir-void font-bold rounded-xl shadow-lg shadow-accent-cyan/25 hover:shadow-accent-cyan/40 hover:scale-105 transition-all text-sm uppercase tracking-wider"
                            >
                                <Camera className="w-5 h-5" />
                                Book a Production
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Facade Portfolio Section */}
            <section className="relative py-16 px-6 z-10 bg-noir-charcoal/30 border-y border-white/5">
                <div className="max-w-6xl mx-auto space-y-10">
                    <div>
                        <span
                            aria-hidden
                            className="pointer-events-none block select-none text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter text-white/[0.07]"
                        >
                            The Reel
                        </span>
                        <h2 className="-mt-5 sm:-mt-8 text-lg sm:text-xl font-black uppercase tracking-[0.2em] text-accent-cyan">
                            Selected Work
                        </h2>
                        <p className="mt-2 text-sm text-noir-cloud">
                            Recent Loaf Films productions. Pull a frame to watch it.
                        </p>
                    </div>

                    <FilmStrip
                        entries={[
                            {
                                youtubeId: "OOx9QAeRo8E",
                                title: "Shadow The Great — Lost City",
                                credit: "Directed by Sage Wolf",
                            },
                            {
                                youtubeId: "41Zx0etfnkM",
                                title: "Abel — Rah Tha Ruler & Shadow The Great",
                                credit: "Directed by Loaf Films",
                            },
                            {
                                youtubeId: "jHGAyWqaZ88",
                                title: "Shadow The Great — Soul",
                                credit: "Prod. by Seyer",
                            },
                            {
                                youtubeId: "ONVI4qys5A4",
                                title: "Shadow The Great — Jeeps",
                                credit: "Prod. by Ruggz",
                            },
                        ]}
                    />
                </div>
            </section>

            {/* Packages Section */}
            <section className="relative py-24 px-6 z-10">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
                            Production Packages
                        </h2>
                        <p className="text-noir-cloud max-w-md mx-auto text-sm">
                            Transparent pricing tailored to independent and label-signed artists.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {packages.map((pkg) => {
                            const PkgIcon = pkg.icon;
                            return (
                                <motion.div
                                    key={pkg.name}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className={`relative flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-b ${pkg.color} border backdrop-blur-md transition-all duration-300 hover:scale-[1.02]`}
                                >
                                    {pkg.popular && (
                                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-cyan text-noir-void px-3 py-1 text-xs font-extrabold uppercase rounded-full tracking-widest shadow-glow-sm">
                                            RECOMMENDED
                                        </span>
                                    )}

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold uppercase tracking-tight text-white">{pkg.name}</h3>
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <PkgIcon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-4xl sm:text-5xl font-black text-white">{pkg.price}</span>
                                            <span className="text-noir-ash text-xs uppercase tracking-widest ml-2">Flat Rate</span>
                                        </div>

                                        <p className="text-sm text-noir-cloud leading-relaxed">{pkg.tagline}</p>
                                        <div className="h-px bg-white/10" />

                                        <ul className="space-y-3">
                                            {pkg.deliverables.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                                                    <Check className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-8">
                                        <a
                                            href="#booking"
                                            onClick={() => setSelectedPackage(pkg.name)}
                                            className={`block w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider text-center transition-all ${
                                                pkg.popular
                                                    ? "bg-accent-cyan text-noir-void hover:bg-cyan-400"
                                                    : "bg-white/10 text-white hover:bg-white/15"
                                            }`}
                                        >
                                            Select {pkg.name} Package
                                        </a>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Process Timeline */}
            <section className="relative py-24 px-6 z-10 bg-noir-charcoal/20 border-y border-white/5">
                <div className="max-w-5xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
                            The Production Process
                        </h2>
                        <p className="text-noir-cloud max-w-md mx-auto text-sm">
                            From inception to upload, here is how we bring your tracks to life.
                        </p>
                    </div>

                    <div className="relative border-l border-white/10 pl-6 sm:pl-12 ml-4 sm:ml-8 space-y-12">
                        {timelineSteps.map((step, idx) => {
                            const StepIcon = step.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="relative space-y-2"
                                >
                                    {/* Timeline bullet icon */}
                                    <div className="absolute -left-[45px] sm:-left-[69px] top-0 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-noir-charcoal border border-white/10 flex items-center justify-center">
                                        <StepIcon className="w-4 h-4 sm:w-5 sm:h-5 text-accent-cyan" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">{step.title}</h3>
                                    <p className="text-sm sm:text-base text-noir-cloud max-w-2xl leading-relaxed">{step.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Booking Form Section */}
            <section id="booking" className="relative py-24 px-6 z-10 scroll-mt-24">
                <div className="max-w-xl mx-auto">
                    <div className="glass-card p-8 rounded-3xl space-y-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent pointer-events-none" />
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                                Book Your Shoot
                            </h2>
                            <p className="text-noir-cloud text-sm">
                                Let&apos;s build your vision. Fill in the inquiry form below and we&apos;ll reply within 24 hours.
                            </p>
                        </div>

                        <form onSubmit={handleBooking} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="films-name" className="text-xs uppercase tracking-wider text-noir-cloud font-medium">Your Name</label>
                                <input
                                    id="films-name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 bg-noir-void rounded-xl text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="films-email" className="text-xs uppercase tracking-wider text-noir-cloud font-medium">Email Address</label>
                                <input
                                    id="films-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@gmail.com"
                                    className="w-full px-4 py-3 bg-noir-void rounded-xl text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="films-package" className="text-xs uppercase tracking-wider text-noir-cloud font-medium">Select Package</label>
                                <select
                                    id="films-package"
                                    value={selectedPackage}
                                    onChange={(e) => setSelectedPackage(e.target.value)}
                                    className="w-full px-4 py-3 bg-noir-void rounded-xl text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                                >
                                    <option value="Bronze">Bronze Package ($1,500)</option>
                                    <option value="Silver">Silver Package ($3,000)</option>
                                    <option value="Gold">Gold Package ($6,000)</option>
                                    <option value="Custom">Custom / Commercial Project</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="films-message" className="text-xs uppercase tracking-wider text-noir-cloud font-medium">Message & Vision</label>
                                <textarea
                                    id="films-message"
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell us about your track, visual references, shoot ideas, or locations..."
                                    className="w-full px-4 py-3 bg-noir-void rounded-xl text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent-cyan resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-accent-cyan text-noir-void font-bold uppercase rounded-xl hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm tracking-wider shadow-glow-md"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-noir-void/30 border-t-noir-void rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Submit Booking Inquiry
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
