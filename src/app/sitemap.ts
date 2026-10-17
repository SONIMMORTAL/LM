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
    // Exclude redirects and no-index pages such as /vip. Omit lastModified
    // until actual editorial timestamps are available; build time is not an edit.
    const pages: Array<{
        path: string;
        changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
        priority: number;
    }> = [
        { path: '/', changeFrequency: 'weekly', priority: 1 },
        { path: '/music', changeFrequency: 'weekly', priority: 0.9 },
        { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
        { path: '/videos', changeFrequency: 'weekly', priority: 0.7 },
        { path: '/loaf-films', changeFrequency: 'monthly', priority: 0.7 },
        { path: '/bio', changeFrequency: 'monthly', priority: 0.7 },
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
        changeFrequency,
        priority,
    }));
}
