import { NextRequest, NextResponse } from "next/server";
import { sendContactInquiry } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, inquiryType, message } = body;

        // Basic validation
        if (!name || !email || !inquiryType || !message) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400 }
            );
        }

        const success = await sendContactInquiry({
            name,
            email,
            inquiryType,
            message,
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
