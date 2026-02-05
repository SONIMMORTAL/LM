"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { signIn, signUp, isConfigured } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === "signin") {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    onClose();
                    resetForm();
                }
            } else {
                const { error } = await signUp(email, password, username);
                if (error) {
                    setError(error.message);
                } else {
                    setSuccess("Check your email to confirm your account!");
                }
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setEmail("");
        setPassword("");
        setUsername("");
        setError("");
        setSuccess("");
    }

    function switchMode() {
        setMode(mode === "signin" ? "signup" : "signin");
        resetForm();
    }

    if (!isConfigured) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-void/90 backdrop-blur-sm"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-noir-charcoal border border-noir-smoke rounded-2xl p-6"
                        >
                            <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                                <h2 className="text-xl font-bold text-foreground mb-2">Auth Not Configured</h2>
                                <p className="text-noir-cloud text-sm">
                                    Supabase authentication needs to be set up. Add your credentials to .env.local
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2 bg-noir-slate text-foreground rounded-lg hover:bg-noir-smoke transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-void/90 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-noir-charcoal border border-noir-smoke rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative p-6 pb-0">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 text-noir-ash hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {mode === "signin" ? "Welcome Back" : "Join the Movement"}
                                </h2>
                                <p className="text-noir-cloud text-sm mt-1">
                                    {mode === "signin"
                                        ? "Sign in to access exclusive content"
                                        : "Create an account to join the community"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
                            {mode === "signup" && (
                                <div>
                                    <label className="block text-sm text-noir-cloud mb-1.5">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-ash" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Your username"
                                            className="w-full pl-10 pr-4 py-3 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan transition-colors"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-noir-cloud mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-ash" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan transition-colors"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-noir-cloud mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-ash" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-3 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan transition-colors"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-lg">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 text-green-400 text-sm p-3 bg-green-500/10 rounded-lg">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-accent-cyan text-noir-void font-semibold rounded-lg hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {mode === "signin" ? "Signing in..." : "Creating account..."}
                                    </>
                                ) : (
                                    mode === "signin" ? "Sign In" : "Create Account"
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="px-6 pb-6 text-center">
                            <p className="text-noir-cloud text-sm">
                                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    onClick={switchMode}
                                    className="text-accent-cyan hover:underline font-medium"
                                >
                                    {mode === "signin" ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
