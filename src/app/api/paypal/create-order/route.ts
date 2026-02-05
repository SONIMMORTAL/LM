
import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";

// Album data for validation
const ALBUMS: Record<string, { name: string; price: number }> = {
    'the-commission': { name: 'The Commission', price: 9.99 },
    'more-life': { name: 'More Life', price: 9.99 },
    'lost-city': { name: 'Lost City', price: 9.99 },
    'live-from-the-dungeon': { name: 'Live From The Dungeon', price: 9.99 },
};

export async function POST(request: NextRequest) {
    try {
        const { albumName } = await request.json();

        // Validate album
        const albumSlug = albumName.toLowerCase().replace(/\s+/g, '-');
        const album = ALBUMS[albumSlug];

        if (!album) {
            return NextResponse.json(
                { error: "Invalid album selected" },
                { status: 400 }
            );
        }

        const accessToken = await generateAccessToken();
        const url = `${PAYPAL_API_BASE}/v2/checkout/orders`;

        const payload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: album.price.toFixed(2),
                    },
                    description: `Digital Album: ${album.name}`,
                },
            ],
        };

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json(
            { error: "Failed to create order." },
            { status: 500 }
        );
    }
}
