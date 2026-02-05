import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/supabase/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET - Fetch all orders
export async function GET() {
    try {
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: orders, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch order items
        const { data: orderItems, error: itemsError } = await supabaseAdmin
            .from("order_items")
            .select("*");

        if (itemsError) throw itemsError;

        // Combine orders with their items
        const ordersWithItems = orders.map(order => ({
            ...order,
            items: orderItems.filter(item => item.order_id === order.id)
        }));

        return NextResponse.json({ orders: ordersWithItems });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
    try {
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, status } = await request.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: "orderId and status are required" }, { status: 400 });
        }

        const validStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("orders")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", orderId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Order updated to ${status}` });
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

// DELETE - Delete an order
export async function DELETE(request: NextRequest) {
    try {
        if (!await isAdminAuthenticated()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        // Items will be deleted automatically due to CASCADE
        const { error } = await supabaseAdmin
            .from("orders")
            .delete()
            .eq("id", orderId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Order deleted" });
    } catch (error) {
        console.error("Error deleting order:", error);
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
