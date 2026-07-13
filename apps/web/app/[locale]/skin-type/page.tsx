import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import SkinTypeQuiz from '@/components/SkinTypeQuiz';

export const metadata: Metadata = {
  title: "Find Your Skin Type | Auntie Marlene's",
  description:
    'Take our skin type quiz designed for melanin-rich skin. Discover your skin type, hydration level, sensitivity, and get personalised skincare recommendations.',
};

type SkinTypePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SkinTypePage({ params }: SkinTypePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <SkinTypeQuiz />
      </div>
    </div>
  );
}
