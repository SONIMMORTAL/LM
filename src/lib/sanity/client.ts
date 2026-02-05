import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Sanity client configuration
// To use: Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local
export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: true,
    apiVersion: '2024-01-01',
});

// Image URL builder
const builder = imageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
    return builder.image(source);
}

// Check if Sanity is properly configured
export function isSanityConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
        process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder'
    );
}
