import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // /download serves tokenised, single-use links and should not be indexed.
            disallow: ['/admin/', '/api/', '/download'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
