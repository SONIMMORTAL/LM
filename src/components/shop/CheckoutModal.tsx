"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Loader2, CheckCircle, MapPin, User, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

const initialFormData: FormData = {
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
};

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { cart, cartTotal, clearCart, setIsCartOpen } = useCart();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.street.trim()) newErrors.street = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.zip.trim()) newErrors.zip = "ZIP code is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                    },
                    shipping: {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        zip: formData.zip,
                        country: formData.country,
                    },
                    items: cart.map((item) => ({
                        name: item.name,
                        variantName: item.variantName,
                        variantId: item.variantId, // Printful sync_variant_id
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    subtotal: cartTotal,
                    total: cartTotal,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setOrderNumber(data.orderNumber);
                setOrderComplete(true);
                clearCart();
                toast.success("Order placed successfully!");
            } else {
                toast.error(data.error || "Failed to place order");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (orderComplete) {
            setOrderComplete(false);
            setOrderNumber("");
            setFormData(initialFormData);
            setIsCartOpen(false);
        }
        onClose();
    };

    const inputClasses = (error?: string) =>
        `w-full px-4 py-3 bg-noir-void border ${error ? "border-red-500" : "border-noir-smoke"
        } rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors`;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-noir-void/90 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[60] w-auto md:w-full md:max-w-lg bg-noir-charcoal rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-noir-smoke bg-noir-void/50">
                            <div className="flex items-center gap-3">
                                {!orderComplete && (
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-noir-slate rounded-lg transition-colors text-noir-cloud hover:text-foreground"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <h2 className="text-xl font-bold uppercase tracking-wider">
                                    {orderComplete ? "Order Confirmed" : "Checkout"}
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-noir-slate rounded-lg transition-colors text-noir-cloud hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {orderComplete ? (
                            /* Success State */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1 }}
                                >
                                    <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                                <p className="text-noir-cloud mb-4">
                                    Your order has been placed successfully.
                                </p>
                                <div className="bg-noir-void/50 px-6 py-3 rounded-lg mb-6">
                                    <span className="text-noir-cloud text-sm">Order Number</span>
                                    <p className="text-accent-cyan font-mono font-bold text-lg">
                                        {orderNumber}
                                    </p>
                                </div>
                                <p className="text-sm text-noir-ash max-w-xs">
                                    We&apos;ll send a confirmation email with tracking info once your order ships.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="mt-8 px-8 py-3 bg-accent-cyan text-noir-void font-bold rounded-lg hover:bg-white transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            /* Checkout Form */
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                <div className="p-5 space-y-6">
                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Contact Information
                                        </h3>
                                        <div>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputClasses(errors.name)}
                                            />
                                            {errors.name && (
                                                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-ash" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        placeholder="Email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className={`${inputClasses(errors.email)} pl-10`}
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-ash" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="Phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className={`${inputClasses(errors.phone)} pl-10`}
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Shipping Address
                                        </h3>
                                        <div>
                                            <input
                                                type="text"
                                                name="street"
                                                placeholder="Street Address"
                                                value={formData.street}
                                                onChange={handleChange}
                                                className={inputClasses(errors.street)}
                                            />
                                            {errors.street && (
                                                <p className="text-red-400 text-xs mt-1">{errors.street}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    placeholder="City"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className={inputClasses(errors.city)}
                                                />
                                                {errors.city && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    placeholder="State"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    className={inputClasses(errors.state)}
                                                />
                                                {errors.state && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.state}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    name="zip"
                                                    placeholder="ZIP Code"
                                                    value={formData.zip}
                                                    onChange={handleChange}
                                                    className={inputClasses(errors.zip)}
                                                />
                                                {errors.zip && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.zip}</p>
                                                )}
                                            </div>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className={inputClasses()}
                                            >
                                                <option value="US">United States</option>
                                                <option value="CA">Canada</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="AU">Australia</option>
                                                <option value="DE">Germany</option>
                                                <option value="FR">France</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="space-y-3 pt-4 border-t border-noir-smoke">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-noir-cloud">
                                            Order Summary
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            {cart.map((item) => (
                                                <div key={item.id} className="flex justify-between text-noir-cloud">
                                                    <span>
                                                        {item.name} × {item.quantity}
                                                    </span>
                                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-sm text-noir-cloud pt-2 border-t border-noir-smoke/50">
                                            <span>Subtotal</span>
                                            <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cartTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-noir-cloud">
                                            <span>Shipping</span>
                                            <span>Calculated at fulfillment</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2">
                                            <span>Total</span>
                                            <span className="text-accent-cyan">
                                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cartTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="sticky bottom-0 p-5 border-t border-noir-smoke bg-noir-charcoal">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-accent-cyan text-noir-void font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Place Order"
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-noir-ash mt-3">
                                        Payment details will be sent via email
                                    </p>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
