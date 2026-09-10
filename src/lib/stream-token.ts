import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Streaming tokens. These replace the raw Supabase `getPublicUrl()` links that
 * used to be embedded in the music page and /api/music payload — those were
 * permanent, unauthenticated links to the full-quality masters of albums we
 * sell, so anyone could read one out of the HTML and keep it.
 *
 * A token names a storage object without revealing where it lives. The
 * /api/stream route verifies it and mints a short-lived Supabase signed URL at
 * playback time, so nothing durable ever reaches the client.
 *
 * NOTE: this only actually gates the audio once the storage buckets are set to
 * private in the Supabase dashboard. While they stay public, the old
 * `/storage/v1/object/public/...` paths still resolve for anyone who knows a
 * bucket and filename.
 */
const SECRET_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'default-secret-key';

export interface StreamTokenPayload {
    bucket: string;
    path: string;
    exp: number; // Expiration timestamp (ms)
}

// Tokens outlive the page cache that carries them, but not by so much that a
// scraped one keeps working indefinitely.
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

export function generateStreamToken(
    bucket: string,
    path: string,
    expiresInSeconds = DEFAULT_TTL_SECONDS
): string {
    const payload: StreamTokenPayload = {
        bucket,
        path,
        exp: Date.now() + expiresInSeconds * 1000,
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', SECRET_KEY).update(data).digest('base64url');

    return `${data}.${signature}`;
}

export function verifyStreamToken(token: string): StreamTokenPayload | null {
    try {
        const [data, signature] = token.split('.');
        if (!data || !signature) return null;

        const expectedSignature = createHmac('sha256', SECRET_KEY).update(data).digest('base64url');

        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
            return null;
        }

        const payload: StreamTokenPayload = JSON.parse(Buffer.from(data, 'base64url').toString());

        if (!payload.bucket || !payload.path) return null;
        if (Date.now() > payload.exp) return null;

        return payload;
    } catch {
        return null;
    }
}

/** The player-facing URL for a storage object. */
export function streamUrlFor(bucket: string, path: string): string {
    return `/api/stream?t=${encodeURIComponent(generateStreamToken(bucket, path))}`;
}
