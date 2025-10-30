import { Suspense } from 'react';
import Shop from '@/components/Shop/Shop';

type ShopPageProps = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <Suspense fallback={<div className="h-20" />}>
      <Shop searchParams={searchParams} />
    </Suspense>
  );
}
