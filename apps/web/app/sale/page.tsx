import Sale from '@/components/Sale/Sale';
import { Suspense } from 'react';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'Sale & Deals | Discount Beauty Supply',
  description:
    'Save on premium Black hair & beauty products. Limited time offers on wigs, extensions, treatments & more. Shop discounted beauty supply essentials with fast worldwide shipping.',
  path: '/sale',
  keywords: [
    'black hair products sale',
    'discounted wigs',
    'cheap hair extensions',
    'beauty supply deals',
    'braiding hair on sale',
    'afro hair products discount',
  ],
});

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
