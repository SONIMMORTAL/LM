"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

// Inner component that uses useSearchParams
function AdminLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/admin";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push(from);
                router.refresh();
            } else {
                setError("Invalid email or password");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-noir-void p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-noir-charcoal flex items-center justify-center border border-noir-smoke">
                        <Lock className="w-8 h-8 text-accent-cyan" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
                    <p className="text-noir-cloud text-sm mt-1">Sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-ash" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full pl-10 pr-4 py-3 bg-noir-charcoal border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan transition-colors"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-ash" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 bg-noir-charcoal border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan transition-colors"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full py-3 bg-accent-cyan text-noir-void font-semibold rounded-lg hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="text-center text-noir-ash text-xs mt-6">
                    Shadow The Great © 2026
                </p>
            </div>
        </div>
    );
}

// Loading fallback
function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-noir-void">
            <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
        </div>
    );
}

// Main page component with Suspense boundary
export default function AdminLoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <AdminLoginForm />
        </Suspense>
    );
}
