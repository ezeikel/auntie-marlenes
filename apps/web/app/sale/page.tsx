import Sale from '@/components/Sale/Sale';
import { Suspense } from 'react';

type SalePageProps = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

const SalePage = async ({ searchParams }: SalePageProps) => (
  <Suspense fallback={<div className="h-20" />}>
    <Sale searchParams={searchParams} />
  </Suspense>
);

export default SalePage;
