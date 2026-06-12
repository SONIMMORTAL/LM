import { NextRequest, NextResponse } from "next/server";
import { sendContactInquiry } from "@/lib/email";
import { RateLimiter } from "@/lib/rate-limit";

const limiter = new RateLimiter(5, 60000); // 5 requests per minute

// Basic HTML escaping
function sanitize(input: string): string {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, inquiryType, message } = body;

        // Rate limiting
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const limitResult = limiter.check(`contact_${ip}`);
        
        if (!limitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                { status: 429, headers: limitResult.headers }
            );
        }

        // Basic validation
        if (!name || !email || !inquiryType || !message) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400, headers: limitResult.headers }
            );
        }

        const success = await sendContactInquiry({
            name: sanitize(name),
            email: sanitize(email),
            inquiryType: sanitize(inquiryType),
            message: sanitize(message),
        });

        if (success) {
            return NextResponse.json({ success: true, message: "Message sent successfully" });
        } else {
            return NextResponse.json(
                { success: false, error: "Failed to send email" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
