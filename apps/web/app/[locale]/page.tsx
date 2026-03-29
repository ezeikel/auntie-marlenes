import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/Hero';
import ProductCarousel from '@/components/ProductCarousel';
import ShopByCategory from '@/components/ShopByCategory';
import TrustBadges from '@/components/TrustBadges';
import BundleDeals from '@/components/BundleDeals';
// TODO: Re-enable once we have real brand partnerships
// import BrandSpotlight from '@/components/BrandSpotlight';
// TODO: Re-enable once we have real customer testimonials
// import Testimonials from '@/components/Testimonials';
// TODO: Re-enable once we have real press coverage
// import FeaturedIn from '@/components/FeaturedIn';
import BlogSection from '@/components/BlogSection';
import SocialMediaShowcase from '@/components/SocialMediaShowcase';
import NewArrivals from '@/components/NewArrivals';
import QuizCTA from '@/components/QuizCTA';
import BlackOwnedBanner from '@/components/BlackOwnedBanner';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title:
    "Auntie Marlene's | Black Beauty Supply Store Online | Worldwide Shipping",
  description:
    'Your modern Black hair & beauty supply store. Shop hair care, wigs, extensions, skincare & styling essentials. Premium brands, expert advice, fast UK shipping. Family-run & Black-owned.',
  path: '/',
  keywords: [
    'black beauty supply store',
    'black beauty supply online',
    'braiding hair online',
    'wigs online',
    'hair extensions',
    'afro hair products',
    'natural hair products',
    'black owned beauty supply',
  ],
});

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const HomePage = async ({ params }: HomePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-gray-50">
      <Hero />
      <BlackOwnedBanner />
      <TrustBadges />
      <ProductCarousel />
      <ShopByCategory />
      <NewArrivals />
      <QuizCTA />
      <BundleDeals />
      {/* <BrandSpotlight /> */}
      <SocialMediaShowcase />
      {/* <Testimonials /> */}
      {/* <FeaturedIn /> */}
      <BlogSection />
    </div>
  );
};

export default HomePage;
