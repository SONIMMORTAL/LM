import { DollarSign, ShoppingBag, TrendingUp, CreditCard, Package } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Create a revalidation interval (e.g., every 60 seconds)
export const revalidate = 60;

async function getSalesData() {
    try {
        // Fetch orders
        const { data: orders, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch order items for product stats
        const { data: orderItems, error: itemsError } = await supabaseAdmin
            .from("order_items")
            .select("*");

        if (itemsError) throw itemsError;

        // Calculate Stats
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        const orderCount = orders.length;
        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
        const productsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

        // Calculate Top Products
        const productStats: Record<string, { sales: number; revenue: number }> = {};

        orderItems.forEach((item) => {
            if (!productStats[item.product_name]) {
                productStats[item.product_name] = { sales: 0, revenue: 0 };
            }
            productStats[item.product_name].sales += item.quantity;
            productStats[item.product_name].revenue += Number(item.price) * item.quantity;
        });

        const topProducts = Object.entries(productStats)
            .map(([name, stats]) => ({
                name,
                sales: stats.sales,
                revenue: `$${stats.revenue.toFixed(2)}`,
                rawRevenue: stats.revenue
            }))
            .sort((a, b) => b.rawRevenue - a.rawRevenue)
            .slice(0, 5);

        // Format Recent Orders
        const recentOrders = orders.slice(0, 10).map((order) => {
            // Find first item name for simplified display
            const orderSpecificItems = orderItems.filter(item => item.order_id === order.id);
            const productDisplay = orderSpecificItems.length > 0
                ? orderSpecificItems[0].product_name + (orderSpecificItems.length > 1 ? ` +${orderSpecificItems.length - 1} more` : "")
                : "Unknown Product";

            return {
                id: order.order_number,
                customer: order.customer_name,
                product: productDisplay,
                amount: `$${Number(order.total).toFixed(2)}`,
                date: new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                status: order.status || "Completed"
            };
        });

        return {
            stats: [
                { title: "Total Revenue", value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "---", changeType: "neutral" as const, icon: DollarSign },
                { title: "Orders", value: orderCount.toString(), change: "---", changeType: "neutral" as const, icon: ShoppingBag },
                { title: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}`, change: "---", changeType: "neutral" as const, icon: CreditCard },
                { title: "Products Sold", value: productsSold.toString(), change: "---", changeType: "neutral" as const, icon: Package },
            ],
            recentOrders,
            topProducts
        };
    } catch (error) {
        console.error("Error fetching sales data:", error);
        return {
            stats: [
                { title: "Total Revenue", value: "$0.00", change: "Error", changeType: "neutral" as const, icon: DollarSign },
                { title: "Orders", value: "0", change: "Error", changeType: "neutral" as const, icon: ShoppingBag },
                { title: "Avg Order Value", value: "$0.00", change: "Error", changeType: "neutral" as const, icon: CreditCard },
                { title: "Products Sold", value: "0", change: "Error", changeType: "neutral" as const, icon: Package },
            ],
            recentOrders: [],
            topProducts: []
        };
    }
}

export default async function SalesPage() {
    const { stats, recentOrders, topProducts } = await getSalesData();

    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Sales</h1>
                <p className="text-noir-ash text-sm">Track orders and revenue</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders - Takes 2 columns */}
                <div className="lg:col-span-2 bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-accent-cyan" />
                        Recent Orders
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-noir-smoke">
                                    <th className="text-left py-2 text-xs font-semibold text-noir-ash uppercase">Order</th>
                                    <th className="text-left py-2 text-xs font-semibold text-noir-ash uppercase">Customer</th>
                                    <th className="text-left py-2 text-xs font-semibold text-noir-ash uppercase">Product</th>
                                    <th className="text-right py-2 text-xs font-semibold text-noir-ash uppercase">Amount</th>
                                    <th className="text-right py-2 text-xs font-semibold text-noir-ash uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-noir-smoke/50">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-noir-slate/30">
                                            <td className="py-3 text-sm font-medium text-accent-cyan">{order.id}</td>
                                            <td className="py-3 text-sm text-foreground">{order.customer}</td>
                                            <td className="py-3 text-sm text-noir-cloud">{order.product}</td>
                                            <td className="py-3 text-sm text-green-400 text-right">{order.amount}</td>
                                            <td className="py-3 text-sm text-noir-ash text-right">{order.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-noir-ash">
                                            No orders found yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent-cyan" />
                        Top Products
                    </h2>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, i) => (
                                <div key={product.name} className="flex items-center gap-3 py-2 border-b border-noir-smoke/50 last:border-0">
                                    <span className="w-6 h-6 flex items-center justify-center bg-noir-slate rounded text-xs font-bold text-accent-cyan">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                                        <p className="text-xs text-noir-ash">{product.sales} sales</p>
                                    </div>
                                    <span className="text-sm font-semibold text-green-400">{product.revenue}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-noir-ash py-8">No product data yet.</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Link to Shopify has been removed */}
        </div>
    );
}
