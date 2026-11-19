import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import { checkBuyer, releaseById } from "@/lib/releases";
import { completeSale } from "@/lib/release-sales";

interface Capture {
    id: string;
    status: string;
    custom_id?: string;
    amount?: { value: string; currency_code: string };
}

/**
 * Take the payment. Once PayPal says it's complete, what sold and for how much are read from
 * PayPal's own record of the order — not from the browser — and Shadow gets his NEW SALE email.
 */
export async function POST(request: NextRequest) {
    try {
        const { orderID, buyerName, buyerEmail } = await request.json();
        if (typeof orderID !== "string" || !/^[A-Z0-9]{8,40}$/i.test(orderID)) {
            return NextResponse.json({ error: "Missing order" }, { status: 400 });
        }
        const buyer = checkBuyer(buyerName, buyerEmail);
        if ("error" in buyer) return NextResponse.json({ error: buyer.error }, { status: 400 });

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${await generateAccessToken()}` },
        });
        const data = await response.json();
        if (data.status !== "COMPLETED") {
            console.error("PayPal capture not completed:", data);
            return NextResponse.json({ error: "The payment didn't go through" }, { status: 400 });
        }

        const unit = data.purchase_units?.[0];
        const capture: Capture | undefined = unit?.payments?.captures?.[0];
        const release = releaseById(capture?.custom_id ?? unit?.reference_id);
        const amount = Number(capture?.amount?.value);
        if (!release || !capture || !Number.isFinite(amount) || capture.amount?.currency_code !== "USD") {
            console.error("Captured an order we can't match to a release:", data);
            return NextResponse.json({ error: "Payment taken but the order couldn't be matched — contact us" }, { status: 500 });
        }

        const { notified } = await completeSale({
            release,
            buyerName: buyer.name,
            buyerEmail: buyer.email,
            amount,
            method: "PayPal",
            reference: capture.id,
            confirmed: true,
        });
        return NextResponse.json({ status: "COMPLETED", release: release.id, amount, notified });
    } catch (error) {
        console.error("Release capture-order error:", error);
        return NextResponse.json({ error: "Couldn't complete the payment" }, { status: 500 });
    }
}
