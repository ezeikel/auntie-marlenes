import { Suspense } from 'react';
import Hero from '@/components/Hero';
import ProductCarousel from '@/components/ProductCarousel';
import ShopByCategory from '@/components/ShopByCategory';
import TrustBadges from '@/components/TrustBadges';
import BundleDeals from '@/components/BundleDeals';
import BrandSpotlight from '@/components/BrandSpotlight';
import Testimonials from '@/components/Testimonials';
import FeaturedIn from '@/components/FeaturedIn';
import BlogSection from '@/components/BlogSection';
import SocialMediaShowcase from '@/components/SocialMediaShowcase';

const HomePage = () => {
  return (
    <div className="bg-gray-50">
      <Hero />
      <TrustBadges />
      <Suspense fallback={<div>Loading...</div>}>
        <ProductCarousel />
      </Suspense>
      <ShopByCategory />
      <Suspense fallback={<div>Loading...</div>}>
        <BundleDeals />
      </Suspense>
      <BrandSpotlight />
      <SocialMediaShowcase />
      <Testimonials />
      <FeaturedIn />
      <BlogSection />
    </div>
  );
};

export default HomePage;
