import { setRequestLocale } from 'next-intl/server';
import BlogList from '@/components/BlogList';
import { getFeaturedPosts } from '@/lib/blog-data';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'Hair Care Tips & Beauty Advice',
  description:
    'Expert advice for Black hair care. Product reviews, styling tutorials, protective styles guides, and tips for healthy natural hair. Your trusted beauty supply resource for afro, coily, and textured hair.',
  path: '/blog',
  keywords: [
    'black hair care tips',
    'natural hair advice',
    'afro hair care',
    'protective styles',
    '4c hair tips',
    'hair care blog',
    'textured hair guide',
  ],
});

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

const BlogPage = async ({ params }: BlogPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const featuredPosts = getFeaturedPosts();

  return (
    <div className="bg-warm-beige min-h-screen">
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
    </div>
  );
};

export default BlogPage;
