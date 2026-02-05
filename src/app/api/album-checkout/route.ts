
import { NextRequest, NextResponse } from "next/server";
import { getAlbumBySlug } from "@/lib/albums";

interface AlbumCheckoutRequest {
    albumName: string;
    albumPrice: number;
    customerEmail: string;
    paymentMethod: 'cashapp';
    cashappTransactionId?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: AlbumCheckoutRequest = await request.json();

        // Validate email
        if (!body.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
            return NextResponse.json(
                { success: false, error: "Valid email is required" },
                { status: 400 }
            );
        }

        // Validate album
        const albumSlug = body.albumName.toLowerCase().replace(/\s+/g, '-');
        const album = getAlbumBySlug(albumSlug);

        if (!album) {
            return NextResponse.json(
                { success: false, error: "Invalid album selected" },
                { status: 400 }
            );
        }

        // Handle Cash App payment (manual confirmation)
        if (body.paymentMethod === 'cashapp') {
            if (!body.cashappTransactionId) {
                return NextResponse.json(
                    { success: false, error: "Cash App transaction ID is required" },
                    { status: 400 }
                );
            }

            // Import email function and send notification
            const { sendAlbumPurchaseNotification, sendAlbumPurchaseConfirmation } = await import("@/lib/email");

            await sendAlbumPurchaseNotification({
                albumName: album.name,
                customerEmail: body.customerEmail,
                paymentMethod: 'Cash App',
                transactionId: body.cashappTransactionId,
                amount: album.price,
            });

            await sendAlbumPurchaseConfirmation({
                albumName: album.name,
                customerEmail: body.customerEmail,
                amount: album.price,
            });

            return NextResponse.json({
                success: true,
                message: "Order received! You'll receive your download link via email shortly.",
            });
        }

        return NextResponse.json(
            { success: false, error: "This endpoint now only supports Cash App. Use PayPal API for cards." },
            { status: 400 }
        );

    } catch (error) {
        console.error("Album checkout error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process checkout" },
            { status: 500 }
        );
    }
}
