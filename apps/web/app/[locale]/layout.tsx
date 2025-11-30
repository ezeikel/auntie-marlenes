import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { Suspense } from 'react';
import Providers from '../providers';
import SavedItemsSync from '@/components/SavedItemsSync';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import { locales, type Locale } from '@/i18n/config';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const generateStaticParams = () => {
  return locales.map((locale) => ({ locale }));
};

const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch messages for the current locale
  const messages = await getMessages();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Auntie Marlene's",
    description:
      'Modern Black beauty supply store offering premium braiding hair, wigs, hair extensions, treatments and styling essentials.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/logo.png`,
    email: 'hello@auntiemarlenes.com',
    foundingDate: '2024',
    slogan: 'Where Beautiful Skin Meets Gorgeous Hair',
    sameAs: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Suspense fallback={null}>
        <Providers messages={messages} locale={locale}>
          <SavedItemsSync />
          <Suspense fallback={<div className="h-8 bg-deep-earth" />}>
            <AnnouncementBanner />
          </Suspense>
          <Suspense fallback={<div className="h-20" />}>
            <Header />
          </Suspense>
          <main lang={locale}>{children}</main>
          <Suspense fallback={<div className="h-64 bg-deep-earth" />}>
            <Footer />
          </Suspense>
        </Providers>
      </Suspense>
    </>
  );
};

export default LocaleLayout;
