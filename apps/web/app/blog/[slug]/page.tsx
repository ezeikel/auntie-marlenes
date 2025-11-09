import { Suspense } from 'react';
import Blog from '@/components/Blog/Blog';
import { blogPosts } from '@/lib/blog-data';
import { generateBlogPostMetadata } from '@/lib/metadata';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for blog posts
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return generateBlogPostMetadata({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    image: post.image,
    author: post.author.name,
    publishedDate: new Date(post.date).toISOString(),
  });
}

async function BlogSchemas({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return null;
  }

  // Generate Article schema
  const articleSchema = generateArticleSchema({
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: new Date(post.date).toISOString(),
    authorName: post.author.name,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/blog/${post.slug}`,
  });

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: 'Home',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com',
    },
    {
      name: 'Blog',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/blog`,
    },
    {
      name: post.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/blog/${post.slug}`,
    },
  ]);

  return (
    <>
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}

const BlogPostPage = ({ params }: BlogPostPageProps) => {
  return (
    <>
      <Suspense fallback={null}>
        <BlogSchemas params={params} />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <Blog params={params} />
      </Suspense>
    </>
  );
};

export default BlogPostPage;
