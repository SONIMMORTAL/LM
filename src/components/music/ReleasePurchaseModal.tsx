"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, CreditCard, DollarSign, Loader2, X } from "lucide-react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { chargeFor, checkBuyer, formatPrice, type ReleaseProduct } from "@/lib/releases";
import { cn } from "@/lib/utils";

const CASHTAG = process.env.NEXT_PUBLIC_CASHAPP_CASHTAG || "$LoafRecords";
/** Quick picks for name-your-price; any amount from the floor up works */
const SUGGESTED = [10, 20, 50, 100];

interface ReleasePurchaseModalProps {
    release: ReleaseProduct | null;
    onClose: () => void;
}

const field =
    "w-full rounded-xl border-2 border-[#141714]/15 bg-white px-3.5 py-3 text-[15px] text-[#141714] placeholder:text-[#61675E]/70 focus:border-[#365332] focus:outline-none";
const label = "mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#61675E]";

/**
 * Checkout for God Is Good (name your price, from $10) and the Audio Book ($25): who's buying,
 * then PayPal or Cash App. Either way Shadow gets a NEW SALE email with the buyer's name and
 * email and sends the files himself, which is what the thank-you screen promises.
 */
export function ReleasePurchaseModal({ release, onClose }: ReleasePurchaseModalProps) {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const [amount, setAmount] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [method, setMethod] = useState<"paypal" | "cashapp">("paypal");
    const [reference, setReference] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<{ amount: number } | null>(null);

    // A fresh form each time it opens
    useEffect(() => {
        if (!release) return;
        setAmount(release.price === undefined ? String(release.minPrice) : "");
        setError(null);
        setDone(null);
        setReference("");
    }, [release]);

    // Escape closes it
    useEffect(() => {
        if (!release) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [release, onClose]);

    const nameYourPrice = release?.price === undefined;
    const charge = release ? chargeFor(release, amount === "" ? undefined : amount) : null;
    const buyer = checkBuyer(name, email);
    const ready = charge !== null && !("error" in charge) && !("error" in buyer);
    const total = charge && "amount" in charge ? charge.amount : null;

    const submitCashApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!release || !ready || total === null) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/release/cashapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: release.id, amount: total, buyerName: name, buyerEmail: email, reference }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");
            setDone({ amount: total });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AnimatePresence>
            {release && (
                <>
                    <motion.div
                        key="scrim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-[#141714]/60 backdrop-blur-sm"
                    />
                    <motion.div
                        key="sheet"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="release-checkout-title"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="fixed inset-x-0 bottom-0 z-[61] mx-auto max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-2 border-[#141714] bg-[#FAF9F6] text-[#141714] shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
                    >
                        <div aria-hidden className="tiger-camo-strip h-2 w-full" />
                        <div className="flex items-center gap-3.5 border-b-2 border-[#141714]/10 p-4">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-[#141714]/15">
                                <Image src={release.cover} alt="" fill sizes="64px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={label}>{release.kind}</p>
                                <h2 id="release-checkout-title" className="font-display text-2xl uppercase leading-none tracking-wide">
                                    {release.name}
                                </h2>
                                <p className="mt-1 text-sm text-[#3E443B]">
                                    {nameYourPrice ? `Name your price · from ${formatPrice(release.minPrice)}` : formatPrice(release.minPrice)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close checkout"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#141714]/15 hover:bg-[#141714] hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {done ? (
                            <div className="space-y-3 p-6 text-center">
                                <CheckCircle className="mx-auto h-12 w-12 text-[#365332]" />
                                <h3 className="font-display text-3xl uppercase tracking-wide">Thank you, {name.split(" ")[0]}!</h3>
                                <p className="text-[15px] leading-relaxed text-[#3E443B]">
                                    {method === "paypal" ? "Your payment of " : "Your Cash App payment of "}
                                    <strong>{formatPrice(done.amount)}</strong> for {release.name} is in. Shadow will email your files to{" "}
                                    <strong>{email}</strong> shortly.
                                </p>
                                {method === "cashapp" && (
                                    <p className="text-sm text-[#61675E]">He&apos;ll match it to your Cash App payment first.</p>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-2 w-full rounded-xl bg-[#141714] py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white"
                                >
                                    Back to the music
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5 p-4 sm:p-5">
                                {nameYourPrice && (
                                    <div>
                                        <label htmlFor="release-amount" className={label}>
                                            Your price (USD, {formatPrice(release.minPrice)} or more)
                                        </label>
                                        <div className="mb-2 grid grid-cols-4 gap-2">
                                            {SUGGESTED.map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setAmount(String(value))}
                                                    className={cn(
                                                        "rounded-xl border-2 py-2.5 font-mono text-sm font-bold",
                                                        Number(amount) === value
                                                            ? "border-[#141714] bg-[#141714] text-white"
                                                            : "border-[#141714]/15 bg-white hover:border-[#365332]"
                                                    )}
                                                >
                                                    ${value}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[15px] text-[#61675E]">$</span>
                                            <input
                                                id="release-amount"
                                                inputMode="decimal"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                                                className={cn(field, "pl-7 font-mono")}
                                                placeholder={String(release.minPrice)}
                                            />
                                        </div>
                                        {charge && "error" in charge && amount !== "" && (
                                            <p className="mt-1.5 text-sm text-[#9B2C1F]">{charge.error}</p>
                                        )}
                                    </div>
                                )}

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="release-name" className={label}>Your name</label>
                                        <input id="release-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="First and last" />
                                    </div>
                                    <div>
                                        <label htmlFor="release-email" className={label}>Email for your files</label>
                                        <input id="release-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@example.com" />
                                    </div>
                                </div>

                                <div>
                                    <p className={label}>Pay with</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(
                                            [
                                                { id: "paypal", text: "PayPal / Card", Icon: CreditCard },
                                                { id: "cashapp", text: "Cash App", Icon: DollarSign },
                                            ] as const
                                        ).map(({ id, text, Icon }) => (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => setMethod(id)}
                                                aria-pressed={method === id}
                                                className={cn(
                                                    "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold",
                                                    method === id ? "border-[#141714] bg-[#141714] text-white" : "border-[#141714]/15 bg-white hover:border-[#365332]"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="rounded-xl bg-[#9B2C1F]/10 px-3.5 py-2.5 text-sm text-[#9B2C1F]">{error}</p>}

                                {!ready ? (
                                    <p className="rounded-xl border-2 border-dashed border-[#141714]/15 px-3.5 py-4 text-center text-sm text-[#61675E]">
                                        {"error" in buyer && (name || email) ? buyer.error : "Add your name and email to pay"}
                                    </p>
                                ) : method === "paypal" ? (
                                    <div className="min-h-[120px]">
                                        <PayPalScriptProvider options={{ clientId: paypalClientId || "sb", currency: "USD", intent: "capture" }}>
                                            <PayPalButtons
                                                style={{ layout: "vertical", color: "black", shape: "rect", label: "pay" }}
                                                forceReRender={[total, name, email]}
                                                createOrder={async () => {
                                                    setError(null);
                                                    const res = await fetch("/api/release/paypal/create-order", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ productId: release.id, amount: total }),
                                                    });
                                                    const order = await res.json();
                                                    if (!res.ok || !order.id) {
                                                        setError(order.error || "Couldn't start the PayPal checkout");
                                                        throw new Error(order.error);
                                                    }
                                                    return order.id;
                                                }}
                                                onApprove={async (data) => {
                                                    setBusy(true);
                                                    try {
                                                        const res = await fetch("/api/release/paypal/capture-order", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ orderID: data.orderID, buyerName: name, buyerEmail: email }),
                                                        });
                                                        const result = await res.json();
                                                        if (!res.ok || result.status !== "COMPLETED") throw new Error(result.error || "The payment didn't go through");
                                                        setDone({ amount: result.amount });
                                                    } catch (err) {
                                                        setError(err instanceof Error ? err.message : "The payment didn't go through");
                                                    } finally {
                                                        setBusy(false);
                                                    }
                                                }}
                                                onError={() => setError("PayPal ran into a problem. Try again, or use Cash App.")}
                                            />
                                        </PayPalScriptProvider>
                                        {busy && (
                                            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-[#61675E]">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment…
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={submitCashApp} className="space-y-3">
                                        <div className="rounded-xl border-2 border-[#141714]/15 bg-white p-3.5 text-[15px] leading-relaxed">
                                            <p>
                                                1. Send <strong>{total !== null ? formatPrice(total) : ""}</strong> to{" "}
                                                <strong className="text-[#00A84F]">{CASHTAG}</strong> in Cash App.
                                            </p>
                                            <p>2. Put &ldquo;{release.name}&rdquo; in the note.</p>
                                            <p>3. Tell us your $Cashtag or the payment ID so Shadow can match it.</p>
                                        </div>
                                        <input
                                            required
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value)}
                                            className={field}
                                            placeholder="$YourCashtag or payment ID"
                                            aria-label="Your $Cashtag or Cash App payment ID"
                                        />
                                        <button
                                            type="submit"
                                            disabled={busy || reference.trim().length < 2}
                                            className="flex w-full items-center justify-center rounded-xl bg-[#00A84F] py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-50"
                                        >
                                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "I've sent it"}
                                        </button>
                                    </form>
                                )}

                                <p className="text-center text-xs text-[#61675E]">
                                    Shadow emails your files to the address above once your payment is in.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
