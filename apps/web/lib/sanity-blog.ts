/**
 * Sanity Blog Data Fetching Utilities
 *
 * Provides functions to fetch blog data from Sanity CMS
 * and transform it to match the existing BlogPost format
 */

import { client } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import {
  postsQuery,
  postBySlugQuery,
  postSlugsQuery,
  relatedPostsQuery,
  featuredPostsQuery,
  categoriesQuery,
} from '@/sanity/lib/queries';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';

// Types for Sanity data
export interface SanityAuthor {
  _id: string;
  name: string;
  slug: { current: string };
  title?: string;
  bio?: string;
  image?: SanityImage;
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  color?: string;
}

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  body?: PortableTextBlock[];
  featuredImage?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
    alt?: string;
    credit?: string;
    creditUrl?: string;
  };
  author?: SanityAuthor;
  category?: SanityCategory;
  publishedAt: string;
  readingTime?: number;
  featured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

// Legacy BlogPost type for backwards compatibility
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    title?: string;
    bio?: string;
  };
  date: string;
  readTime: string;
  featured: boolean;
}

/**
 * Transform Sanity post to legacy BlogPost format
 */
export function transformSanityPost(post: SanityPost): BlogPost {
  const imageUrl =
    post.featuredImage?.asset?.url ||
    (post.featuredImage
      ? urlForImage(post.featuredImage as SanityImage)?.url()
      : undefined) ||
    '/placeholder.svg?height=600&width=1200&text=Blog+Post';

  const authorImageUrl = post.author?.image
    ? urlForImage(post.author.image)?.url() ||
      '/placeholder.svg?height=100&width=100&text=Author'
    : '/placeholder.svg?height=100&width=100&text=Author';

  return {
    id: post._id,
    slug: post.slug.current,
    title: post.title,
    excerpt: post.excerpt,
    content: '', // Content is now Portable Text, handled separately
    image: imageUrl,
    category: post.category?.title || 'Uncategorized',
    author: {
      name: post.author?.name || "Auntie Marlene's Team",
      avatar: authorImageUrl,
      title: post.author?.title,
      bio: post.author?.bio,
    },
    date: formatDate(post.publishedAt),
    readTime: `${post.readingTime || 5} min read`,
    featured: post.featured || false,
  };
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get all published blog posts
 */
export async function getAllPosts(): Promise<SanityPost[]> {
  try {
    const posts = await client.fetch<SanityPost[]>(postsQuery);
    return posts || [];
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}

/**
 * Get all posts transformed to legacy format
 */
export async function getAllPostsLegacy(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.map(transformSanityPost);
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  try {
    const post = await client.fetch<SanityPost>(postBySlugQuery, { slug });
    return post || null;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

/**
 * Get a single post by slug in legacy format
 */
export async function getPostBySlugLegacy(
  slug: string,
): Promise<BlogPost | null> {
  const post = await getPostBySlug(slug);
  return post ? transformSanityPost(post) : null;
}

/**
 * Get post slugs for static generation
 */
export async function getPostSlugs(): Promise<{ slug: string }[]> {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(postSlugsQuery);
    return slugs || [];
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}

/**
 * Get related posts by category
 */
export async function getRelatedPosts(
  currentSlug: string,
  categoryId: string,
  limit = 3,
): Promise<SanityPost[]> {
  try {
    const posts = await client.fetch<SanityPost[]>(relatedPostsQuery, {
      slug: currentSlug,
      categoryId,
    });
    return posts?.slice(0, limit) || [];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

/**
 * Get related posts in legacy format
 */
export async function getRelatedPostsLegacy(
  currentSlug: string,
  categoryId: string,
  limit = 3,
): Promise<BlogPost[]> {
  const posts = await getRelatedPosts(currentSlug, categoryId, limit);
  return posts.map(transformSanityPost);
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(): Promise<SanityPost[]> {
  try {
    const posts = await client.fetch<SanityPost[]>(featuredPostsQuery);
    return posts || [];
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

/**
 * Get featured posts in legacy format
 */
export async function getFeaturedPostsLegacy(): Promise<BlogPost[]> {
  const posts = await getFeaturedPosts();
  return posts.map(transformSanityPost);
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<SanityCategory[]> {
  try {
    const categories = await client.fetch<SanityCategory[]>(categoriesQuery);
    return categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get category titles for filtering
 */
export async function getCategoryTitles(): Promise<string[]> {
  const categories = await getCategories();
  return ['All', ...categories.map((c) => c.title)];
}

/**
 * Get image URL from Sanity image object
 * Handles both raw references (asset._ref) and dereferenced assets (asset.url)
 */
export function getSanityImageUrl(
  image: SanityImage | undefined,
  fallback = '/placeholder.svg?height=600&width=1200&text=Blog+Post',
): string {
  if (!image) return fallback;

  // Check for dereferenced asset URL first (when query uses asset->)
  const asset = image.asset as { url?: string; _ref?: string } | undefined;
  if (asset?.url) {
    return asset.url;
  }

  // Fall back to urlForImage for raw references
  return urlForImage(image)?.url() || fallback;
}
