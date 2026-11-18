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
        frame: "border-[#141714]/20",
        accent: "text-[#7C4D22]"
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
        frame: "border-[#365332]",
        accent: "text-[#365332]",
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
        frame: "border-amber-600/50",
        accent: "text-amber-700"
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

// Booking form fields styled cleanly on chalk white. 16px text prevents iOS zoom on focus.
const FIELD_LABEL = "font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#3E443B]";
const FIELD =
    "w-full rounded-xl border-2 border-[#141714]/15 bg-[#FAF9F6] px-4 py-3 text-base text-[#141714] placeholder:text-[#61675E] focus:border-[#365332] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#365332]/40";

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
        } catch {
            toast.error("Network error. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* ═══════════════════════════════════════════════════════════
                HERO — Loaf Films crew on set + stamped Films title bar
               ═══════════════════════════════════════════════════════════ */}
            <section className="px-3 sm:px-4 max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-[26px] border-2 border-[#141714] bg-white shadow-[0_22px_60px_rgba(20,23,20,0.12)]">
                    <div aria-hidden className="tiger-camo-strip h-2.5 w-full" />
                    <div className="relative aspect-[1024/577] w-full overflow-hidden bg-white">
                        <Image
                            src="/brand/films-header-4k.webp"
                            alt="The Loaf Films crew on set with a cinema camera on tripod, studio light, director chair with storyboards, and boom mic under the Loaf Films tag"
                            fill
                            priority
                            fetchPriority="high"
                            sizes="(max-width: 1024px) 96vw, 1024px"
                            className="object-contain object-center"
                        />
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3 border-t-2 border-[#141714]/15 bg-white px-4 py-4 sm:px-6">
                        <div className="min-w-0">
                            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#365332]">
                                Loaf Records · Films
                            </p>
                            <h1
                                className="mt-1 font-display uppercase leading-[0.88] tracking-[0.02em] text-[#141714]"
                                style={{ fontSize: "clamp(2.5rem, 11vw, 4.25rem)" }}
                            >
                                Loaf{" "}
                                <span className="text-[#365332]">
                                    Films
                                </span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#141714]/20 bg-[#F2F1EC] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#141714]">
                                <Clapperboard className="h-3 w-3 text-[#365332]" />
                                Cinematic Services
                            </span>
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-[#141714] bg-[#141714] shadow-sm">
                                <Image src="/LOAFFILMS.png" alt="Loaf Films" fill sizes="48px" className="object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Stamped tiger-camo trimmed ticker */}
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar border-y border-[#141714]/15 bg-[#141714] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white sm:px-6">
                        <span className="shrink-0 font-bold text-[#9FC096]">We Shoot:</span>
                        <span className="shrink-0 text-white">Music Videos</span>
                        <span className="text-white/40">•</span>
                        <span className="shrink-0 text-white">Commercials</span>
                        <span className="text-white/40">•</span>
                        <span className="shrink-0 text-white">Direction</span>
                    </div>

                    {/* Action console */}
                    <div className="bg-[#FAF9F6] p-4 sm:px-6">
                        <p className="text-xs leading-relaxed text-[#3E443B]">
                            Brooklyn-born cinematic execution. We shoot raw, concept-driven music videos and
                            commercial films that reflect visual soul.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2.5">
                            <a
                                href="#booking"
                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#141714] bg-[#141714] px-3 py-3.5 font-mono text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition-colors hover:bg-[#365332] hover:border-[#365332] active:scale-[0.98]"
                            >
                                <Camera className="h-4 w-4" />
                                <span>Book A Shoot</span>
                            </a>
                            <a
                                href="#reel"
                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#365332] bg-white px-3 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#365332] transition-colors hover:bg-[#365332] hover:text-white active:scale-[0.98]"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                <span>Watch The Reel</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <div className="px-3 sm:px-4 max-w-5xl mx-auto mt-4 space-y-5">
                {/* Jump tabs */}
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
                            className="inline-flex shrink-0 items-center rounded-lg border border-[#141714]/20 bg-white px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#3E443B] transition-colors hover:border-[#365332] hover:text-[#365332]"
                        >
                            {tab.label}
                        </a>
                    ))}
                </nav>

                {/* ═══ THE REEL ═══ */}
                <section
                    id="reel"
                    aria-labelledby="reel-heading"
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-[#141714]/15 bg-white shadow-[0_18px_48px_rgba(20,23,20,0.08)]"
                >
                    <div className="flex items-end justify-between gap-3 border-b border-[#141714]/10 bg-[#FAF9F6] p-4 sm:p-5">
                        <div className="min-w-0">
                            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#365332]">
                                Selected Work
                            </p>
                            <h2
                                id="reel-heading"
                                className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-[#141714]"
                            >
                                The Reel
                            </h2>
                            <p className="mt-1.5 text-xs text-[#61675E]">
                                Recent Loaf Films productions. Pull a frame to watch it.
                            </p>
                        </div>
                        <span className="shrink-0 rounded border border-[#141714]/15 bg-white px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#141714]">
                            {REEL.length} Films
                        </span>
                    </div>
                    <div className="bg-[#141714] px-6 pt-5 pb-3">
                        <FilmStrip entries={REEL} />
                    </div>
                </section>

                {/* ═══ PACKAGES ═══ */}
                <section
                    id="packages"
                    aria-labelledby="packages-heading"
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-[#141714] bg-white shadow-[0_22px_56px_rgba(20,23,20,0.10)]"
                >
                    <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                    <div className="relative border-b border-[#141714]/10 bg-[#FAF9F6] p-4 sm:p-5">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#365332]">
                            Flat Rates · No Surprises
                        </p>
                        <h2
                            id="packages-heading"
                            className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-[#141714]"
                        >
                            Production Packages
                        </h2>
                        <p className="mt-1.5 text-xs text-[#61675E]">
                            Transparent pricing tailored to independent and label-signed artists.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 gap-3 p-3 sm:p-5 md:grid-cols-3 md:gap-4">
                        {packages.map((pkg) => {
                            const PkgIcon = pkg.icon;
                            return (
                                <div
                                    key={pkg.name}
                                    className={`relative flex flex-col rounded-2xl border-2 bg-[#FAF9F6] p-4 ${pkg.frame}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            {pkg.popular && (
                                                <span className="mb-1.5 inline-block rounded bg-[#365332] px-2 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-white">
                                                    Recommended
                                                </span>
                                            )}
                                            <h3 className="font-display text-2xl uppercase leading-none tracking-wider text-[#141714]">
                                                {pkg.name}
                                            </h3>
                                        </div>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#141714]/15 bg-white">
                                            <PkgIcon className={`h-5 w-5 ${pkg.accent}`} />
                                        </div>
                                    </div>

                                    <p className="mt-3 font-mono">
                                        <span className="text-3xl font-bold text-[#141714]">{pkg.price}</span>
                                        <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-[#61675E]">Flat Rate</span>
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed text-[#3E443B]">{pkg.tagline}</p>

                                    <ul className="mt-3 space-y-1.5 border-t border-dashed border-[#141714]/15 pt-3">
                                        {pkg.deliverables.map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-xs text-[#141714]">
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
                                                ? "bg-[#365332] text-white hover:bg-[#141714]"
                                                : "border-2 border-[#141714]/25 bg-white text-[#141714] hover:border-[#141714]"
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
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-[#141714]/15 bg-white shadow-[0_18px_48px_rgba(20,23,20,0.08)]"
                >
                    <div className="border-b border-[#141714]/10 bg-[#FAF9F6] p-4 sm:p-5">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#365332]">
                            Inception To Upload
                        </p>
                        <h2
                            id="process-heading"
                            className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-[#141714]"
                        >
                            The Process
                        </h2>
                        <p className="mt-1.5 text-xs text-[#61675E]">
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
                                    className="flex gap-3 rounded-2xl border border-[#141714]/12 bg-[#FAF9F6] p-3.5"
                                >
                                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-[#141714] bg-[#141714]">
                                        <span className="font-mono text-[10px] font-black leading-none text-white">{number}</span>
                                        <StepIcon className="mt-0.5 h-3 w-3 text-[#9FC096]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-display text-xl uppercase leading-none tracking-wider text-[#141714]">
                                            {title}
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-[#3E443B]">{step.desc}</p>
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
                    className="relative scroll-mt-28 overflow-hidden rounded-[28px] border-2 border-[#141714] bg-white shadow-[0_22px_56px_rgba(20,23,20,0.10)]"
                >
                    <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                    <div className="relative border-b border-[#141714]/10 bg-[#FAF9F6] p-4 sm:p-5">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#365332]">
                            Reply Within 24 Hours
                        </p>
                        <h2
                            id="booking-heading"
                            className="mt-1 font-display text-3xl sm:text-4xl uppercase leading-none tracking-[0.03em] text-[#141714]"
                        >
                            Book Your Shoot
                        </h2>
                        <p className="mt-1.5 text-xs text-[#61675E]">
                            Let&apos;s build your vision. Tell us about the track and we&apos;ll get back to you.
                        </p>
                    </div>

                    <form onSubmit={handleBooking} className="relative mx-auto max-w-xl space-y-4 p-4 sm:p-6">
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
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#141714] bg-[#141714] py-3.5 font-mono text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm transition-colors hover:bg-[#365332] hover:border-[#365332] active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
