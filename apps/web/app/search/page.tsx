import { Suspense } from 'react';
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

const SearchPage = async ({ searchParams }: SearchPageProps) => (
  <Suspense fallback={<div className="h-20" />}>
    <Search searchParams={searchParams} />
  </Suspense>
);

export default SearchPage;
