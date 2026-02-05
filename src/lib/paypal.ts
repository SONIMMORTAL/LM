
const { NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE } = process.env;

// PayPal API URLs - controlled by PAYPAL_MODE environment variable
// Set PAYPAL_MODE=live for production, or leave unset/sandbox for testing
const PAYPAL_SANDBOX_URL = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_URL = "https://api-m.paypal.com";

const base = PAYPAL_MODE === "live" ? PAYPAL_LIVE_URL : PAYPAL_SANDBOX_URL;

/**
 * Generate an OAuth 2.0 access token for the PayPal API.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
export async function generateAccessToken() {
    try {
        if (!NEXT_PUBLIC_PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }

        const auth = Buffer.from(
            NEXT_PUBLIC_PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
        ).toString("base64");

        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
    }
}

export const PAYPAL_API_BASE = base;
