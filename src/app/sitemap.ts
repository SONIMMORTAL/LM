import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Album detail routes under /music/[slug]. The video-only tapes (darkside,
 * lord-knows, munchies) are left off: their old album URLs now redirect to
 * /videos, which is already listed below.
 */
const ALBUM_SLUGS = [
    'lost-city',
    'the-commission',
    'more-life',
    'live-from-the-dungeon',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    // /forum and /stoop are permanent redirects to /vip, so the sitemap lists
    // the destination instead of the redirect.
    const pages: Array<{
        path: string;
        changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
        priority: number;
    }> = [
        { path: '/', changeFrequency: 'weekly', priority: 1 },
        { path: '/music', changeFrequency: 'weekly', priority: 0.9 },
        { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
        { path: '/vip', changeFrequency: 'daily', priority: 0.8 },
        { path: '/videos', changeFrequency: 'weekly', priority: 0.7 },
        { path: '/loaf-films', changeFrequency: 'monthly', priority: 0.7 },
        { path: '/gallery', changeFrequency: 'monthly', priority: 0.6 },
        { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
        ...ALBUM_SLUGS.map((slug) => ({
            path: `/music/${slug}`,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
    ];

    return pages.map(({ path, changeFrequency, priority }) => ({
        url: `${SITE_URL}${path}`,
        lastModified,
        changeFrequency,
        priority,
    }));
}
