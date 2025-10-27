import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import BlogList from '@/components/BlogList';
import { getFeaturedPosts } from '@/lib/blog-data';

const BlogPage = () => {
  const featuredPosts = getFeaturedPosts();

  return (
    <div className="bg-warm-beige min-h-screen">
      <AnnouncementBanner />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-cocoa to-deep-earth text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6">
              The Auntie Marlene's Blog
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Your trusted source for hair care tips, product reviews, and
              beauty advice tailored for textured hair and melanin-rich skin.
            </p>
          </div>
        </div>
      </section>

      <BlogList featuredPosts={featuredPosts} />

      <Footer />
    </div>
  );
};

export default BlogPage;
