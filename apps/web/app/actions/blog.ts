'use server';

import { generateText, generateObject } from 'ai';
import { models } from '@/lib/ai/models';
import {
  BLOG_META_SYSTEM,
  BLOG_POST_SYSTEM,
  BLOG_META_PROMPT,
  BLOG_POST_PROMPT,
  IMAGE_SEARCH_PROMPT,
  IMAGE_GENERATION_PROMPT,
} from '@/lib/ai/prompts';
import { blogMetaSchema, imageSearchSchema } from '@/lib/ai/schemas';
import { findBestImage, type ImageEvaluation } from '@/lib/ai/image-evaluation';
import { writeClient } from '@/sanity/lib/client';
import { coveredTopicsQuery, topicExistsQuery } from '@/sanity/lib/queries';
import {
  fetchBlogPhotosForEvaluation,
  downloadPhoto,
  formatPhotoCredit,
  type PexelsPhoto,
} from '@/lib/pexels';
import { getRandomTopic, type BlogTopic } from '@/lib/blog/topics';
import { getAuthorBySpecialty, GUEST_AUTHORS } from '@/lib/blog/authors';

// Types
interface BlogPostMeta {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

interface ImageSearchTerms {
  searchTerms: string[];
  altText: string;
}

interface FeaturedImage {
  asset: { _type: 'reference'; _ref: string };
  alt: string;
  credit?: string;
  creditUrl?: string;
}

interface GenerationMeta {
  isGenerated: boolean;
  topic: string;
  generatedAt: string;
  model: string;
  imageSource: 'pexels' | 'gemini' | 'none';
  pexelsPhotoId?: number;
  imagePrompt?: string;
  imageEvaluation?: {
    confidence: number;
    reasoning: string;
    searchTerm: string;
  };
}

/** Minimum confidence score for AI to approve a Pexels image */
const IMAGE_EVALUATION_THRESHOLD = 60;

/**
 * Generate a unique slug from title
 */
const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

/**
 * Generate blog post metadata using AI structured outputs
 */
const generateBlogMeta = async (
  topic: string,
  category: string,
  keywords: string[],
): Promise<BlogPostMeta> => {
  const prompt = BLOG_META_PROMPT.replace('{{TOPIC}}', topic)
    .replace('{{CATEGORY}}', category)
    .replace('{{KEYWORDS}}', keywords.join(', '));

  // @ts-expect-error — AI SDK type instantiation too deep with Zod schema
  const { object: meta } = await generateObject({
    model: models.textFast,
    schema: blogMetaSchema,
    system: BLOG_META_SYSTEM,
    prompt,
    temperature: 0.7,
  });

  // Ensure slug is clean
  meta.slug = generateSlug(meta.title);

  return meta;
};

/**
 * Generate image search terms for Pexels
 */
const generateImageSearchTerms = async (
  title: string,
  excerpt: string,
  category: string,
): Promise<ImageSearchTerms> => {
  const prompt = IMAGE_SEARCH_PROMPT.replace('{{TITLE}}', title)
    .replace('{{EXCERPT}}', excerpt)
    .replace('{{CATEGORY}}', category);

  // @ts-expect-error — AI SDK type instantiation too deep with Zod schema
  const { object: searchTerms } = await generateObject({
    model: models.textFast,
    schema: imageSearchSchema,
    prompt,
    temperature: 0.7,
  });

  return searchTerms;
};

/**
 * Generate image with Gemini 3 Pro Image (Nano Banana Pro) when Pexels doesn't have suitable options
 * Uses Google's Gemini 3 Pro Image model via Vercel AI SDK
 */
const generateImageWithGemini = async (
  title: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> => {
  const prompt = IMAGE_GENERATION_PROMPT.replace('{{TITLE}}', title);

  try {
    console.log(
      'Generating image with Gemini 3 Pro Image (Nano Banana Pro)...',
    );

    // Use Gemini 3 Pro Image via Vercel AI SDK
    const result = await generateText({
      model: models.geminiImage, // This is configured as 'gemini-3-pro-image-preview' in models.ts
      prompt: `Generate a high-quality professional photograph for this blog post. Do not include any text in the image. ${prompt}`,
    });

    // Images come back in result.files for image generation models
    // GeneratedFile has: base64, uint8Array, and mediaType properties
    const imageFile = result.files?.find((f) =>
      f.mediaType?.startsWith('image/'),
    );

    if (imageFile) {
      console.log('Gemini 3 Pro Image generated image successfully');
      // Use uint8Array to create buffer (more efficient than base64 decoding)
      const buffer = Buffer.from(imageFile.uint8Array);

      return {
        buffer,
        mimeType: imageFile.mediaType,
      };
    }

    console.error('Gemini 3 Pro Image response did not contain image data');
    return null;
  } catch (error) {
    console.error('Gemini 3 Pro Image generation failed:', error);
    return null;
  }
};

/**
 * Upload image to Sanity from buffer
 */
const uploadImageToSanity = async (
  buffer: Buffer,
  filename: string,
): Promise<{ _type: 'reference'; _ref: string }> => {
  const asset = await writeClient.assets.upload('image', buffer, {
    filename,
  });

  return {
    _type: 'reference',
    _ref: asset._id,
  };
};

/**
 * Get featured image from Pexels (with AI evaluation) or Gemini
 * Returns the image asset and metadata for Sanity
 */
const getFeaturedImage = async (
  title: string,
  excerpt: string,
  category: string,
  slug: string,
): Promise<{
  image: FeaturedImage | null;
  source: 'pexels' | 'gemini';
  pexelsPhotoId?: number;
  imagePrompt?: string;
  evaluation?: ImageEvaluation;
  searchTerm?: string;
}> => {
  try {
    // 1. Generate search terms
    console.log('Generating image search terms for:', title);
    const searchTerms = await generateImageSearchTerms(
      title,
      excerpt,
      category,
    );

    // 2. Fetch multiple candidate photos from Pexels
    console.log('Searching Pexels with terms:', searchTerms.searchTerms);
    const pexelsResult = await fetchBlogPhotosForEvaluation(
      searchTerms.searchTerms,
      { orientation: 'landscape', size: 'large' },
    );

    let selectedPhoto: PexelsPhoto | null = null;
    let selectedSearchTerm = '';
    let evaluationResult: ImageEvaluation | null = null;

    if (pexelsResult.photos.length > 0) {
      // 3. Evaluate photos with AI vision model (Gemini 3 Pro)
      console.log(
        `Evaluating ${pexelsResult.photos.length} candidate images with AI`,
      );

      const { selectedIndex, evaluations } = await findBestImage(
        pexelsResult.photos.map((p) => ({
          url: p.photo.src.large,
          searchTerm: p.searchTerm,
        })),
        { title, excerpt, category },
        IMAGE_EVALUATION_THRESHOLD,
      );

      if (selectedIndex !== null) {
        selectedPhoto = pexelsResult.photos[selectedIndex].photo;
        selectedSearchTerm = pexelsResult.photos[selectedIndex].searchTerm;
        evaluationResult = evaluations[selectedIndex];

        console.log('AI selected Pexels image:', {
          photographer: selectedPhoto.photographer,
          confidence: evaluationResult.confidence,
          reasoning: evaluationResult.reasoning,
        });
      } else {
        const bestEvaluation = evaluations.reduce(
          (best, curr) => (curr.confidence > best.confidence ? curr : best),
          evaluations[0],
        );
        console.log('AI rejected all Pexels images:', {
          bestConfidence: bestEvaluation?.confidence ?? 0,
          threshold: IMAGE_EVALUATION_THRESHOLD,
          concerns: bestEvaluation?.concerns,
        });
      }
    }

    // 4. Use selected Pexels photo if available
    if (selectedPhoto && evaluationResult) {
      const buffer = await downloadPhoto(selectedPhoto, 'large2x');
      const assetRef = await uploadImageToSanity(
        buffer,
        `${slug}-featured.jpg`,
      );
      const credit = formatPhotoCredit(selectedPhoto);

      return {
        image: {
          asset: assetRef,
          alt: searchTerms.altText,
          credit: credit.credit,
          creditUrl: credit.creditUrl,
        },
        source: 'pexels',
        pexelsPhotoId: selectedPhoto.id,
        evaluation: evaluationResult,
        searchTerm: selectedSearchTerm,
      };
    }

    // 5. Fallback to Gemini 3 Pro Image generation (Nano Banana Pro)
    console.log(
      'No suitable Pexels image found, generating with Gemini 3 Pro Image',
    );
    const geminiResult = await generateImageWithGemini(title);

    if (geminiResult) {
      const extension = geminiResult.mimeType.includes('png') ? 'png' : 'jpg';
      const assetRef = await uploadImageToSanity(
        geminiResult.buffer,
        `${slug}-featured-generated.${extension}`,
      );

      return {
        image: {
          asset: assetRef,
          alt: searchTerms.altText,
          credit: 'Generated with Gemini 3 Pro Image',
        },
        source: 'gemini',
        imagePrompt: IMAGE_GENERATION_PROMPT.replace('{{TITLE}}', title),
      };
    }

    console.log('Gemini 3 Pro Image generation failed, no image available');
    return { image: null, source: 'gemini' };
  } catch (error) {
    console.error('Error getting featured image:', error);
    return { image: null, source: 'pexels' };
  }
};

/**
 * Strip markdown code fences from AI-generated content
 * AI sometimes wraps responses in ```markdown ... ``` which breaks Portable Text parsing
 */
const stripMarkdownCodeFences = (content: string): string => {
  // Remove leading code fence with optional language identifier
  let stripped = content.replace(/^```(?:markdown|md)?\s*\n?/i, '');
  // Remove trailing code fence
  stripped = stripped.replace(/\n?```\s*$/i, '');
  return stripped.trim();
};

/**
 * Generate blog content using AI
 */
const generateBlogContent = async (
  topic: string,
  title: string,
  keywords: string[],
  category: string,
  recentTopics: string[],
): Promise<string> => {
  const prompt = BLOG_POST_PROMPT.replace('{{TOPIC}}', topic)
    .replace('{{TITLE}}', title)
    .replace('{{KEYWORDS}}', keywords.join(', '))
    .replace('{{CATEGORY}}', category)
    .replace(
      '{{RECENT_TOPICS}}',
      recentTopics.length > 0 ? recentTopics.join('\n- ') : 'None',
    );

  const { text: content } = await generateText({
    model: models.text,
    system: BLOG_POST_SYSTEM,
    prompt,
    temperature: 0.7,
  });

  // Strip any markdown code fences the AI may have wrapped the response in
  return stripMarkdownCodeFences(content);
};

/**
 * Parse inline markdown formatting and convert to Portable Text spans with marks
 */
function parseInlineMarkdown(text: string): any[] {
  const spans: any[] = [];
  let currentText = '';
  let currentMarks: string[] = [];
  let i = 0;

  const flushSpan = () => {
    if (currentText) {
      spans.push({
        _type: 'span',
        _key: `span-${spans.length}`,
        text: currentText,
        marks: [...currentMarks],
      });
      currentText = '';
    }
  };

  while (i < text.length) {
    // Bold: **text**
    if (text.slice(i, i + 2) === '**') {
      flushSpan();
      const endIndex = text.indexOf('**', i + 2);
      if (endIndex !== -1) {
        currentMarks.push('strong');
        currentText = text.slice(i + 2, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'strong');
        i = endIndex + 2;
        continue;
      }
    }

    // Italic: *text* (but not ** which is bold)
    if (text[i] === '*' && text[i + 1] !== '*') {
      flushSpan();
      const endIndex = text.indexOf('*', i + 1);
      if (endIndex !== -1 && text[endIndex + 1] !== '*') {
        currentMarks.push('em');
        currentText = text.slice(i + 1, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'em');
        i = endIndex + 1;
        continue;
      }
    }

    // Inline code: `text`
    if (text[i] === '`') {
      flushSpan();
      const endIndex = text.indexOf('`', i + 1);
      if (endIndex !== -1) {
        currentMarks.push('code');
        currentText = text.slice(i + 1, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'code');
        i = endIndex + 1;
        continue;
      }
    }

    currentText += text[i];
    i++;
  }

  flushSpan();
  return spans.length > 0
    ? spans
    : [{ _type: 'span', _key: 'span-0', text, marks: [] }];
}

/**
 * Convert Markdown to Sanity Portable Text blocks
 */
function markdownToPortableText(markdown: string): any[] {
  const blocks: any[] = [];
  const lines = markdown.split('\n');
  let currentParagraph: string[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';
  let inList = false;
  let listType: 'bullet' | 'number' = 'bullet';
  let listItems: any[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        blocks.push({
          _type: 'block',
          _key: `block-${blocks.length}`,
          style: 'normal',
          markDefs: [],
          children: parseInlineMarkdown(text),
        });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(...listItems);
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          _type: 'code',
          _key: `code-${blocks.length}`,
          language: codeLanguage || 'text',
          code: codeContent.join('\n'),
        });
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushList();
        codeLanguage = line.slice(3).trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      flushList();
      const level = headerMatch[1].length;
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: `h${level}`,
        markDefs: [],
        children: parseInlineMarkdown(headerMatch[2]),
      });
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!inList || listType !== 'bullet') {
        flushList();
        inList = true;
        listType = 'bullet';
      }
      listItems.push({
        _type: 'block',
        _key: `list-${blocks.length + listItems.length}`,
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        markDefs: [],
        children: parseInlineMarkdown(bulletMatch[1]),
      });
      continue;
    }

    // Numbered list
    const numberMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberMatch) {
      flushParagraph();
      if (!inList || listType !== 'number') {
        flushList();
        inList = true;
        listType = 'number';
      }
      listItems.push({
        _type: 'block',
        _key: `list-${blocks.length + listItems.length}`,
        style: 'normal',
        listItem: 'number',
        level: 1,
        markDefs: [],
        children: parseInlineMarkdown(numberMatch[1]),
      });
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushParagraph();
      flushList();
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: 'blockquote',
        markDefs: [],
        children: parseInlineMarkdown(line.slice(2)),
      });
      continue;
    }

    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

