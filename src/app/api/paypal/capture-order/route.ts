
import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import { sendAlbumPurchaseConfirmation, sendAlbumPurchaseNotification } from "@/lib/email";
import { getAlbumBySlug } from "@/lib/albums";
import { generateDownloadToken } from "@/lib/token";

export async function POST(request: NextRequest) {
    try {
        const { orderID, albumName, customerEmail } = await request.json();

        // Validate basic inputs
        if (!orderID || !albumName || !customerEmail) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const albumSlug = albumName.toLowerCase().replace(/\s+/g, '-');
        const album = getAlbumBySlug(albumSlug);

        if (!album) {
            return NextResponse.json(
                { error: "Invalid album" },
                { status: 400 }
            );
        }

        const accessToken = await generateAccessToken();
        const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (data.status === "COMPLETED") {
            // Transaction successful!

            // Generate secure download link
            const downloadToken = generateDownloadToken({
                orderId: data.id,
                albumSlug: album.id,
                customerEmail: customerEmail,
            });

            const downloadLink = `${request.nextUrl.origin}/download?token=${downloadToken}`;

            // Send email to customer
            await sendAlbumPurchaseConfirmation({
                albumName: album.name,
                customerEmail: customerEmail,
                amount: album.price,
                downloadLink: downloadLink,
            });

            // Send notification to admin
            await sendAlbumPurchaseNotification({
                albumName: album.name,
                customerEmail: customerEmail,
                amount: album.price,
                paymentMethod: 'PayPal',
                transactionId: data.id, // PayPal Transaction/Order ID
                downloadLink: downloadLink,
            });

            return NextResponse.json(data);
        } else {
            // Handle other statuses (e.g. DECLINED)
            console.error("PayPal Capture Failed:", data);
            return NextResponse.json(
                { error: "Payment not completed", details: data },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Failed to capture order:", error);
        return NextResponse.json(
            { error: "Failed to capture order." },
            { status: 500 }
        );
    }
}
