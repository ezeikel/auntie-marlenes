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
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-4">
                  <div className="w-28 h-28 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse mt-4" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <Bag />
    </Suspense>
  );
};

export default BagPage;
