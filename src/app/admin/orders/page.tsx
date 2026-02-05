"use client";

import { Package } from "lucide-react";
import { OrderManagement } from "@/components/admin/OrderManagement";

export default function OrdersPage() {
    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Package className="w-6 h-6 text-accent-cyan" />
                        Order Management
                    </h1>
                    <p className="text-noir-ash text-sm">View, update, and manage all orders</p>
                </div>
            </div>

            {/* Order Management Component */}
            <OrderManagement />
        </div>
    );
}
