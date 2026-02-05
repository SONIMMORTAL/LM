"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export interface CartItem {
    id: string; // Unique ID (e.g. productID-variantID)
    productId: number;
    variantId: number;
    name: string;
    variantName: string;
    price: number;
    currency: string;
    quantity: number;
    thumbnail: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Hydrate cart from local storage on mount
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Persist cart to local storage
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    const addToCart = (newItem: Omit<CartItem, "id">) => {
        const id = `${newItem.productId}-${newItem.variantId}`;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === id);

            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === id
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            } else {
                return [...prevCart, { ...newItem, id }];
            }
        });

        // Check if item already exists to show appropriate toast
        // and open cart (moved outside setCart to avoid setState during render)
        const existingItem = cart.find((item) => item.id === id);
        if (existingItem) {
            toast.success("Updated quantity in cart");
        } else {
            toast.success("Added to cart");
            setIsCartOpen(true);
        }
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
