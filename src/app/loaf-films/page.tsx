"use client";

import { useState } from "react";
import { Camera, Film, Play, Check, Send, Sparkles, Clock, Layers, Clapperboard } from "lucide-react";
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
        frame: "border-amber-700/50",
        accent: "text-amber-600"
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
        frame: "border-accent-cyan/50",
        accent: "text-accent-cyan",
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
        frame: "border-amber-400/50",
        accent: "text-amber-400"
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

// The frames on the reel, in order
const REEL = [
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
];

// Booking form fields in the landing's stamped style. 16px text, so iPhones don't zoom on focus.
const FIELD_LABEL = "font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-noir-cloud";
const FIELD =
    "w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-base text-white placeholder:text-noir-ash focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40";

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
        <div className="min-h-screen pt-24 pb-16">
            {/* ═══════════════════════════════════════════════════════════
                HERO — the same stamped monument as the mobile landing
               ═══════════════════════════════════════════════════════════ */}
            <section className="px-3 sm:px-4 max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-[26px] border-2 border-amber-400/35 bg-[#0B0B0F] shadow-[0_28px_80px_rgba(0,0,0,0.95)]">
                    <div className="relative h-52 sm:h-72 w-full overflow-hidden">
                        <Image
                            src="/LC1.jpg"
                            alt="Still from Shadow The Great — Lost City, a Loaf Films production"
                            fill
                            priority
                            sizes="(max-width: 1024px) 96vw, 1000px"
                            className="object-cover object-center"
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/45 to-black/30"
                        />

                        {/* Stamped badge */}
                        <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/50 bg-black/85 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">
                                <Clapperboard className="h-3 w-3" />
                                Cinematic Services
                            </span>
                        </div>

                        {/* Loaf Films seal */}
                        <div className="absolute bottom-3 right-3 h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-xl border border-amber-400/40 bg-black shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                            <Image src="/LOAFFILMS.png" alt="Loaf Films" fill sizes="64px" className="object-cover" />
                        </div>

                        <div className="absolute bottom-3 left-4 right-24">
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400">
                                Loaf Records · Production House
                            </p>
                            <h1
                                className="font-display uppercase leading-[0.86] tracking-[0.02em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                                style={{ fontSize: "clamp(2.75rem, 13vw, 4.5rem)" }}
                            >
                                Loaf{" "}
                                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-accent-cyan bg-clip-text text-transparent">
                                    Films
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Stamped ticker */}
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar border-y border-amber-400/20 bg-black/90 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em]">
                        <span className="shrink-0 font-bold text-amber-400">We Shoot:</span>
                        <span className="shrink-0 text-white/85">Music Videos</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="shrink-0 text-white/85">Commercials</span>
                        <span className="text-amber-400/50">•</span>
                        <span className="shrink-0 text-white/85">Direction</span>
                    </div>

                    {/* Action console */}
                    <div className="bg-gradient-to-b from-[#111218] to-[#090A0E] p-4">
                        <p className="text-xs leading-relaxed text-noir-cloud">
                            Brooklyn-born cinematic execution. We shoot raw, concept-driven music videos and
                            commercial films that reflect visual soul.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2.5">
                            <a
                                href="#booking"
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-3.5 font-mono text-xs font-black uppercase tracking-[0.14em] text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-transform active:scale-[0.98]"
                            >
                                <Camera className="h-4 w-4" />
                                <span>Book A Shoot</span>
                            </a>
                            <a
                                href="#reel"
                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-accent-cyan/50 bg-accent-cyan/10 px-3 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan hover:text-black active:scale-[0.98]"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                <span>Watch The Reel</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <div className="px-3 sm:px-4 max-w-5xl mx-auto mt-4 space-y-5">
                {/* Stamped jump tabs, like the landing's section pills */}
                <nav aria-label="Loaf Films sections" className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                    {[
                        { href: "#reel", label: "The Reel" },
                        { href: "#packages", label: "Packages" },
                        { href: "#process", label: "Process" },
                        { href: "#booking", label: "Book" },
                    ].map((tab) => (
                        <a
                            key={tab.href}
                            href={tab.href}
                            className="inline-flex shrink-0 items-center rounded-lg border border-white/15 bg-black/70 px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-noir-cloud transition-colors hover:border-amber-400/50 hover:text-amber-400"
                        >
                            {tab.label}
                        </a>
                    ))}
                </nav>

                {/* ═══ THE REEL ═══ */}
                <section
                    id="reel"
                    aria-labelledby="reel-heading"
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-white/15 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
                >
                    <div className="flex items-end justify-between gap-3 border-b border-white/10 bg-black/60 p-4 sm:p-5">
                        <div className="min-w-0">
                            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-amber-400">
                                Selected Work
                            </p>
                            <h2
                                id="reel-heading"
                                className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-white"
                            >
                                The Reel
                            </h2>
                            <p className="mt-1.5 text-xs text-noir-cloud">
                                Recent Loaf Films productions. Pull a frame to watch it.
                            </p>
                        </div>
                        <span className="shrink-0 rounded border border-white/15 bg-black/70 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/70">
                            {REEL.length} Films
                        </span>
                    </div>
                    {/* The strip bleeds to the card's edges */}
                    <div className="px-6 pt-5 pb-3">
                        <FilmStrip entries={REEL} />
                    </div>
                </section>

                {/* ═══ PACKAGES ═══ */}
                <section
                    id="packages"
                    aria-labelledby="packages-heading"
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-amber-400/40 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-full -translate-x-1/2"
                        style={{ background: "radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.18) 0%, transparent 70%)" }}
                    />
                    <div className="relative border-b border-white/10 bg-black/60 p-4 sm:p-5">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-amber-400">
                            Flat Rates · No Surprises
                        </p>
                        <h2
                            id="packages-heading"
                            className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-white"
                        >
                            Production Packages
                        </h2>
                        <p className="mt-1.5 text-xs text-noir-cloud">
                            Transparent pricing tailored to independent and label-signed artists.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 gap-3 p-3 sm:p-5 md:grid-cols-3 md:gap-4">
                        {packages.map((pkg) => {
                            const PkgIcon = pkg.icon;
                            return (
                                <div
                                    key={pkg.name}
                                    className={`relative flex flex-col rounded-2xl border-2 bg-[#101219] p-4 ${pkg.frame}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            {pkg.popular && (
                                                <span className="mb-1.5 inline-block rounded bg-accent-cyan px-2 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-black">
                                                    Recommended
                                                </span>
                                            )}
                                            <h3 className="font-display text-2xl uppercase leading-none tracking-wider text-white">
                                                {pkg.name}
                                            </h3>
                                        </div>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/70">
                                            <PkgIcon className={`h-5 w-5 ${pkg.accent}`} />
                                        </div>
                                    </div>

                                    <p className="mt-3 font-mono">
                                        <span className="text-3xl font-bold text-amber-400">{pkg.price}</span>
                                        <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-noir-cloud">Flat Rate</span>
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed text-noir-cloud">{pkg.tagline}</p>

                                    <ul className="mt-3 space-y-1.5 border-t border-dashed border-white/10 pt-3">
                                        {pkg.deliverables.map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-xs text-white/90">
                                                <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${pkg.accent}`} />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <a
                                        href="#booking"
                                        onClick={() => setSelectedPackage(pkg.name)}
                                        className={`mt-4 block rounded-xl py-3 text-center font-mono text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${
                                            pkg.popular
                                                ? "bg-accent-cyan text-black shadow-glow-sm"
                                                : "border border-white/20 bg-black/60 text-white hover:border-amber-400"
                                        }`}
                                    >
                                        Select {pkg.name}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ═══ PROCESS ═══ */}
                <section
                    id="process"
                    aria-labelledby="process-heading"
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-white/15 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
                >
                    <div className="border-b border-white/10 bg-black/60 p-4 sm:p-5">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-accent-cyan">
                            Inception To Upload
                        </p>
                        <h2
                            id="process-heading"
                            className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-white"
                        >
                            The Process
                        </h2>
                        <p className="mt-1.5 text-xs text-noir-cloud">
                            Here is how we bring your tracks to life.
                        </p>
                    </div>

                    <ol className="space-y-2.5 p-3 sm:p-5">
                        {timelineSteps.map((step) => {
                            const StepIcon = step.icon;
                            const [number, title] = step.title.split(". ");
                            return (
                                <li
                                    key={step.title}
                                    className="flex gap-3 rounded-2xl border border-white/10 bg-[#101219] p-3.5"
                                >
                                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-400/40 bg-black/85">
                                        <span className="font-mono text-[10px] font-black leading-none text-amber-400">{number}</span>
                                        <StepIcon className="mt-0.5 h-3 w-3 text-white/60" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-display text-xl uppercase leading-none tracking-wider text-white">
                                            {title}
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-noir-cloud">{step.desc}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>

                {/* ═══ BOOKING ═══ */}
                <section
                    id="booking"
                    aria-labelledby="booking-heading"
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-accent-cyan/30 bg-[#0A0B10]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-full -translate-x-1/2"
                        style={{ background: "radial-gradient(circle at 50% 30%, rgba(0, 217, 255, 0.14) 0%, transparent 70%)" }}
                    />
                    <div className="relative border-b border-white/10 bg-black/60 p-4 sm:p-5">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-accent-cyan">
                            Reply Within 24 Hours
                        </p>
                        <h2
                            id="booking-heading"
                            className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-white"
                        >
                            Book Your Shoot
                        </h2>
                        <p className="mt-1.5 text-xs text-noir-cloud">
                            Let&apos;s build your vision. Tell us about the track and we&apos;ll get back to you.
                        </p>
                    </div>

                    <form onSubmit={handleBooking} className="relative mx-auto max-w-xl space-y-4 p-4 sm:p-5">
                        <div className="space-y-1.5">
                            <label htmlFor="films-name" className={FIELD_LABEL}>Your Name</label>
                            <input
                                id="films-name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className={FIELD}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="films-email" className={FIELD_LABEL}>Email Address</label>
                            <input
                                id="films-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="yourname@gmail.com"
                                className={FIELD}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="films-package" className={FIELD_LABEL}>Select Package</label>
                            <select
                                id="films-package"
                                value={selectedPackage}
                                onChange={(e) => setSelectedPackage(e.target.value)}
                                className={FIELD}
                            >
                                <option value="Bronze">Bronze Package ($1,500)</option>
                                <option value="Silver">Silver Package ($3,000)</option>
                                <option value="Gold">Gold Package ($6,000)</option>
                                <option value="Custom">Custom / Commercial Project</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="films-message" className={FIELD_LABEL}>Message & Vision</label>
                            <textarea
                                id="films-message"
                                required
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us about your track, visual references, shoot ideas, or locations..."
                                className={`${FIELD} resize-none`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 font-mono text-xs font-black uppercase tracking-[0.18em] text-black shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                            ) : (
                                <>
                                    Send Booking Inquiry
                                    <Send className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
