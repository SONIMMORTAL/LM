"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Send, Instagram, Youtube, Music2, Disc3, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const socialLinks = [
    {
        name: "Instagram",
        handle: "@loafrecords",
        url: "https://instagram.com/loafrecords",
        icon: Instagram,
        color: "from-purple-500 to-pink-500",
    },
    {
        name: "YouTube",
        handle: "@LoafRecords",
        url: "https://www.youtube.com/@LoafRecords",
        icon: Youtube,
        color: "from-red-500 to-red-600",
    },
    {
        name: "SoundCloud",
        handle: "loafmuzik",
        url: "https://soundcloud.com/loafmuzik",
        icon: Disc3,
        color: "from-orange-500 to-orange-600",
    },
    {
        name: "Spotify",
        handle: "Shadow The Great",
        url: "https://open.spotify.com/artist/2BvJc1CBYB5KRCzJfweIiK",
        icon: Music2,
        color: "from-green-500 to-green-600",
    },
    {
        name: "Apple Music",
        handle: "Loaf Muzik",
        url: "https://music.apple.com/us/artist/loaf-muzik/1060484178",
        icon: Music2,
        color: "from-pink-500 to-red-500",
    },
    {
        name: "Facebook",
        handle: "Loaf Records",
        url: "https://www.facebook.com/loafrecords",
        icon: Music2, // Using Music2 as generic icon or import Facebook if available
        color: "from-blue-500 to-blue-600",
    },
];

const inquiryTypes = [
    "General Inquiry",
    "Booking / Features",
    "Press / Media",
    "Business / Licensing",
    "Merch Support",
    "Other",
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        inquiryType: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(
                    <span>
                        Message sent! <strong>We'll get back to you soon.</strong>
                    </span>
                );
                setFormData({ name: "", email: "", inquiryType: "", message: "" });
            } else {
                toast.error(data.error || "Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Hero Section */}
            <section className="px-6 mb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-block mb-4 text-accent-cyan text-sm tracking-[0.3em] uppercase">
                            Get In Touch
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase mb-4">
                            Contact
                        </h1>
                        <p className="text-noir-cloud max-w-lg mx-auto">
                            For bookings, press inquiries, and business opportunities.
                            We'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        <div className="glass-card p-5 sm:p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">
                                Send a Message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-noir-cloud mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-noir-charcoal rounded-xl text-foreground placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 border border-noir-smoke"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-noir-cloud mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-noir-charcoal rounded-xl text-foreground placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 border border-noir-smoke"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-noir-cloud mb-2">
                                        Inquiry Type
                                    </label>
                                    <select
                                        name="inquiryType"
                                        value={formData.inquiryType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-noir-charcoal rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 border border-noir-smoke appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>
                                            Select inquiry type
                                        </option>
                                        {inquiryTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-noir-cloud mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-noir-charcoal rounded-xl text-foreground placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 border border-noir-smoke resize-none"
                                        placeholder="Tell us what you're looking for..."
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 bg-accent-cyan text-noir-void font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent-cyanMuted transition-colors shadow-glow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-noir-void/30 border-t-noir-void rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Contact Info & Socials */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Direct Contact */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-lg font-bold uppercase tracking-tight mb-4">
                                Direct Contact
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-noir-cloud">Email</p>
                                        <a
                                            href="mailto:contact@loafrecords.com"
                                            className="text-foreground hover:text-accent-cyan transition-colors"
                                        >
                                            contact@loafrecords.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-noir-cloud">Location</p>
                                        <p className="text-foreground">Brooklyn, NY</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-lg font-bold uppercase tracking-tight mb-4">
                                Follow Us
                            </h3>
                            <div className="space-y-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-noir-charcoal/50 hover:bg-noir-charcoal transition-colors group"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${social.color} flex items-center justify-center`}
                                        >
                                            <social.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground group-hover:text-accent-cyan transition-colors">
                                                {social.name}
                                            </p>
                                            <p className="text-sm text-noir-cloud">{social.handle}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-noir-ash group-hover:text-accent-cyan transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-lg font-bold uppercase tracking-tight mb-4">
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href="/shop"
                                    className="block py-2 text-noir-cloud hover:text-accent-cyan transition-colors"
                                >
                                    → Official Store
                                </Link>
                                <a
                                    href="/music"
                                    className="block py-2 text-noir-cloud hover:text-accent-cyan transition-colors"
                                >
                                    → Discography
                                </a>
                                <a
                                    href="/videos"
                                    className="block py-2 text-noir-cloud hover:text-accent-cyan transition-colors"
                                >
                                    → Music Videos
                                </a>
                                <a
                                    href="/stoop"
                                    className="block py-2 text-noir-cloud hover:text-accent-cyan transition-colors"
                                >
                                    → The Stoop (Community)
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
