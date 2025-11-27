import { setRequestLocale } from 'next-intl/server';
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
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    brands?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
  }>;
};

export default async function ShopPage({
  params,
  searchParams,
}: ShopPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Shop searchParams={searchParams} />;
}
