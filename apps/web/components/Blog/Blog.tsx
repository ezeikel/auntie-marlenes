import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import {
  getPostBySlug,
  getRelatedPosts,
  getSanityImageUrl,
  type SanityPost,
} from '@/lib/sanity-blog';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faArrowLeft } from '@fortawesome/pro-regular-svg-icons';
import {
  faFacebook,
  faTwitter,
  faPinterest,
} from '@fortawesome/free-brands-svg-icons';
import { portableTextComponents } from './PortableTextComponents';

const Blog = async ({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts using the category ID
  const relatedPosts = post.category?._id
    ? await getRelatedPosts(post.slug.current, post.category._id)
    : [];

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get reading time
  const readingTime = post.readingTime || 5;

  return (
    <div className="bg-warm-beige min-h-screen">
      <article className="py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              asChild
              variant="ghost"
              className="gap-2 hover:bg-transparent hover:text-terracotta"
            >
              <Link href="/blog">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Blog
              </Link>
            </Button>
          </div>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block bg-sage-green/10 text-sage-green font-semibold text-sm px-4 py-1 rounded-full uppercase mb-4">
                {post.category?.title || 'Uncategorized'}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-cocoa mb-6 leading-tight">
                {post.title}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-200 mb-8">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={getSanityImageUrl(
                      post.author?.image,
                      '/placeholder.svg?height=100&width=100&text=Author',
                    )}
                    alt={post.author?.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-cocoa">
                    {post.author?.name || "Auntie Marlene's Team"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {post.author?.title || 'Author'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <FontAwesomeIcon icon={faClock} />
                <span>{readingTime} min read</span>
              </div>
              <div className="text-gray-500">
                {formatDate(post.publishedAt)}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">Share:</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-gray-600 hover:text-sage-green"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-gray-600 hover:text-sage-green"
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-gray-600 hover:text-sage-green"
                >
                  <FontAwesomeIcon icon={faPinterest} />
                </Button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12">
              <Image
                src={getSanityImageUrl(
                  post.featuredImage as any,
                  '/placeholder.svg?height=600&width=1200&text=Blog+Post',
                )}
                alt={post.featuredImage?.alt || post.title}
                fill
                className="object-cover"
                priority
              />
              {post.featuredImage?.credit &&
                !post.featuredImage.credit
                  .toLowerCase()
                  .includes('generated') &&
                !post.featuredImage.credit.toLowerCase().includes('gemini') && (
                  <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-3 py-1 rounded-tl">
                    Photo by{' '}
                    {post.featuredImage.creditUrl ? (
                      <a
                        href={post.featuredImage.creditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {post.featuredImage.credit}
                      </a>
                    ) : (
                      post.featuredImage.credit
                    )}
                  </div>
                )}
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {post.body && (
                <PortableText
                  value={post.body}
                  components={portableTextComponents}
                />
              )}
            </div>

            {/* Tags/Topics - Optional */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">
                  Topics:
                </span>
                <Button variant="outline" size="sm" className="bg-transparent">
                  {post.category?.title || 'Uncategorized'}
                </Button>
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-12 p-6 bg-warm-beige rounded-xl">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={getSanityImageUrl(
                      post.author?.image,
                      '/placeholder.svg?height=100&width=100&text=Author',
                    )}
                    alt={post.author?.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-playfair font-bold text-cocoa mb-2">
                    About {post.author?.name || "Auntie Marlene's Team"}
                  </h3>
                  <p className="text-gray-700">
                    {post.author?.bio ||
                      'A passionate hair care enthusiast and writer dedicated to helping others on their natural hair journey. With years of experience and countless product trials, they share honest reviews and practical tips.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-warm-beige">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-8 text-center">
              You Might Also Like
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <Link href={`/blog/${relatedPost.slug.current}`}>
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={getSanityImageUrl(
                          relatedPost.featuredImage as any,
                          '/placeholder.svg?height=400&width=600&text=Blog',
                        )}
                        alt={
                          relatedPost.featuredImage?.alt || relatedPost.title
                        }
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-sage-green font-semibold text-sm uppercase">
                        {post.category?.title || 'Uncategorized'}
                      </span>
                      <h3 className="text-xl font-playfair font-bold text-cocoa hover:text-terracotta transition-colors mt-2 mb-3 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faClock} size="sm" />
                        <span>{relatedPost.readingTime || 5} min read</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-sage-green to-warm-clay rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Enjoyed this article?
            </h2>
            <p className="text-xl mb-8">
              Subscribe to our newsletter for more hair care tips, product
              reviews, and exclusive offers delivered to your inbox weekly.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-sage-green hover:bg-warm-beige font-bold"
            >
              <Link href="/#newsletter">Subscribe Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
