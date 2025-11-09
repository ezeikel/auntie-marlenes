import { Suspense } from 'react';
import Shop from '@/components/Shop/Shop';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'Shop All Products',
  description:
    'Browse our full collection of Black hair & beauty products. From braiding hair to styling essentials - find everything you need in one place. Premium quality, fast worldwide shipping.',
  path: '/shop',
  keywords: [
    'black hair products',
    'afro hair shop',
    'beauty supply store',
    'braiding hair',
    'wigs',
    'hair extensions',
    'hair treatments',
  ],
});

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
