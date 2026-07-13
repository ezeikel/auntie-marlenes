import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import HairTypeQuiz from '@/components/HairTypeQuiz';

export const metadata: Metadata = {
  title: "Find Your Hair Type | Auntie Marlene's",
  description:
    'Take our hair type quiz to discover your unique hair profile — pattern, porosity, density, and scalp type — with personalised product recommendations.',
};

type HairTypePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HairTypePage({ params }: HairTypePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <HairTypeQuiz />
      </div>
    </div>
  );
}
