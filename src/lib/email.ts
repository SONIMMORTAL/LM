"use server";

// Email utility using Resend for order notifications
// Sign up at resend.com and add RESEND_API_KEY to .env.local

interface OrderItem {
    name: string;
    variantName: string;
    quantity: number;
    price: number;
}

interface OrderDetails {
    orderNumber: string;
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
    items: OrderItem[];
    subtotal: number;
    total: number;
    createdAt: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ORDER_NOTIFICATION_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || "loafrecords1@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "Shadow The Great <noreply@resend.dev>";

/**
 * Send order notification email to store owner
 */
export async function sendOrderNotification(order: OrderDetails): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured - skipping email notification");
        console.log("Order received:", JSON.stringify(order, null, 2));
        return false;
    }

    const itemsHtml = order.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #333;">
                    <strong>${item.name}</strong><br/>
                    <span style="color: #888;">${item.variantName}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">
                    $${(item.price * item.quantity).toFixed(2)}
                </td>
            </tr>
        `
        )
        .join("");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Order - ${order.orderNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111; color: #fff; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">🛒 NEW ORDER</h1>
                <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">${order.orderNumber}</p>
            </div>
            
            <!-- Customer Details -->
            <div style="padding: 30px;">
                <h2 style="margin: 0 0 15px; font-size: 16px; color: #dc2626; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h2>
                <p style="margin: 0 0 8px;"><strong>Name:</strong> ${order.customer.name}</p>
                <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${order.customer.email}" style="color: #dc2626;">${order.customer.email}</a></p>
                <p style="margin: 0;"><strong>Phone:</strong> ${order.customer.phone}</p>
            </div>
            
            <!-- Shipping Address -->
            <div style="padding: 0 30px 30px;">
                <h2 style="margin: 0 0 15px; font-size: 16px; color: #dc2626; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h2>
                <p style="margin: 0; line-height: 1.6;">
                    ${order.shipping.street}<br/>
                    ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}<br/>
                    ${order.shipping.country}
                </p>
            </div>
            
            <!-- Order Items -->
            <div style="padding: 0 30px 30px;">
                <h2 style="margin: 0 0 15px; font-size: 16px; color: #dc2626; text-transform: uppercase; letter-spacing: 1px;">Order Items</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #dc2626;">
                            <th style="padding: 12px; text-align: left;">Item</th>
                            <th style="padding: 12px; text-align: center;">Qty</th>
                            <th style="padding: 12px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 15px 12px; text-align: right; font-weight: bold; font-size: 18px;">
                                TOTAL:
                            </td>
                            <td style="padding: 15px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #dc2626;">
                                $${order.total.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <!-- Action Button -->
            <div style="padding: 0 30px 30px; text-align: center;">
                <a href="https://www.printful.com/dashboard/orders" 
                   style="display: inline-block; background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                    Fulfill on Printful →
                </a>
            </div>
            
            <!-- Footer -->
            <div style="background: #111; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                Order placed: ${order.createdAt}
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: ORDER_NOTIFICATION_EMAIL,
                subject: `🛒 New Order: ${order.orderNumber} - ${order.customer.name}`,
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to send order notification:", error);
            return false;
        }

        console.log("Order notification sent for:", order.orderNumber);
        return true;
    } catch (error) {
        console.error("Error sending order notification:", error);
        return false;
    }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(order: OrderDetails): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured - skipping confirmation email");
        return false;
    }

    const itemsHtml = order.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #333;">
                    <strong>${item.name}</strong><br/>
                    <span style="color: #888;">${item.variantName}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">
                    $${(item.price * item.quantity).toFixed(2)}
                </td>
            </tr>
        `
        )
        .join("");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${order.orderNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111; color: #fff; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">SHADOW THE GREAT</h1>
                <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9; letter-spacing: 3px;">OFFICIAL MERCH</p>
            </div>
            
            <!-- Thank You -->
            <div style="padding: 30px; text-align: center;">
                <h2 style="margin: 0 0 10px; font-size: 24px;">Thank You, ${order.customer.name.split(" ")[0]}!</h2>
                <p style="margin: 0; color: #888;">We've received your order and will ship it soon.</p>
                <p style="margin: 20px 0 0; padding: 15px 25px; background: #222; display: inline-block; border-radius: 8px;">
                    Order #: <strong style="color: #dc2626;">${order.orderNumber}</strong>
                </p>
            </div>
            
            <!-- Order Items -->
            <div style="padding: 0 30px 30px;">
                <h3 style="margin: 0 0 15px; font-size: 14px; color: #dc2626; text-transform: uppercase; letter-spacing: 1px;">Your Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 15px 12px; text-align: right; font-weight: bold;">
                                Total:
                            </td>
                            <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #dc2626;">
                                $${order.total.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <!-- Shipping To -->
            <div style="padding: 0 30px 30px;">
                <h3 style="margin: 0 0 15px; font-size: 14px; color: #dc2626; text-transform: uppercase; letter-spacing: 1px;">Shipping To</h3>
                <p style="margin: 0; line-height: 1.6; color: #ccc;">
                    ${order.shipping.street}<br/>
                    ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}<br/>
                    ${order.shipping.country}
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #111; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0 0 10px;">Questions? Reply to this email.</p>
                <p style="margin: 0;">© Shadow The Great. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: order.customer.email,
                subject: `Order Confirmed: ${order.orderNumber} - Shadow The Great`,
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to send confirmation email:", error);
            return false;
        }

        console.log("Confirmation email sent to:", order.customer.email);
        return true;
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        return false;
    }
}

