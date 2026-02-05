"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VipVerifyPage() {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Auto-submit when all digits entered
    useEffect(() => {
        const fullCode = code.join("");
        if (fullCode.length === 6 && !code.includes("")) {
            handleVerify();
        }
    }, [code]);

    const handleChange = (index: number, value: string) => {
        // Only allow single digit
        if (value.length > 1) {
            value = value.slice(-1);
        }

        // Only allow numbers
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted) {
            const newCode = [...code];
            pasted.split("").forEach((char, i) => {
                if (i < 6) newCode[i] = char;
            });
            setCode(newCode);

            // Focus last filled or next empty
            const focusIndex = Math.min(pasted.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join("");
        if (fullCode.length !== 6) return;

        setIsVerifying(true);
        setError("");

        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 1500));

        // For demo: accept any 6-digit code
        // In production, this would verify against Supabase Auth
        if (fullCode === "000000") {
            setError("Invalid code. Please try again.");
            setIsVerifying(false);
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } else {
            setIsVerified(true);
            setIsVerifying(false);

            // Redirect after animation
            setTimeout(() => {
                // In production: router.push('/vip/content')
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
            <div className="max-w-md w-full px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-3xl"
                >
                    {!isVerified ? (
                        <>
                            {/* Back Link */}
                            <Link
                                href="/vip"
                                className="inline-flex items-center gap-2 text-noir-cloud hover:text-foreground transition-colors mb-6"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Link>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
                                    <Crown className="w-8 h-8 text-amber-500" />
                                </div>
                                <h1 className="text-2xl font-bold uppercase">
                                    Enter Code
                                </h1>
                                <p className="text-noir-cloud text-sm mt-2">
                                    Enter the 6-digit code we sent you
                                </p>
                            </div>

                            {/* OTP Input */}
                            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                                {code.map((digit, index) => (
                                    <motion.input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        disabled={isVerifying}
                                        className={`
                      w-12 h-14 text-center text-2xl font-bold rounded-xl
                      bg-noir-charcoal border-2 text-foreground
                      focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20
                      disabled:opacity-50
                      ${error ? "border-red-500" : "border-noir-smoke"}
                      ${digit ? "border-amber-500/50" : ""}
                    `}
                                        initial={{ scale: 1 }}
                                        animate={{
                                            scale: digit ? [1, 1.05, 1] : 1,
                                        }}
                                        transition={{ duration: 0.2 }}
                                    />
                                ))}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm text-center mb-4"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Verify Button (optional manual trigger) */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleVerify}
                                disabled={code.join("").length !== 6 || isVerifying}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-noir-void font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isVerifying ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-noir-void/30 border-t-noir-void rounded-full"
                                    />
                                ) : (
                                    "Verify Code"
                                )}
                            </motion.button>

                            {/* Resend */}
                            <p className="text-center text-noir-ash text-sm mt-6">
                                Didn&apos;t receive a code?{" "}
                                <button className="text-amber-500 hover:text-amber-400 transition-colors">
                                    Resend
                                </button>
                            </p>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                            >
                                <Check className="w-10 h-10 text-green-500" />
                            </motion.div>

                            <h2 className="text-2xl font-bold uppercase mb-2">
                                Welcome to VIP
                            </h2>
                            <p className="text-noir-cloud mb-6">
                                You now have access to exclusive content
                            </p>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-sm">
                                    <Crown className="w-4 h-4" />
                                    VIP Member
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
