import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { CREW } from '@/lib/crew';
// Album detail routes under /music/[slug]. The video-only tapes (darkside, lord-knows,
// munchies) are left off: their old album URLs now redirect to /videos, listed below.
import { ALBUM_RELEASES } from '@/lib/discography';

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
        ...ALBUM_RELEASES.map((album) => ({
            path: `/music/${album.slug}`,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
        ...CREW.filter((member) => member.hasPage).map((member) => ({
            path: `/artists/${member.slug}`,
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
