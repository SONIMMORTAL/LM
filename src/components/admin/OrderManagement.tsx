"use client";

import { useState, useEffect } from "react";
import { Trash2, Check, X, Loader2, Package, Truck, CheckCircle, Clock, Ban, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderItem {
    id: string;
    product_name: string;
    variant_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_street: string;
    shipping_city: string;
    shipping_state: string;
    shipping_zip: string;
    shipping_country: string;
    subtotal: number;
    total: number;
    status: string;
    printful_order_id?: number;
    created_at: string;
    items: OrderItem[];
}

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-400" },
    { value: "paid", label: "Paid", icon: CheckCircle, color: "text-blue-400" },
    { value: "shipped", label: "Shipped", icon: Truck, color: "text-purple-400" },
    { value: "completed", label: "Completed", icon: Check, color: "text-green-400" },
    { value: "cancelled", label: "Cancelled", icon: Ban, color: "text-red-400" },
];

function getStatusConfig(status: string) {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

export function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    async function fetchOrders() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/orders");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            toast.error("Failed to load orders");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    async function updateStatus(orderId: string, newStatus: string) {
        try {
            const res = await fetch("/api/admin/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update");

            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));
            toast.success(`Order marked as ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update order");
            console.error(err);
        }
    }

    async function deleteOrder(orderId: string) {
        try {
            const res = await fetch("/api/admin/orders", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            if (!res.ok) throw new Error("Failed to delete");

            setOrders(prev => prev.filter(o => o.id !== orderId));
            setConfirmDelete(null);
            toast.success("Order deleted");
        } catch (err) {
            toast.error("Failed to delete order");
            console.error(err);
        }
    }

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(o => o.status === filter);

    const pendingCount = orders.filter(o => o.status === "pending" || o.status === "paid").length;
    const completedCount = orders.filter(o => o.status === "completed" || o.status === "shipped").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
                            ? "bg-accent-cyan text-noir-void"
                            : "bg-noir-slate text-noir-cloud hover:bg-noir-smoke"
                        }`}
                >
                    All ({orders.length})
                </button>
                <button
                    onClick={() => setFilter("pending")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "pending"
                            ? "bg-yellow-500 text-noir-void"
                            : "bg-noir-slate text-noir-cloud hover:bg-noir-smoke"
                        }`}
                >
                    Pending ({orders.filter(o => o.status === "pending").length})
                </button>
                <button
                    onClick={() => setFilter("paid")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "paid"
                            ? "bg-blue-500 text-white"
                            : "bg-noir-slate text-noir-cloud hover:bg-noir-smoke"
                        }`}
                >
                    Paid ({orders.filter(o => o.status === "paid").length})
                </button>
                <button
                    onClick={() => setFilter("completed")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "completed"
                            ? "bg-green-500 text-noir-void"
                            : "bg-noir-slate text-noir-cloud hover:bg-noir-smoke"
                        }`}
                >
                    Completed ({orders.filter(o => o.status === "completed").length})
                </button>
                <button
                    onClick={fetchOrders}
                    className="ml-auto p-2 bg-noir-slate rounded-lg hover:bg-noir-smoke text-noir-cloud"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-noir-ash">
                        No orders found
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={order.id}
                                className="bg-noir-void/50 border border-noir-smoke rounded-xl p-4 hover:border-noir-slate transition-colors"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-accent-cyan font-bold">
                                                {order.order_number}
                                            </span>
                                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-noir-slate ${statusConfig.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                            {order.printful_order_id && (
                                                <span className="text-xs text-noir-ash bg-noir-slate px-2 py-1 rounded">
                                                    Printful #{order.printful_order_id}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-noir-ash">Customer:</span>{" "}
                                                <span className="text-foreground">{order.customer_name}</span>
                                            </div>
                                            <div>
                                                <span className="text-noir-ash">Email:</span>{" "}
                                                <a href={`mailto:${order.customer_email}`} className="text-accent-cyan hover:underline">
                                                    {order.customer_email}
                                                </a>
                                            </div>
                                            <div>
                                                <span className="text-noir-ash">Items:</span>{" "}
                                                <span className="text-foreground">
                                                    {order.items.map(i => `${i.product_name} x${i.quantity}`).join(", ")}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-noir-ash">Total:</span>{" "}
                                                <span className="text-green-400 font-bold">${Number(order.total).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-noir-ash mt-2">
                                            {order.shipping_city}, {order.shipping_state} {order.shipping_zip} • {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {/* Status Dropdown */}
                                        <div className="relative group">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className="appearance-none bg-noir-slate border border-noir-smoke rounded-lg px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:border-accent-cyan cursor-pointer"
                                            >
                                                {STATUS_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-ash pointer-events-none" />
                                        </div>

                                        {/* Delete Button */}
                                        {confirmDelete === order.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                                    title="Confirm Delete"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(null)}
                                                    className="p-2 bg-noir-slate text-noir-cloud rounded-lg hover:bg-noir-smoke"
                                                    title="Cancel"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDelete(order.id)}
                                                className="p-2 bg-noir-slate text-noir-ash rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