/**
 * Album purchase notification interfaces
 */

interface AlbumPurchaseNotification {
    albumName: string;
    customerEmail: string;
    paymentMethod: string;
    transactionId: string;
    amount: number;
    downloadLink?: string;
}

interface AlbumPurchaseConfirmation {
    albumName: string;
    customerEmail: string;
    amount: number;
    downloadLink?: string;
}

/**
 * Send album purchase notification to admin (loafrecords1@gmail.com)
 */
export async function sendAlbumPurchaseNotification(purchase: AlbumPurchaseNotification): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured - skipping album purchase notification");
        console.log("Album purchase received:", JSON.stringify(purchase, null, 2));
        return false;
    }

    const downloadSection = purchase.downloadLink
        ? `<p style="margin: 0 0 10px;"><strong>Download Link Generated:</strong> <a href="${purchase.downloadLink}" style="color: #00FFCC;">View Download Page</a></p>`
        : `<p style="margin: 0 0 10px; color: #ffeb3b;">⚠️ No automatic link generated (Manual fulfillment required)</p>`;

    const actionButton = purchase.downloadLink
        ? `<a href="${purchase.downloadLink}" style="display: inline-block; background: #00FFCC; color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Test Download Link →</a>`
        : `<a href="mailto:${purchase.customerEmail}?subject=Your%20${encodeURIComponent(purchase.albumName)}%20Download&body=Hi!%0A%0AThank%20you%20for%20purchasing%20${encodeURIComponent(purchase.albumName)}!%0A%0AHere%20is%20your%20download%20link%3A%0A[INSERT%20DOWNLOAD%20LINK]%0A%0AEnjoy%20the%20music!%0A%0A-%20Shadow%20The%20Great" 
           style="display: inline-block; background: #00FFCC; color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">📧 Send Download Link →</a>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Album Purchase - ${purchase.albumName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111; color: #fff; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00FFCC 0%, #00B894 100%); padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: #000;">🎵 ALBUM SOLD!</h1>
                <p style="margin: 10px 0 0; font-size: 18px; color: #000; font-weight: bold;">${purchase.albumName}</p>
            </div>
            
            <!-- Purchase Details -->
            <div style="padding: 30px;">
                <h2 style="margin: 0 0 20px; font-size: 16px; color: #00FFCC; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h2>
                
                <div style="background: #222; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px;"><strong>Email:</strong> 
                        <a href="mailto:${purchase.customerEmail}" style="color: #00FFCC; font-size: 18px;">${purchase.customerEmail}</a>
                    </p>
                    <p style="margin: 0 0 10px;"><strong>Payment Method:</strong> ${purchase.paymentMethod}</p>
                    <p style="margin: 0 0 10px;"><strong>Transaction ID:</strong> <code style="background: #333; padding: 4px 8px; border-radius: 4px;">${purchase.transactionId}</code></p>
                    <p style="margin: 0 0 10px;"><strong>Amount:</strong> <span style="color: #00FFCC; font-size: 20px; font-weight: bold;">$${purchase.amount.toFixed(2)}</span></p>
                    ${downloadSection}
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin-top: 30px;">
                    ${actionButton}
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #111; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                Payment received via ${purchase.paymentMethod}
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: ORDER_NOTIFICATION_EMAIL,
                subject: `🎵 Album Sold: ${purchase.albumName} - ${purchase.customerEmail}`,
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to send album purchase notification:", error);
            return false;
        }

        console.log("Album purchase notification sent for:", purchase.albumName);
        return true;
    } catch (error) {
        console.error("Error sending album purchase notification:", error);
        return false;
    }
}

/**
 * Send album purchase confirmation to customer
 */
export async function sendAlbumPurchaseConfirmation(purchase: AlbumPurchaseConfirmation): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured - skipping album confirmation email");
        return false;
    }

    const nextStepsContent = purchase.downloadLink
        ? `
            <div style="background: #222; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="margin: 0 0 15px; font-size: 14px; color: #00FFCC; text-transform: uppercase; letter-spacing: 1px;">Download Your Music</h3>
                <p style="margin: 0 0 20px; color: #ccc; line-height: 1.6;">
                    Your album is ready for download! Click the button below to access your high-quality files.
                </p>
                <a href="${purchase.downloadLink}" 
                   style="display: inline-block; background: #00FFCC; color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                    Download Now →
                </a>
                <p style="margin: 15px 0 0; font-size: 12px; color: #666;">
                    Link valid for 7 days. Save your files after downloading.
                </p>
            </div>
        `
        : `
            <div style="background: #222; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="margin: 0 0 10px; font-size: 14px; color: #00FFCC; text-transform: uppercase; letter-spacing: 1px;">What's Next?</h3>
                <p style="margin: 0; color: #ccc; line-height: 1.6;">
                    Your high-quality WAV files will be sent to this email address shortly. 
                    Please allow up to 24 hours for delivery.
                </p>
            </div>
        `;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Purchase Confirmed - ${purchase.albumName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111; color: #fff; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00FFCC 0%, #00B894 100%); padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; color: #000;">SHADOW THE GREAT</h1>
                <p style="margin: 10px 0 0; font-size: 14px; color: #000; letter-spacing: 3px; font-weight: 500;">OFFICIAL MUSIC</p>
            </div>
            
            <!-- Thank You -->
            <div style="padding: 30px; text-align: center;">
                <h2 style="margin: 0 0 10px; font-size: 24px;">Thank You! 🎵</h2>
                <p style="margin: 0; color: #888;">Your purchase of <strong style="color: #00FFCC;">${purchase.albumName}</strong> is confirmed.</p>
                <p style="margin: 20px 0 0; padding: 15px 25px; background: #222; display: inline-block; border-radius: 8px;">
                    Total: <strong style="color: #00FFCC; font-size: 20px;">$${purchase.amount.toFixed(2)}</strong>
                </p>
            </div>
            
            <!-- Next Steps -->
            <div style="padding: 0 30px 30px;">
                ${nextStepsContent}
            </div>
            
            <!-- Footer -->
            <div style="background: #111; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0 0 10px;">Questions? Reply to this email.</p>
                <p style="margin: 0;">© Shadow The Great. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: purchase.customerEmail,
                subject: `Your ${purchase.albumName} Purchase is Confirmed! 🎵`,
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to send album confirmation email:", error);
            return false;
        }

        console.log("Album confirmation email sent to:", purchase.customerEmail);
        return true;
    } catch (error) {
        console.error("Error sending album confirmation email:", error);
        return false;
    }
}


/**
 * Contact Form Inquiry Interface
 */
interface ContactInquiry {
    name: string;
    email: string;
    inquiryType: string;
    message: string;
}

/**
 * Send contact inquiry to admin
 */
export async function sendContactInquiry(data: ContactInquiry): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured - skipping contact inquiry email");
        console.log("Contact inquiry received:", JSON.stringify(data, null, 2));
        return false;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Contact Inquiry - ${data.inquiryType}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111; color: #fff; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: #fff;">📬 NEW INQUIRY</h1>
                <p style="margin: 10px 0 0; font-size: 16px; color: #fff; font-weight: bold; opacity: 0.9;">${data.inquiryType}</p>
            </div>
            
            <!-- Message Details -->
            <div style="padding: 30px;">
                <div style="background: #222; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px;"><strong>From:</strong> ${data.name}</p>
                    <p style="margin: 0 0 10px;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #60a5fa;">${data.email}</a></p>
                    <hr style="border: 0; border-top: 1px solid #333; margin: 15px 0;" />
                    <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin-top: 30px;">
                    <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.inquiryType)}" 
                       style="display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        Reply to ${data.name.split(' ')[0]} →
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #111; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                Sent from Loaf Records Contact Form
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: ORDER_NOTIFICATION_EMAIL,
                subject: `📬 Inquiry: ${data.inquiryType} from ${data.name}`,
                reply_to: data.email,
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to send contact inquiry:", error);
            return false;
        }

        console.log("Contact inquiry sent from:", data.email);
        return true;
    } catch (error) {
        console.error("Error sending contact inquiry:", error);
        return false;
    }
}
