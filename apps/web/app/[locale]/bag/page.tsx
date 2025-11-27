import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import Bag from '@/components/Bag/Bag';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'Shopping Bag',
  description: 'View and manage items in your shopping bag.',
  path: '/bag',
  noIndex: true, // Transactional pages should not be indexed
});

type BagPageProps = {
  params: Promise<{ locale: string }>;
};

const BagPage = async ({ params }: BagPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Bag />
    </Suspense>
  );
};

export default BagPage;
