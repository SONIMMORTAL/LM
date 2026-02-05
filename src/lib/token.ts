
import { createHmac, timingSafeEqual } from 'crypto';

// Use a stable secret key for signing tokens. 
// In production, this should be a dedicated env var, but re-using SERVICE_ROLE_KEY or NEXTAUTH_SECRET is common for simple apps.
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-secret-key';

interface TokenPayload {
    orderId: string;
    albumSlug: string;
    customerEmail: string;
    exp: number; // Expiration timestamp
}

export function generateDownloadToken(payload: Omit<TokenPayload, 'exp'>, expiresInSeconds = 7 * 24 * 60 * 60): string {
    const exp = Date.now() + (expiresInSeconds * 1000);
    const fullPayload = { ...payload, exp };

    const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = createHmac('sha256', SECRET_KEY).update(data).digest('base64url');

    return `${data}.${signature}`;
}

export function verifyDownloadToken(token: string): TokenPayload | null {
    try {
        const [data, signature] = token.split('.');
        if (!data || !signature) return null;

        const expectedSignature = createHmac('sha256', SECRET_KEY).update(data).digest('base64url');

        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
            return null;
        }

        const payload: TokenPayload = JSON.parse(Buffer.from(data, 'base64url').toString());

        if (Date.now() > payload.exp) {
            return null; // Expired
        }

        return payload;
    } catch (error) {
        console.error('Token verification error:', error);
        return null; // Invalid
    }
}
