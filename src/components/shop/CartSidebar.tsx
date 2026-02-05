"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";

export function CartSidebar() {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useCart();

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleCheckout = () => {
        setIsCheckoutOpen(true);
    };

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="cart-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-noir-void/80 backdrop-blur-sm"
                            onClick={() => setIsCartOpen(false)}
                        />

                        {/* Sidebar */}
                        <motion.div
                            key="cart-sidebar"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-noir-charcoal border-l border-noir-smoke flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-noir-smoke bg-noir-void/50">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="w-5 h-5 text-accent-cyan" />
                                    <h2 className="text-xl font-bold uppercase tracking-wider">Your Cart</h2>
                                    <span className="bg-noir-slate px-2 py-1 rounded-full text-xs font-bold text-noir-cloud">
                                        {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-2 hover:bg-noir-slate rounded-lg transition-colors text-noir-cloud hover:text-foreground"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-noir-slate/50 flex items-center justify-center">
                                            <ShoppingBag className="w-10 h-10 text-noir-ash" />
                                        </div>
                                        <h3 className="text-lg font-medium text-foreground">Your cart is empty</h3>
                                        <p className="text-noir-cloud max-w-xs">
                                            Looks like you haven't added any gear yet. Check out the latest drop.
                                        </p>
                                        <button
                                            onClick={() => setIsCartOpen(false)}
                                            className="px-6 py-3 bg-noir-slate text-foreground rounded-full font-medium hover:bg-noir-smoke transition-colors mt-4"
                                        >
                                            Back to Shop
                                        </button>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <motion.div
                                            layout
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-4 p-4 rounded-xl bg-noir-void/30 border border-noir-smoke/50"
                                        >
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-noir-slate">
                                                {item.thumbnail ? (
                                                    <Image
                                                        src={item.thumbnail}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-noir-ash bg-noir-smoke">
                                                        <ShoppingBag className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h3 className="font-medium text-foreground truncate pr-2">
                                                            {item.name}
                                                        </h3>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-noir-ash hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-accent-cyan mt-1">
                                                        <span className="text-noir-cloud">{item.variantName}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-3 bg-noir-void rounded-lg p-1 border border-noir-smoke">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1 hover:bg-noir-slate rounded-md transition-colors disabled:opacity-50"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-sm font-medium w-4 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-noir-slate rounded-md transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="font-semibold text-foreground">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || 'USD' }).format(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {cart.length > 0 && (
                                <div className="p-6 border-t border-noir-smoke bg-noir-void/50 space-y-4">
                                    <div className="space-y-2 text-sm text-noir-cloud">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span className="text-foreground font-medium">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cartTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-noir-smoke/50 flex justify-between items-center">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-xl font-bold text-accent-cyan">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cartTotal)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-4 bg-accent-cyan text-noir-void font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                    <p className="text-xs text-center text-noir-ash">
                                        Secure checkout • Fast shipping
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
            />
        </>
    );
}
