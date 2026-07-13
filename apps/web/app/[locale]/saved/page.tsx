import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import SavedItemsList from '@/components/SavedItemsList';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Saved Items',
  description: 'View and manage your saved items and wishlist.',
  path: '/saved',
  noIndex: true, // Private user pages should not be indexed
});

type SavedPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SavedPage({ params }: SavedPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-2">
            Saved Items
          </h1>
          <p className="text-gray-600 font-inter">
            Your wishlist of favourite products
          </p>
        </div>

        <SavedItemsList />
      </div>
    </div>
  );
}
