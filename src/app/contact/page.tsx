"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { VideoProductionPackages } from "@/components/contact/VideoProductionPackages";

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
            {/* Video Production Packages */}
            <VideoProductionPackages />

            {/* Contact Form */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-gradient-to-br from-zinc-900/80 to-black/90 backdrop-blur-xl border border-white/10 p-5 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-amber-500"></span>
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
                                        className="w-full px-4 py-3 bg-noir-void rounded-xl text-white placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-white/5 focus:border-amber-500/50 transition-all shadow-inner"
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
                                        className="w-full px-4 py-3 bg-noir-void rounded-xl text-white placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-white/5 focus:border-amber-500/50 transition-all shadow-inner"
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
                                    className="w-full px-4 py-3 bg-noir-void rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-white/5 focus:border-amber-500/50 appearance-none cursor-pointer transition-all shadow-inner"
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
                                    className="w-full px-4 py-3 bg-noir-void rounded-xl text-white placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-white/5 focus:border-amber-500/50 resize-none transition-all shadow-inner"
                                    placeholder="Tell us what you're looking for..."
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-noir-void font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
        </div>
    );
}
