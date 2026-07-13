import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Sale from '@/components/Sale/Sale';
import { generatePageMetadata } from '@/lib/metadata';

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

const SalePage = async ({ params, searchParams }: SalePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Sale searchParams={searchParams} />;
};

export default SalePage;
