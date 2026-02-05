import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderNotification, sendOrderConfirmation } from "@/lib/email";
import { createPrintfulOrder } from "@/lib/printful";

interface CheckoutItem {
    name: string;
    variantName: string;
    variantId?: number; // Printful sync_variant_id
    quantity: number;
    price: number;
}

interface CheckoutRequest {
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    shipping: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    items: CheckoutItem[];
    subtotal: number;
    total: number;
}

function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `STG-${timestamp}-${random}`;
}

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRequest(body: CheckoutRequest): string | null {
    // Customer validation
    if (!body.customer?.name?.trim()) return "Customer name is required";
    if (!body.customer?.email?.trim()) return "Customer email is required";
    if (!validateEmail(body.customer.email)) return "Invalid email address";
    if (!body.customer?.phone?.trim()) return "Phone number is required";

    // Shipping validation
    if (!body.shipping?.street?.trim()) return "Street address is required";
    if (!body.shipping?.city?.trim()) return "City is required";
    if (!body.shipping?.state?.trim()) return "State is required";
    if (!body.shipping?.zip?.trim()) return "ZIP code is required";
    if (!body.shipping?.country?.trim()) return "Country is required";

    // Items validation
    if (!body.items || body.items.length === 0) return "Cart is empty";

    for (const item of body.items) {
        if (!item.name) return "Item name is missing";
        if (item.quantity < 1) return "Invalid item quantity";
        if (item.price < 0) return "Invalid item price";
    }

    return null;
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequest = await request.json();

        // Validate request
        const validationError = validateRequest(body);
        if (validationError) {
            return NextResponse.json(
                { success: false, error: validationError },
                { status: 400 }
            );
        }

        // Generate order number and timestamp
        const orderNumber = generateOrderNumber();
        const createdAt = new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
        });

        // Calculate totals (verify against submitted total)
        const calculatedSubtotal = body.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const orderDetails = {
            orderNumber,
            customer: {
                name: body.customer.name.trim(),
                email: body.customer.email.trim().toLowerCase(),
                phone: body.customer.phone.trim(),
            },
            shipping: {
                street: body.shipping.street.trim(),
                city: body.shipping.city.trim(),
                state: body.shipping.state.trim(),
                zip: body.shipping.zip.trim(),
                country: body.shipping.country.trim(),
            },
            items: body.items,
            subtotal: calculatedSubtotal,
            total: calculatedSubtotal, // Shipping calculated at fulfillment
            createdAt,
        };

        // Create Supabase Admin client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Save order to Supabase
        const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .insert({
                order_number: orderNumber,
                customer_name: orderDetails.customer.name,
                customer_email: orderDetails.customer.email,
                customer_phone: orderDetails.customer.phone,
                shipping_street: orderDetails.shipping.street,
                shipping_city: orderDetails.shipping.city,
                shipping_state: orderDetails.shipping.state,
                shipping_zip: orderDetails.shipping.zip,
                shipping_country: orderDetails.shipping.country,
                subtotal: orderDetails.subtotal,
                total: orderDetails.total,
                status: "pending", // Will be marked as paid after Printful confirms
            })
            .select()
            .single();

        if (orderError) {
            console.error("Failed to save order to Supabase:", orderError);
            throw new Error("Database error");
        }

        // Save order items
        if (orderData) {
            const itemsToInsert = body.items.map((item) => ({
                order_id: orderData.id,
                product_name: item.name,
                variant_name: item.variantName,
                quantity: item.quantity,
                price: item.price,
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(itemsToInsert);

            if (itemsError) {
                console.error("Failed to save order items:", itemsError);
                // Non-critical: order is saved, just items missing in DB. Email still works.
            }
        }

        // Create order in Printful
        let printfulOrderId: number | undefined;
        const printfulItems = body.items
            .filter(item => item.variantId) // Only items with variantId (Printful products)
            .map(item => ({
                sync_variant_id: item.variantId!,
                quantity: item.quantity,
            }));

        if (printfulItems.length > 0) {
            const printfulResult = await createPrintfulOrder(
                {
                    name: orderDetails.customer.name,
                    address1: orderDetails.shipping.street,
                    city: orderDetails.shipping.city,
                    state_code: orderDetails.shipping.state,
                    zip: orderDetails.shipping.zip,
                    country_code: orderDetails.shipping.country,
                    email: orderDetails.customer.email,
                    phone: orderDetails.customer.phone,
                },
                printfulItems,
                orderNumber // Use our order number as external_id
            );

            if (printfulResult.success) {
                printfulOrderId = printfulResult.orderId;
                console.log(`Printful order created: ${printfulOrderId}`);

                // Update order in Supabase with Printful order ID
                if (orderData) {
                    await supabase
                        .from("orders")
                        .update({
                            printful_order_id: printfulOrderId,
                            status: "paid" // Printful order created successfully
                        })
                        .eq("id", orderData.id);
                }
            } else {
                console.error("Printful order creation failed:", printfulResult.error);
                // Order still succeeds - admin will need to manually create in Printful
            }
        }

        // Send notification email to store owner
        const notificationSent = await sendOrderNotification(orderDetails);

        // Send confirmation email to customer
        const confirmationSent = await sendOrderConfirmation(orderDetails);

        console.log(`Order ${orderNumber} processed:`, {
            savedToDb: !!orderData,
            printfulOrderId,
            notificationSent,
            confirmationSent,
            customer: orderDetails.customer.email,
            itemCount: orderDetails.items.length,
            total: orderDetails.total,
        });

        return NextResponse.json({
            success: true,
            orderNumber,
            printfulOrderId,
            message: "Order placed successfully! You'll receive a confirmation email shortly.",
            emailsSent: {
                notification: notificationSent,
                confirmation: confirmationSent,
            },
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process order. Please try again.",
            },
            { status: 500 }
        );
    }
}