/**
 * Get or create author in Sanity
 */
const getOrCreateAuthor = async (
  category: string,
): Promise<{ _type: 'reference'; _ref: string }> => {
  // Get author based on category specialty
  const author = getAuthorBySpecialty(category);

  // Check if author exists in Sanity
  const existingAuthor = await writeClient.fetch(
    `*[_type == "author" && slug.current == $slug][0]._id`,
    { slug: author.slug },
  );

  if (existingAuthor) {
    return { _type: 'reference', _ref: existingAuthor };
  }

  // Create the author
  const newAuthor = await writeClient.create({
    _type: 'author',
    name: author.name,
    slug: { _type: 'slug', current: author.slug },
    title: author.title,
    bio: author.bio,
    social: author.social,
  });

  return { _type: 'reference', _ref: newAuthor._id };
};

/**
 * Get or create category in Sanity
 */
const getOrCreateCategory = async (
  categoryName: string,
): Promise<{ _type: 'reference'; _ref: string }> => {
  const slug = categoryName.toLowerCase().replace(/\s+/g, '-');

  // Check if category exists
  const existingCategory = await writeClient.fetch(
    `*[_type == "blogCategory" && slug.current == $slug][0]._id`,
    { slug },
  );

  if (existingCategory) {
    return { _type: 'reference', _ref: existingCategory };
  }

  // Create the category
  const newCategory = await writeClient.create({
    _type: 'blogCategory',
    title: categoryName,
    slug: { _type: 'slug', current: slug },
  });

  return { _type: 'reference', _ref: newCategory._id };
};

