"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const ROTATION_ANGLE_OPEN = 180;
const DROPDOWN_OFFSET = 4;

export interface DropdownItem {
    id: string | number;
    label: string;
    icon?: React.ReactNode;
}

export interface BasicDropdownProps {
    label: string;
    items: DropdownItem[];
    onChange?: (item: DropdownItem) => void;
    className?: string;
    selectedId?: string | number;
}

export default function BasicDropdown({
    label,
    items,
    onChange,
    className = "",
    selectedId,
}: BasicDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DropdownItem | null>(
        selectedId ? items.find(i => i.id === selectedId) || null : null
    );
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const shouldReduceMotion = useReducedMotion();

    // Sync internal state if selectedId prop changes
    useEffect(() => {
        if (selectedId) {
            const item = items.find(i => i.id === selectedId);
            if (item) setSelectedItem(item);
        }
    }, [selectedId, items]);

    const handleItemSelect = (item: DropdownItem) => {
        setSelectedItem(item);
        setIsOpen(false);
        onChange?.(item);
    };

    const calculatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            return {
                top: rect.bottom + DROPDOWN_OFFSET,
                left: rect.left,
                width: rect.width,
            };
        }
        return { top: 0, left: 0, width: 0 };
    }, []);

    const handleToggle = () => {
        if (!isOpen) {
            setPosition(calculatePosition());
        }
        setIsOpen(!isOpen);
    };

    // Close dropdown when page scrolls (not internal menu scroll)
    useEffect(() => {
        if (!isOpen) return;

        const handleScroll = (e: Event) => {
            // If scrolling inside our menu, allow it
            if (menuRef.current && menuRef.current.contains(e.target as Node)) {
                return;
            }
            // Otherwise close the dropdown
            setIsOpen(false);
            setFocusedIndex(-1);
        };

        // Use capture phase to catch scroll before it bubbles
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                menuRef.current &&
                !menuRef.current.contains(target)
            ) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) {
                if (
                    (event.key === "Enter" || event.key === " ") &&
                    document.activeElement === buttonRef.current
                ) {
                    event.preventDefault();
                    handleToggle();
                }
                return;
            }

            if (event.key === "Escape") {
                setIsOpen(false);
                setFocusedIndex(-1);
                buttonRef.current?.focus();
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
            } else if (event.key === "Enter" && focusedIndex >= 0) {
                event.preventDefault();
                const item = items[focusedIndex];
                if (item) {
                    handleItemSelect(item);
                }
            } else if (event.key === "Home") {
                event.preventDefault();
                setFocusedIndex(0);
            } else if (event.key === "End") {
                event.preventDefault();
                setFocusedIndex(items.length - 1);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, items, focusedIndex]);

    // Reset focused index when closed
    useEffect(() => {
        if (!isOpen) {
            setFocusedIndex(-1);
        }
    }, [isOpen]);

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={
                        shouldReduceMotion
                            ? { duration: 0 }
                            : { duration: 0.15, ease: "easeOut" }
                    }
                    className="fixed z-[9999] origin-top rounded-lg border border-white/10 bg-noir-slate/95 backdrop-blur-xl shadow-2xl max-h-[280px] overflow-y-auto overscroll-contain"
                    style={{
                        top: position.top,
                        left: position.left,
                        width: position.width,
                    }}
                >
                    <ul
                        aria-label="Dropdown options"
                        className="py-1"
                        role="listbox"
                    >
                        {items.map((item, index) => (
                            <li
                                key={item.id}
                                role="option"
                                aria-selected={selectedItem?.id === item.id}
                            >
                                <button
                                    aria-label={item.label}
                                    className={`flex min-h-[44px] w-full items-center px-4 py-2 text-left text-sm transition-colors 
                                        ${selectedItem?.id === item.id ? "font-medium text-accent-cyan bg-white/5" : "text-gray-300 hover:text-white hover:bg-white/5"} 
                                        ${index === focusedIndex ? "bg-white/5" : ""}
                                    `}
                                    onClick={() => handleItemSelect(item)}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    type="button"
                                >
                                    {item.icon && <span className="mr-2">{item.icon}</span>}
                                    {item.label}

                                    {selectedItem?.id === item.id && (
                                        <span className="ml-auto">
                                            <svg
                                                className="h-4 w-4 text-accent-cyan"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <title>Selected</title>
                                                <path
                                                    d="M5 13l4 4L19 7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <div className={`relative inline-block ${className}`} ref={dropdownRef}>
                <button
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-label={selectedItem ? `${label}: ${selectedItem.label}` : label}
                    className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-noir-slate/50 px-4 py-2 text-left transition-colors hover:border-accent-cyan/50 hover:bg-noir-slate focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2"
                    id="dropdown-button"
                    onClick={handleToggle}
                    ref={buttonRef}
                    type="button"
                >
                    <span className={`block truncate ${selectedItem ? 'text-white' : 'text-gray-400'}`}>
                        {selectedItem ? selectedItem.label : label}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? ROTATION_ANGLE_OPEN : 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </motion.div>
                </button>
            </div>
            {typeof window !== "undefined"
                ? createPortal(dropdownContent, document.body)
                : null}
        </>
    );
}
