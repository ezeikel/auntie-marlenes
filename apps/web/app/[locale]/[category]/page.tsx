import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Products from '@/components/Products/Products';
import { generateCategoryMetadata } from '@/lib/metadata';
import { generateBreadcrumbSchema } from '@/lib/schema';

type CategoryPageProps = {
  params: Promise<{ locale: string; category: string }>;
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
  'hair-care':
    'Shop premium hair care for natural, textured, and afro hair. Shampoos, conditioners, treatments, and styling products from Mielle, Cantu, Shea Moisture and more.',
  'wigs-extensions':
    'Browse wigs, lace fronts, braiding hair, and clip-in extensions. From affordable synthetic to premium human hair. Fast UK shipping.',
  'skin-care':
    'Skincare for melanin-rich skin. Cleansers, serums, moisturisers and treatments from CeraVe, The Ordinary, Buttah Skin and Fenty Skin.',
  'body-care':
    "Nourishing body lotions, butters, washes and scrubs. Keep your skin soft and hydrated with Palmer's, Vaseline, Shea Moisture and more.",
  accessories:
    'Essential hair tools and accessories. Satin bonnets, pillowcases, detangling brushes, combs, and edge brushes.',
  kids: 'Gentle, tear-free hair care for kids with textured and afro hair. Shampoos, conditioners, and detanglers from Cantu Kids and African Pride.',
  mens: "Men's grooming products for afro and textured hair. Shampoos, beard oils, pomades and more from Cantu Men's and Shea Moisture.",
  styling:
    'Edge control, gels, curl activators and styling products. Everything you need for perfect styles that last.',
  sale: 'Shop sale items and special offers on hair care, beauty, and accessories.',
};

// Generate metadata for category pages
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category, locale } = await params;
  setRequestLocale(locale);

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

function CategoryBreadcrumbSchema({ category }: { category: string }) {
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Breadcrumb Schema */}
      <CategoryBreadcrumbSchema category={category} />
      <Products params={params} searchParams={searchParams} />
    </>
  );
}
