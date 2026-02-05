"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ThumbsUp, Clock, User, ChevronRight, Plus, TrendingUp, Pin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuth, AuthModal } from "@/components/auth";

// Mock forum data
const forumCategories = [
    { id: "general", name: "General Discussion", icon: "💬", count: 156 },
    { id: "music", name: "Music & Production", icon: "🎵", count: 89 },
    { id: "shows", name: "Shows & Events", icon: "🎤", count: 42 },
    { id: "merch", name: "Merch & Collecting", icon: "👕", count: 31 },
];

const featuredTopics = [
    {
        id: "1",
        title: "More Life Album - First Impressions Thread",
        category: "Music & Production",
        author: "brooklyn_beats",
        replies: 47,
        likes: 128,
        lastActivity: "2h ago",
        isPinned: true,
        isHot: true,
    },
    {
        id: "2",
        title: "Shadow The Great - Jeeps Music Video Breakdown",
        category: "Music & Production",
        author: "noir_vibes",
        replies: 23,
        likes: 67,
        lastActivity: "4h ago",
        isPinned: false,
        isHot: true,
    },
    {
        id: "3",
        title: "NYC Show - Who's Going? Meetup Thread",
        category: "Shows & Events",
        author: "stoop_kid_99",
        replies: 89,
        likes: 45,
        lastActivity: "1h ago",
        isPinned: true,
        isHot: false,
    },
    {
        id: "4",
        title: "Lost City Production Credits & Samples",
        category: "Music & Production",
        author: "beat_detective",
        replies: 12,
        likes: 34,
        lastActivity: "6h ago",
        isPinned: false,
        isHot: false,
    },
    {
        id: "5",
        title: "Vinyl Collection Thread - Show Your Copies!",
        category: "Merch & Collecting",
        author: "wax_collector",
        replies: 56,
        likes: 89,
        lastActivity: "3h ago",
        isPinned: false,
        isHot: true,
    },
    {
        id: "6",
        title: "Best Shadow The Great Verses - Discussion",
        category: "General Discussion",
        author: "lyric_analyst",
        replies: 34,
        likes: 78,
        lastActivity: "5h ago",
        isPinned: false,
        isHot: false,
    },
];

function TopicCard({ topic, index }: { topic: typeof featuredTopics[0]; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group p-4 bg-noir-charcoal/30 hover:bg-noir-charcoal/50 rounded-xl transition-all border border-transparent hover:border-noir-smoke cursor-pointer"
        >
            <div className="flex items-start gap-4">
                {/* Left - Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {topic.isPinned && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded-full">
                                <Pin className="w-3 h-3" />
                                Pinned
                            </span>
                        )}
                        {topic.isHot && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                Hot
                            </span>
                        )}
                        <span className="text-xs text-noir-ash">{topic.category}</span>
                    </div>

                    <h3 className="font-semibold text-foreground group-hover:text-accent-cyan transition-colors mb-2 line-clamp-1">
                        {topic.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-noir-cloud">
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {topic.author}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {topic.lastActivity}
                        </span>
                    </div>
                </div>

                {/* Right - Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-noir-cloud">
                            <MessageSquare className="w-4 h-4" />
                            <span>{topic.replies}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-noir-cloud">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{topic.likes}</span>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-noir-ash group-hover:text-accent-cyan transition-colors" />
                </div>
            </div>
        </motion.div>
    );
}

export default function ForumPage() {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredTopics = activeCategory === "all"
        ? featuredTopics
        : featuredTopics.filter(t => t.category.toLowerCase().includes(activeCategory));

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Hero Section */}
            <section className="px-6 mb-12">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block mb-4 text-accent-cyan text-sm tracking-[0.3em] uppercase">
                            Community
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase mb-4">
                            The Forum
                        </h1>
                        <p className="text-noir-cloud max-w-lg mx-auto mb-6">
                            Connect with the community. Discuss music, share experiences, and stay updated on all things Loaf Records.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (!user) setIsAuthModalOpen(true);
                                }}
                                className="px-6 py-3 bg-accent-cyan text-noir-void font-bold rounded-full flex items-center gap-2 hover:bg-accent-cyanMuted transition-colors shadow-glow-md"
                            >
                                <Plus className="w-5 h-5" />
                                New Topic
                            </motion.button>
                            <Link
                                href="/stoop"
                                className="px-6 py-3 bg-noir-slate text-foreground font-medium rounded-full hover:bg-noir-smoke transition-colors"
                            >
                                Live Chat →
                            </Link>
                        </div>
                    </motion.div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory("all")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all"
                                ? "bg-accent-cyan text-noir-void"
                                : "bg-noir-slate text-noir-cloud hover:text-foreground"
                                }`}
                        >
                            All Topics
                        </motion.button>
                        {forumCategories.map((category) => (
                            <motion.button
                                key={category.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === category.id
                                    ? "bg-accent-cyan text-noir-void"
                                    : "bg-noir-slate text-noir-cloud hover:text-foreground"
                                    }`}
                            >
                                <span>{category.icon}</span>
                                {category.name}
                                <span className="text-xs opacity-70">({category.count})</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Topics List */}
            <section className="px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-noir-smoke flex items-center justify-between">
                            <h2 className="font-bold text-lg uppercase tracking-tight">
                                {activeCategory === "all" ? "Featured Topics" : forumCategories.find(c => c.id === activeCategory)?.name}
                            </h2>
                            <span className="text-sm text-noir-cloud">
                                {filteredTopics.length} topics
                            </span>
                        </div>

                        {/* Topics */}
                        <div className="divide-y divide-noir-smoke/50">
                            <AnimatePresence>
                                {filteredTopics.map((topic, index) => (
                                    <TopicCard key={topic.id} topic={topic} index={index} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Load More */}
                        <div className="px-6 py-4 border-t border-noir-smoke text-center">
                            <button className="text-accent-cyan hover:text-accent-cyanMuted transition-colors text-sm font-medium">
                                Load More Topics
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Stats */}
            <section className="px-6 mt-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Members", value: "2,847" },
                            { label: "Topics", value: "318" },
                            { label: "Replies", value: "4,521" },
                            { label: "Online Now", value: "47" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-4 rounded-xl text-center"
                            >
                                <div className="text-2xl font-bold text-accent-cyan mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-noir-cloud">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
}
