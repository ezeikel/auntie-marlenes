const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com';

/**
 * Generate Product schema (JSON-LD) for rich snippets
 */
export function generateProductSchema({
  name,
  description,
  image,
  brand,
  sku,
  price,
  currency = 'GBP',
  availability,
  condition = 'NewCondition',
  url,
  ratingValue,
  reviewCount,
}: {
  name: string;
  description: string;
  image: string;
  brand?: string;
  sku?: string;
  price: number;
  currency?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: string;
  url: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: brand
      ? {
          '@type': 'Brand',
          name: brand,
        }
      : undefined,
    sku,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
      itemCondition: `https://schema.org/${condition}`,
      seller: {
        '@type': 'Organization',
        name: "Auntie Marlene's",
      },
    },
  };

  // Add aggregate rating if reviews exist
  if (ratingValue && reviewCount && reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

/**
 * Generate Article schema (JSON-LD) for blog posts
 */
export function generateArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  url,
}: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: "Auntie Marlene's",
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generate BreadcrumbList schema (JSON-LD) for navigation
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Organization schema (JSON-LD) - used site-wide
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Auntie Marlene's",
    description:
      'Modern Black beauty supply store offering premium braiding hair, wigs, hair extensions, treatments and styling essentials.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    email: 'hello@auntiemarlenes.com',
    foundingDate: '2024',
    slogan: 'Where Beautiful Skin Meets Gorgeous Hair',
    sameAs: [
      // Add social media URLs when available
      // 'https://www.instagram.com/auntiemarlenes',
      // 'https://www.tiktok.com/@auntiemarlenes',
      // 'https://www.facebook.com/auntiemarlenes',
      // 'https://www.youtube.com/@auntiemarlenes',
    ],
  };
}

/**
 * Generate Review schema (JSON-LD) for individual reviews
 */
export function generateReviewSchema({
  itemName,
  reviewBody,
  ratingValue,
  authorName,
  datePublished,
}: {
  itemName: string;
  reviewBody: string;
  ratingValue: number;
  authorName: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: itemName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: ratingValue.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished,
  };
}
