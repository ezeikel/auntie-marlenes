import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import Search from '@/components/Search/Search';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'Search Products',
  description:
    'Search our collection of Black hair & beauty products. Find braiding hair, wigs, extensions, treatments and more.',
  path: '/search',
  noIndex: true, // Prevent duplicate content indexing
});

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

const SearchPage = async ({ params, searchParams }: SearchPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="h-20" />}>
      <Search searchParams={searchParams} />
    </Suspense>
  );
};

export default SearchPage;
