import { Suspense } from 'react';
import Search from '@/components/Search/Search';

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
