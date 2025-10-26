import AnnouncementBanner from '@/components/AnnouncementBanner';
import Header from '@/components/HeaderWrapper';
import Hero from '@/components/Hero';
import ProductCarousel from '@/components/ProductCarousel';
import ShopByCategory from '@/components/ShopByCategory';
import TrustBadges from '@/components/TrustBadges';
import BundleDeals from '@/components/BundleDeals';
import BrandSpotlight from '@/components/BrandSpotlight';
import Testimonials from '@/components/Testimonials';
import FeaturedIn from '@/components/FeaturedIn';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <div className="bg-gray-50">
      <AnnouncementBanner />
      <Header />
      <main>
        <Hero />
        <TrustBadges />
        <ProductCarousel />
        <ShopByCategory />
        <BundleDeals />
        <BrandSpotlight />
        <Testimonials />
        <FeaturedIn />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
