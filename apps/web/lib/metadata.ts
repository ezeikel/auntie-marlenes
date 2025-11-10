import { Metadata } from 'next';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com';
const siteName = "Auntie Marlene's";

export interface MetadataProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Generate metadata for a page
 */
export function generatePageMetadata({
  title,
  description,
  path = '/',
  image = '/opengraph-image',
  imageAlt = `${siteName} - Black Beauty Supply Store Online`,
  noIndex = false,
  keywords = [],
}: MetadataProps): Metadata {
  const url = `${siteUrl}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata({
  productName,
  brand,
  description,
  handle,
  image,
  price,
  compareAtPrice,
  inStock,
}: {
  productName: string;
  brand?: string;
  description: string;
  handle: string;
  image?: string;
  price?: number;
  compareAtPrice?: number;
  inStock?: boolean;
}): Metadata {
  const title = brand
    ? `${brand} ${productName} | ${siteName}`
    : `${productName} | ${siteName}`;

  const metaDescription = `${description.substring(0, 150)}... Shop ${productName} at ${siteName} - your trusted Black beauty supply store online. Fast worldwide shipping.`;

  const url = `${siteUrl}/product/${handle}`;

  const metadata: Metadata = {
    title,
    description: metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website', // Using 'website' instead of 'product' for broader compatibility
      locale: 'en_US',
      url,
      siteName,
      title,
      description: metaDescription,
      // Images will be automatically provided by opengraph-image.tsx
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      // Images will be automatically provided by opengraph-image.tsx (Twitter falls back to og:image)
    },
  };

  return metadata;
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata({
  categoryName,
  description,
  categorySlug,
}: {
  categoryName: string;
  description?: string;
  categorySlug: string;
}): Metadata {
  const title = `Shop ${categoryName} | ${siteName}`;
  const metaDescription =
    description ||
    `Shop ${categoryName} at ${siteName}. Wide selection of premium ${categoryName.toLowerCase()} from trusted brands. Fast worldwide delivery. Your modern Black beauty supply store online.`;

  const url = `${siteUrl}/${categorySlug}`;

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName,
      title,
      description: metaDescription,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${categoryName} - ${siteName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: ['/og-image.png'],
    },
  };
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogPostMetadata({
  title,
  excerpt,
  slug,
  image,
  author,
  publishedDate,
  modifiedDate,
}: {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}): Metadata {
  const fullTitle = `${title} | ${siteName} Blog`;
  const url = `${siteUrl}/blog/${slug}`;
  const imageUrl = image || '/og-image.png';

  return {
    title: fullTitle,
    description: excerpt,
    alternates: {
      canonical: url,
    },
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      siteName,
      title: fullTitle,
      description: excerpt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: author ? [author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: excerpt,
      images: [imageUrl],
    },
  };
}
