import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/bag',
          '/account',
          '/account/*',
          '/saved',
          '/search',
          '/api/*',
          '/checkout',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
