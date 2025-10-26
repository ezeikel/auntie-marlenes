import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/lib/blog-data';

const BlogSection = () => {
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4">
            Our Recent Blog Posts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert tips, product reviews, and hair care advice from the
            community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <article key={post.id} className="group flex flex-col">
              <Link
                href={`/blog/${post.slug}`}
                className="relative aspect-[3/2] mb-4 rounded-xl overflow-hidden"
              >
                <Image
                  src={post.image || '/placeholder.svg'}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-terracotta uppercase">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.date}</span>
              </div>
              <h3 className="text-xl font-playfair font-bold text-cocoa mb-2 group-hover:text-terracotta transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sage-green font-semibold hover:text-sage-green/80 inline-flex items-center gap-2"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-cocoa"
          >
            <Link href="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
