import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import { chargeFor, releaseById } from "@/lib/releases";

/** A PayPal order for God Is Good (the buyer's amount, from $10) or the Audio Book ($25) */
export async function POST(request: NextRequest) {
    try {
        const { productId, amount } = await request.json();
        const release = releaseById(productId);
        if (!release) return NextResponse.json({ error: "Unknown release" }, { status: 400 });

        const charge = chargeFor(release, amount);
        if ("error" in charge) return NextResponse.json({ error: charge.error }, { status: 400 });

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${await generateAccessToken()}` },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        reference_id: release.id,
                        custom_id: release.id,
                        description: `${release.kind}: ${release.name}`,
                        amount: { currency_code: "USD", value: charge.amount.toFixed(2) },
                    },
                ],
                // Nothing to ship: files go out by email
                application_context: { shipping_preference: "NO_SHIPPING", brand_name: "Loaf Records" },
            }),
        });
        const order = await response.json();
        if (!response.ok) {
            console.error("PayPal create-order failed:", order);
            return NextResponse.json({ error: "Couldn't start the PayPal checkout" }, { status: 502 });
        }
        return NextResponse.json({ id: order.id });
    } catch (error) {
        console.error("Release create-order error:", error);
        return NextResponse.json({ error: "Couldn't start the PayPal checkout" }, { status: 500 });
    }
}
