import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { escapeHtml, formatPrice, newSaleEmail, type Sale } from "@/lib/releases";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
/** Shadow's inbox: every sale is announced here */
const SALES_INBOX = process.env.ORDER_NOTIFICATION_EMAIL || "loafrecords1@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "Loaf Records <onboarding@resend.dev>";

async function sendEmail(message: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured — email not sent:", message.subject);
        return false;
    }
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: message.to,
                subject: message.subject,
                html: message.html,
                text: message.text,
                ...(message.replyTo ? { reply_to: message.replyTo } : {}),
            }),
        });
        if (!response.ok) {
            console.error(`Email "${message.subject}" to ${message.to} failed:`, await response.text());
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Email "${message.subject}" to ${message.to} failed:`, error);
        return false;
    }
}

/** Into the admin's orders list: paid for PayPal, pending for Cash App until Shadow checks it */
async function recordSale(sale: Sale): Promise<boolean> {
    try {
        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .insert({
                order_number: `GIG-${Date.now().toString(36).toUpperCase()}`,
                customer_name: sale.buyerName,
                customer_email: sale.buyerEmail,
                customer_phone: "",
                shipping_street: "Digital — send files by email",
                shipping_city: "",
                shipping_state: "",
                shipping_zip: "",
                shipping_country: "",
                subtotal: sale.amount,
                total: sale.amount,
                status: sale.confirmed ? "paid" : "pending",
            })
            .select("id")
            .single();
        if (error || !order) throw error;

        const { error: itemError } = await supabaseAdmin.from("order_items").insert({
            order_id: order.id,
            product_name: sale.release.name,
            variant_name: `${sale.release.kind} · ${sale.method} ${sale.reference}`,
            quantity: 1,
            price: sale.amount,
        });
        if (itemError) throw itemError;
        return true;
    } catch (error) {
        console.error("Couldn't record the sale:", error);
        return false;
    }
}

/**
 * Everything that happens when a release sells: the NEW SALE email to Shadow (reply goes
 * straight to the buyer), a record in the orders list, and a thank-you to the buyer where the
 * email service allows it. The sale is logged in full too, so nothing's lost if email is down.
 */
export async function completeSale(sale: Sale): Promise<{ notified: boolean; recorded: boolean }> {
    console.log("NEW SALE", JSON.stringify({
        release: sale.release.id,
        buyer: sale.buyerName,
        email: sale.buyerEmail,
        amount: sale.amount,
        method: sale.method,
        reference: sale.reference,
        confirmed: sale.confirmed,
    }));

    const announcement = newSaleEmail(sale);
    const [notified, recorded] = await Promise.all([
        sendEmail({ to: SALES_INBOX, replyTo: sale.buyerEmail, ...announcement }),
        recordSale(sale),
    ]);

    const thanks = `Thank you for buying ${sale.release.name} (${formatPrice(sale.amount)}). Shadow will email your files to ${sale.buyerEmail} shortly.`;
    void sendEmail({
        to: sale.buyerEmail,
        subject: `Thank you — ${sale.release.name}`,
        text: `Hey ${sale.buyerName},\n\n${thanks}\n\nLoaf Records`,
        html: `<p>Hey ${escapeHtml(sale.buyerName)},</p><p>${escapeHtml(thanks)}</p><p>Loaf Records</p>`,
    });

    return { notified, recorded };
}
