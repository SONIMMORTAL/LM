import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/rate-limit";
import { chargeFor, checkBuyer, releaseById } from "@/lib/releases";
import { completeSale } from "@/lib/release-sales";

// A buyer submits this once; a handful an hour per address is plenty and keeps the inbox clean
const limiter = new RateLimiter(5, 60 * 60 * 1000);

/**
 * A Cash App payment, as the buyer reports it. Cash App can't be checked automatically, so the
 * NEW SALE email tells Shadow to confirm the money arrived before he sends the files.
 */
export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const limit = limiter.check(ip);
    if (!limit.success) {
        return NextResponse.json({ error: "Too many tries — give it an hour, or reach out" }, { status: 429, headers: limit.headers });
    }

    try {
        const { productId, amount, buyerName, buyerEmail, reference } = await request.json();
        const release = releaseById(productId);
        if (!release) return NextResponse.json({ error: "Unknown release" }, { status: 400 });

        const charge = chargeFor(release, amount);
        if ("error" in charge) return NextResponse.json({ error: charge.error }, { status: 400 });

        const buyer = checkBuyer(buyerName, buyerEmail);
        if ("error" in buyer) return NextResponse.json({ error: buyer.error }, { status: 400 });

        const cleanReference = typeof reference === "string" ? reference.trim().slice(0, 80) : "";
        if (cleanReference.length < 2) {
            return NextResponse.json({ error: "Add your $Cashtag or the payment ID so Shadow can find it" }, { status: 400 });
        }

        const { notified } = await completeSale({
            release,
            buyerName: buyer.name,
            buyerEmail: buyer.email,
            amount: charge.amount,
            method: "Cash App",
            reference: cleanReference,
            confirmed: false,
        });
        return NextResponse.json({ success: true, notified });
    } catch (error) {
        console.error("Release Cash App error:", error);
        return NextResponse.json({ error: "Couldn't send your order — try again" }, { status: 500 });
    }
}
