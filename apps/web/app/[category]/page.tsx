import { Suspense } from 'react';
import Products from '@/components/Products/Products';
import { generateCategoryMetadata } from '@/lib/metadata';
import { generateBreadcrumbSchema } from '@/lib/schema';
import type { Metadata } from 'next';

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

// Category-specific descriptions for better SEO
const categoryDescriptions: Record<string, string> = {
  'braiding-hair':
    'Shop premium braiding hair including X-Pression, Kanekalon, and more. Perfect for box braids, cornrows, and protective styles. Fast worldwide shipping.',
  wigs: 'Browse our collection of human hair and synthetic wigs. From lace fronts to full wigs, find your perfect style. Premium quality guaranteed.',
  'hair-extensions':
    'Shop clip-in, sew-in, and tape-in hair extensions. 100% human hair and high-quality synthetic options available.',
  'hair-treatments':
    'Deep conditioners, protein treatments, and hair masks for healthy, strong hair. Shop trusted brands for all hair types.',
  'styling-products':
    'Edge control, gels, mousse, and styling creams. Everything you need for perfect styles that last.',
  'hair-growth':
    'Hair growth oils, vitamins, and treatments to help you achieve your hair goals. Natural and effective formulas.',
};

// Generate metadata for category pages
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  // Convert slug to readable name (e.g., "braiding-hair" -> "Braiding Hair")
  const categoryName = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const customDescription = categoryDescriptions[category];

  return generateCategoryMetadata({
    categoryName,
    description: customDescription,
    categorySlug: category,
  });
}

async function CategoryBreadcrumbSchema({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // Convert slug to readable name for breadcrumb
  const categoryName = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: 'Home',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com',
    },
    {
      name: categoryName,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/${category}`,
    },
  ]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema),
      }}
    />
  );
}

export default function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  return (
    <>
      {/* Breadcrumb Schema */}
      <Suspense fallback={null}>
        <CategoryBreadcrumbSchema params={params} />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <Products params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