/**
 * Create post in Sanity
 */
const createSanityPost = async (
  meta: BlogPostMeta,
  body: any[],
  featuredImage: FeaturedImage | null,
  authorRef: { _type: 'reference'; _ref: string },
  categoryRef: { _type: 'reference'; _ref: string },
  generationMeta: GenerationMeta,
  publishDate?: Date,
): Promise<string> => {
  const doc: any = {
    _type: 'post',
    title: meta.title,
    slug: { _type: 'slug', current: meta.slug },
    excerpt: meta.excerpt,
    body,
    author: authorRef,
    category: categoryRef,
    publishedAt: (publishDate ?? new Date()).toISOString(),
    status: 'published',
    seo: {
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      keywords: meta.keywords,
    },
    generationMeta,
  };

  if (featuredImage) {
    doc.featuredImage = {
      _type: 'image',
      asset: featuredImage.asset,
      alt: featuredImage.alt,
      credit: featuredImage.credit,
      creditUrl: featuredImage.creditUrl,
    };
  }

  const result = await writeClient.create(doc);
  return result._id;
};

/**
 * Generate and save a blog post for a specific topic
 */
export async function generateBlogPostForTopic(
  blogTopic: BlogTopic,
  publishDate?: Date,
): Promise<{
  slug: string;
  title: string;
  success: boolean;
  error?: string;
}> {
  try {
    console.log('Generating blog post for topic:', blogTopic.topic);

    // 1. Check if topic already exists
    const topicExists = await writeClient.fetch(topicExistsQuery, {
      topic: blogTopic.topic,
    });

    if (topicExists) {
      throw new Error(`Topic "${blogTopic.topic}" has already been covered`);
    }

    // 2. Generate metadata
    const meta = await generateBlogMeta(
      blogTopic.topic,
      blogTopic.category,
      blogTopic.keywords,
    );
    console.log('Generated metadata:', { title: meta.title, slug: meta.slug });

    // 3. Check if slug already exists
    const existingPost = await writeClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      { slug: meta.slug },
    );

    if (existingPost) {
      throw new Error(`Post with slug "${meta.slug}" already exists`);
    }

    // 4. Get recently covered topics for context
    const recentTopics: string[] = await writeClient.fetch(coveredTopicsQuery);

    // 5-8. Generate content, image, author, and category in parallel
    console.log('Generating content for:', meta.title);
    const [content, imageResult, authorRef, categoryRef] = await Promise.all([
      generateBlogContent(
        blogTopic.topic,
        meta.title,
        meta.keywords,
        blogTopic.category,
        recentTopics,
      ),
      getFeaturedImage(meta.title, meta.excerpt, blogTopic.category, meta.slug),
      getOrCreateAuthor(blogTopic.category),
      getOrCreateCategory(blogTopic.category),
    ]);

    if (!content) {
      throw new Error('Failed to generate content');
    }

    // 9. Convert content to Portable Text
    const portableText = markdownToPortableText(content);

    // 10. Prepare generation metadata
    const generationMeta: GenerationMeta = {
      isGenerated: true,
      topic: blogTopic.topic,
      generatedAt: new Date().toISOString(),
      model: 'gpt-4o',
      imageSource: imageResult.source,
      pexelsPhotoId: imageResult.pexelsPhotoId,
      imagePrompt: imageResult.imagePrompt,
      imageEvaluation: imageResult.evaluation
        ? {
            confidence: imageResult.evaluation.confidence,
            reasoning: imageResult.evaluation.reasoning,
            searchTerm: imageResult.searchTerm || '',
          }
        : undefined,
    };

    // 11. Create post in Sanity
    console.log('Creating post in Sanity:', meta.title);
    await createSanityPost(
      meta,
      portableText,
      imageResult.image,
      authorRef,
      categoryRef,
      generationMeta,
      publishDate,
    );

    console.log('Successfully generated blog post:', meta.slug);

    return {
      slug: meta.slug,
      title: meta.title,
      success: true,
    };
  } catch (error) {
    console.error('Error generating blog post:', error);
    return {
      slug: '',
      title: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a random blog post (for cron jobs)
 */
export async function generateRandomBlogPost(publishDate?: Date): Promise<{
  slug: string;
  title: string;
  success: boolean;
  error?: string;
}> {
  // Get recently covered topics to avoid repetition
  const recentTopics: string[] = await writeClient.fetch(coveredTopicsQuery);

  // Get a random topic that hasn't been covered
  const randomTopic = getRandomTopic(recentTopics);

  return generateBlogPostForTopic(randomTopic, publishDate);
}

/**
 * Seed all guest authors into Sanity
 */
export async function seedAuthors(): Promise<{
  success: boolean;
  created: number;
  skipped: number;
  error?: string;
}> {
  try {
    let created = 0;
    let skipped = 0;

    for (const author of GUEST_AUTHORS) {
      // Check if author exists
      const existing = await writeClient.fetch(
        `*[_type == "author" && slug.current == $slug][0]._id`,
        { slug: author.slug },
      );

      if (existing) {
        skipped++;
        continue;
      }

      // Create author
      await writeClient.create({
        _type: 'author',
        name: author.name,
        slug: { _type: 'slug', current: author.slug },
        title: author.title,
        bio: author.bio,
        social: author.social,
      });

      created++;
    }

    return { success: true, created, skipped };
  } catch (error) {
    return {
      success: false,
      created: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Repair corrupted blog posts that have body content stored as code blocks
 * This fixes posts where AI-generated markdown was stored as a code block instead of Portable Text
 */
export async function repairCorruptedBlogPosts(): Promise<{
  success: boolean;
  repaired: number;
  failed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let repaired = 0;
  let failed = 0;

  try {
    // Find all posts with body containing code blocks with language "markdown"
    const corruptedPosts = await writeClient.fetch<
      Array<{
        _id: string;
        title: string;
        body: Array<{ _type: string; code?: string; language?: string }>;
      }>
    >(
      `*[_type == "post" && body[0]._type == "code" && body[0].language == "markdown"]{
        _id,
        title,
        body
      }`,
    );

    console.log(
      `Found ${corruptedPosts.length} corrupted blog posts to repair`,
    );

    for (const post of corruptedPosts) {
      try {
        // Extract markdown from the code block
        const codeBlock = post.body[0];
        if (!codeBlock?.code) {
          errors.push(`Post "${post.title}" has no code content`);
          failed++;
          continue;
        }

        // Strip any markdown code fences and convert to Portable Text
        const cleanedMarkdown = stripMarkdownCodeFences(codeBlock.code);
        const portableText = markdownToPortableText(cleanedMarkdown);

        if (portableText.length === 0) {
          errors.push(`Post "${post.title}" resulted in empty Portable Text`);
          failed++;
          continue;
        }

        // Update the post with corrected body
        await writeClient.patch(post._id).set({ body: portableText }).commit();

        console.log(`Repaired post: ${post.title}`);
        repaired++;
      } catch (postError) {
        const errorMsg =
          postError instanceof Error ? postError.message : 'Unknown error';
        errors.push(`Failed to repair "${post.title}": ${errorMsg}`);
        failed++;
      }
    }

    return { success: true, repaired, failed, errors };
  } catch (error) {
    return {
      success: false,
      repaired,
      failed,
      errors: [
        ...errors,
        error instanceof Error ? error.message : 'Unknown error',
      ],
    };
  }
}

/**
 * Regenerate featured image for a single blog post
 * Tries Pexels first with AI evaluation, falls back to Gemini
 */
export async function regenerateBlogImage(postId: string): Promise<{
  success: boolean;
  postId: string;
  title?: string;
  imageSource?: 'pexels' | 'gemini';
  error?: string;
}> {
  try {
    // Fetch the post
    const post = await writeClient.fetch<{
      _id: string;
      title: string;
      excerpt: string;
      slug: { current: string };
      category: { title: string } | null;
    }>(
      `*[_type == "post" && _id == $postId][0]{
        _id,
        title,
        excerpt,
        slug,
        "category": category->{ title }
      }`,
      { postId },
    );

    if (!post) {
      return { success: false, postId, error: 'Post not found' };
    }

    console.log(`Regenerating image for: ${post.title}`);

    // Get new featured image
    const imageResult = await getFeaturedImage(
      post.title,
      post.excerpt,
      post.category?.title || 'Natural Hair Care',
      post.slug.current,
    );

    if (!imageResult.image) {
      return {
        success: false,
        postId,
        title: post.title,
        error: 'Failed to generate new image',
      };
    }

    // Update the post with new image
    await writeClient
      .patch(postId)
      .set({
        featuredImage: {
          _type: 'image',
          asset: imageResult.image.asset,
          alt: imageResult.image.alt,
          credit: imageResult.image.credit,
          creditUrl: imageResult.image.creditUrl,
        },
        'generationMeta.imageSource': imageResult.source,
        'generationMeta.pexelsPhotoId': imageResult.pexelsPhotoId,
        'generationMeta.imagePrompt': imageResult.imagePrompt,
        'generationMeta.imageEvaluation': imageResult.evaluation
          ? {
              confidence: imageResult.evaluation.confidence,
              reasoning: imageResult.evaluation.reasoning,
              searchTerm: imageResult.searchTerm || '',
            }
          : undefined,
      })
      .commit();

    console.log(
      `Successfully regenerated image for: ${post.title} (${imageResult.source})`,
    );

    return {
      success: true,
      postId,
      title: post.title,
      imageSource: imageResult.source,
    };
  } catch (error) {
    console.error(`Error regenerating image for post ${postId}:`, error);
    return {
      success: false,
      postId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Regenerate featured images for all blog posts
 * Useful for refreshing images or replacing AI-generated ones with Pexels
 */
export async function regenerateAllBlogImages(options?: {
  /** Only regenerate posts with AI-generated images */
  onlyAiGenerated?: boolean;
  /** Only regenerate posts without images */
  onlyMissing?: boolean;
  /** Limit the number of posts to process */
  limit?: number;
}): Promise<{
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{
    postId: string;
    title: string;
    success: boolean;
    imageSource?: 'pexels' | 'gemini';
    error?: string;
  }>;
}> {
  const results: Array<{
    postId: string;
    title: string;
    success: boolean;
    imageSource?: 'pexels' | 'gemini';
    error?: string;
  }> = [];

  try {
    // Build the query based on options
    let query = `*[_type == "post"`;

    if (options?.onlyAiGenerated) {
      query += ` && generationMeta.imageSource == "gemini"`;
    }

    if (options?.onlyMissing) {
      query += ` && !defined(featuredImage.asset)`;
    }

    query += `] | order(publishedAt desc)`;

    if (options?.limit) {
      query += `[0...${options.limit}]`;
    }

    query += `{ _id, title }`;

    const posts =
      await writeClient.fetch<Array<{ _id: string; title: string }>>(query);

    console.log(`Found ${posts.length} posts to process`);

    for (const post of posts) {
      const result = await regenerateBlogImage(post._id);
      results.push({
        postId: post._id,
        title: post.title,
        success: result.success,
        imageSource: result.imageSource,
        error: result.error,
      });

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      success: true,
      processed: posts.length,
      succeeded,
      failed,
      results,
    };
  } catch (error) {
    return {
      success: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      results,
    };
  }
}

/**
 * Seed blog categories into Sanity
 */
export async function seedCategories(): Promise<{
  success: boolean;
  created: number;
  skipped: number;
  error?: string;
}> {
  const categories = [
    { title: 'Natural Hair Care', color: '#4A5568' },
    { title: 'Protective Styles', color: '#805AD5' },
    { title: 'Hair Products', color: '#38A169' },
    { title: 'Hair Growth', color: '#D69E2E' },
    { title: 'Styling', color: '#E53E3E' },
    { title: 'Skincare', color: '#ED64A6' },
    { title: 'Beauty', color: '#3182CE' },
    { title: 'Wellness', color: '#319795' },
    { title: 'Trends', color: '#DD6B20' },
    { title: 'Hair Types', color: '#9F7AEA' },
  ];

  try {
    let created = 0;
    let skipped = 0;

    for (const category of categories) {
      const slug = category.title.toLowerCase().replace(/\s+/g, '-');

      // Check if category exists
      const existing = await writeClient.fetch(
        `*[_type == "blogCategory" && slug.current == $slug][0]._id`,
        { slug },
      );

      if (existing) {
        skipped++;
        continue;
      }

      // Create category
      await writeClient.create({
        _type: 'blogCategory',
        title: category.title,
        slug: { _type: 'slug', current: slug },
        color: category.color,
      });

      created++;
    }

    return { success: true, created, skipped };
  } catch (error) {
    return {
      success: false,
      created: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
