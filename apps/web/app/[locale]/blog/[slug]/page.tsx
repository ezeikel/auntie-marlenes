import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import Blog from '@/components/Blog/Blog';
import { generateBlogPostMetadata } from '@/lib/metadata';
import {
  getPostBySlug,
  getPostSlugs,
  getSanityImageUrl,
} from '@/lib/sanity-blog';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { SITE_URL } from '@/lib/site';

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

// Generate metadata for blog posts
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return generateBlogPostMetadata({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug.current,
    image: getSanityImageUrl(post.featuredImage as any, '/placeholder.svg'),
    author: post.author?.name || "Auntie Marlene's Team",
    publishedDate: post.publishedAt,
  });
}

async function BlogSchemas({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return null;
  }

  const siteUrl = SITE_URL;
  const imageUrl = getSanityImageUrl(
    post.featuredImage as any,
    '/placeholder.svg',
  );

  // Generate Article schema
  const articleSchema = generateArticleSchema({
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    datePublished: post.publishedAt,
    authorName: post.author?.name || "Auntie Marlene's Team",
    url: `${siteUrl}/blog/${post.slug.current}`,
  });

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: 'Home',
      url: siteUrl,
    },
    {
      name: 'Blog',
      url: `${siteUrl}/blog`,
    },
    {
      name: post.title,
      url: `${siteUrl}/blog/${post.slug.current}`,
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

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

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
