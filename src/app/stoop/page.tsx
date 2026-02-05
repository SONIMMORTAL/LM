"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Circle, Smile, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, AuthModal } from "@/components/auth";

// Mock messages - will be replaced with Supabase real-time data
const mockMessages = [
    {
        id: "1",
        username: "shadow_official",
        content: "Yo what's good everyone! Just dropped into the stoop 🔥",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isArtist: true,
    },
    {
        id: "2",
        username: "brooklyn_beats",
        content: "That new track goes crazy!! When's the album dropping?",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        isArtist: false,
    },
    {
        id: "3",
        username: "shadow_official",
        content: "Real soon fam. Working on something special for y'all",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        isArtist: true,
    },
    {
        id: "4",
        username: "noir_vibes",
        content: "Can't wait! The production on Brooklyn Noir is next level",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isArtist: false,
    },
    {
        id: "5",
        username: "stoop_kid_99",
        content: "Any chance of a world tour? Need that live experience",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isArtist: false,
    },
    {
        id: "6",
        username: "shadow_official",
        content: "Brooklyn first, then we taking this worldwide 🌍",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isArtist: true,
    },
];

function ChatMessage({
    message,
    index
}: {
    message: typeof mockMessages[0];
    index: number;
}) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "flex gap-3 py-3 px-4 hover:bg-noir-charcoal/50 transition-colors rounded-xl",
                message.isArtist && "bg-accent-cyan/5"
            )}
        >
            {/* Avatar */}
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold uppercase",
                message.isArtist
                    ? "bg-accent-cyan text-noir-void"
                    : "bg-noir-slate text-noir-cloud"
            )}>
                {message.username.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                        "font-semibold",
                        message.isArtist ? "text-accent-cyan" : "text-foreground"
                    )}>
                        {message.username}
                    </span>
                    {message.isArtist && (
                        <span className="px-1.5 py-0.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded uppercase tracking-wider">
                            Artist
                        </span>
                    )}
                    <span className="text-noir-ash text-xs">
                        {formatTime(message.timestamp)}
                    </span>
                </div>
                <p className="text-foreground/90 break-words">
                    {message.content}
                </p>
            </div>
        </motion.div>
    );
}

export default function StoopPage() {
    const { user, profile } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [messages, setMessages] = useState(mockMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!newMessage.trim()) return;

        const message = {
            id: Date.now().toString(),
            username: profile?.display_name || profile?.username || user.email?.split('@')[0] || "Guest",
            content: newMessage,
            timestamp: new Date(),
            isArtist: false,
        };

        setMessages([...messages, message]);
        setNewMessage("");
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen pt-16 flex flex-col">
            {/* Header */}
            <div className="sticky top-16 z-20 bg-noir-void/95 backdrop-blur-md border-b border-noir-smoke">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                                The Stoop
                                <span className="px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan rounded-full">
                                    Live
                                </span>
                            </h1>
                            <p className="text-noir-cloud text-sm mt-1">
                                Real talk. Brooklyn energy. No cap.
                            </p>
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-noir-cloud" />
                                <span className="text-noir-cloud">
                                    {messages.filter(m => m.isArtist).length > 0 ? (
                                        <span className="text-accent-cyan">Shadow is here</span>
                                    ) : (
                                        "12 online"
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Circle className={cn(
                                    "w-2 h-2 fill-current",
                                    isConnected ? "text-green-500" : "text-red-500"
                                )} />
                                <span className="text-xs text-noir-ash">
                                    {isConnected ? "Connected" : "Reconnecting..."}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="space-y-1">
                        {/* Welcome message */}
                        <div className="text-center py-8 mb-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-accent-cyan/10 flex items-center justify-center mb-4">
                                <span className="text-3xl">🏠</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">
                                Welcome to The Stoop
                            </h2>
                            <p className="text-noir-cloud text-sm max-w-md mx-auto">
                                This is the spot where the community links up.
                                {user ? (
                                    <>
                                        Chatting as <span className="text-accent-cyan">{profile?.display_name || profile?.username || user.email?.split('@')[0]}</span>
                                    </>
                                ) : (
                                    <>
                                        Join the conversation to chat.
                                    </>
                                )}
                            </p>
                        </div>

                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    index={index}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 bg-noir-void/95 backdrop-blur-md border-t border-noir-smoke safe-bottom pb-4 sm:pb-0">
                {!user ? (
                    <div className="max-w-4xl mx-auto px-4 py-6 text-center">
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="px-8 py-3 bg-accent-cyan text-noir-void font-bold rounded-full hover:bg-accent-cyanMuted transition-colors shadow-glow-sm"
                        >
                            Log in to join the conversation
                        </button>
                        <p className="text-noir-ash text-xs mt-3">
                            Join the community to chat with fans and Shadow.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Say something..."
                                    className="w-full px-4 py-3 bg-noir-charcoal rounded-full text-foreground placeholder:text-noir-ash focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 border border-noir-smoke"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button className="p-1.5 text-noir-ash hover:text-foreground transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button className="p-1.5 text-noir-ash hover:text-foreground transition-colors">
                                        <AtSign className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={!newMessage.trim()}
                                className="p-3 bg-accent-cyan rounded-full text-noir-void hover:bg-accent-cyanMuted transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm"
                            >
                                <Send className="w-5 h-5" />
                            </motion.button>
                        </div>
                        <p className="text-center text-noir-ash text-xs mt-3">
                            Be respectful. Keep it real. Brooklyn love only. 💙
                        </p>
                    </div>
                )}
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
}
