import { groq } from 'next-sanity';

// Get all published blog posts
export const postsQuery = groq`
  *[_type == "post" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    featuredImage {
      asset->,
      alt,
      credit,
      creditUrl
    },
    "author": author->{
      _id,
      name,
      slug,
      title,
      image
    },
    "category": category->{
      _id,
      title,
      slug,
      color
    },
    publishedAt,
    "readingTime": round(length(pt::text(body)) / 5 / 200),
    featured
  }
`;

// Get a single post by slug
export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    body,
    featuredImage {
      asset->,
      alt,
      credit,
      creditUrl
    },
    "author": author->{
      _id,
      name,
      slug,
      title,
      bio,
      image
    },
    "category": category->{
      _id,
      title,
      slug,
      color
    },
    publishedAt,
    "readingTime": round(length(pt::text(body)) / 5 / 200),
    featured,
    seo {
      metaTitle,
      metaDescription,
      keywords
    }
  }
`;

// Get post slugs for static generation
export const postSlugsQuery = groq`
  *[_type == "post" && status == "published"] {
    "slug": slug.current
  }
`;

// Get related posts by category
export const relatedPostsQuery = groq`
  *[_type == "post" && status == "published" && slug.current != $slug && category._ref == $categoryId][0...3] {
    _id,
    title,
    slug,
    excerpt,
    featuredImage {
      asset->,
      alt
    },
    publishedAt,
    "readingTime": round(length(pt::text(body)) / 5 / 200)
  }
`;

// Get featured posts
export const featuredPostsQuery = groq`
  *[_type == "post" && status == "published" && featured == true] | order(publishedAt desc)[0...5] {
    _id,
    title,
    slug,
    excerpt,
    featuredImage {
      asset->,
      alt
    },
    "author": author->{
      _id,
      name,
      image
    },
    "category": category->{
      _id,
      title,
      slug
    },
    publishedAt,
    "readingTime": round(length(pt::text(body)) / 5 / 200)
  }
`;

// Get all covered topics (for deduplication)
export const coveredTopicsQuery = groq`
  *[_type == "post" && defined(generationMeta.topic)] {
    "topic": generationMeta.topic
  }
`;

// Check if a topic has been covered
export const topicExistsQuery = groq`
  count(*[_type == "post" && generationMeta.topic == $topic]) > 0
`;

// Get default author (first author by name)
export const defaultAuthorQuery = groq`
  *[_type == "author"] | order(name asc)[0] {
    _id
  }
`;

// Get author by slug
export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    title,
    bio,
    image
  }
`;

// Get category by slug
export const categoryBySlugQuery = groq`
  *[_type == "blogCategory" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    color
  }
`;

// Get all categories
export const categoriesQuery = groq`
  *[_type == "blogCategory"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color
  }
`;

// Get all authors
export const authorsQuery = groq`
  *[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    title,
    bio,
    image
  }
`;
