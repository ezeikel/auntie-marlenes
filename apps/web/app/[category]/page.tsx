import { Suspense } from 'react';
import Products from '@/components/Products/Products';

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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Products params={params} searchParams={searchParams} />
    </Suspense>
  );
}
