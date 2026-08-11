import { generateObject, generateText } from 'ai';
import { getAllProducts } from '../shopify';
import { getAuthorBySpecialty } from './authors';
import { generateDynamicTopics } from './dynamic-topics';
import { getFeaturedImage } from './image';
import {
  markdownToPortableText,
  type PortableTextNode,
} from './markdown-to-portable-text';
import { models } from './models';
import {
  BLOG_META_PROMPT,
  BLOG_META_SYSTEM,
  BLOG_POST_PROMPT,
  BLOG_POST_SYSTEM,
} from './prompts';
import {
  researchBlogTopic,
  researchPrompt,
  validateResearchCitations,
} from './research';
import { coveredTopicsQuery, topicExistsQuery, writeClient } from './sanity';
import { type BlogMeta, blogMetaSchema } from './schemas';
import { type BlogTopic, pickUncoveredTopic, seedTopicSlugs } from './topics';

type BlogPostMeta = {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
};

type SanityRef = { _type: 'reference'; _ref: string };

type GenerationMeta = {
  isGenerated: boolean;
  topic: string;
  generatedAt: string;
  model: string;
  imageSource: 'pexels' | 'openai';
  pexelsPhotoId?: number;
  imagePrompt?: string;
  imageEvaluation?: {
    confidence: number;
    reasoning: string;
    searchTerm: string;
  };
  sourcesCheckedAt: string;
  researchSources: string[];
};

/** Build a clean URL slug from a title. */
const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

/** Strip a leading/trailing markdown code fence the model sometimes adds. */
const stripMarkdownCodeFences = (content: string): string => {
  let stripped = content.replace(/^```(?:markdown|md)?\s*\n?/i, '');
  stripped = stripped.replace(/\n?```\s*$/i, '');
  return stripped.trim();
};

/** Generate SEO metadata (structured output) for a topic. */
const generateBlogMeta = async (
  topic: string,
  category: string,
  keywords: string[],
): Promise<BlogPostMeta> => {
  const prompt = BLOG_META_PROMPT.replace('{{TOPIC}}', topic)
    .replace('{{CATEGORY}}', category)
    .replace('{{KEYWORDS}}', keywords.join(', '));

  const { object } = await generateObject({
    model: models.textFast,
    schema: blogMetaSchema,
    system: BLOG_META_SYSTEM,
    prompt,
    temperature: 0.7,
  });

  const meta = object as BlogMeta;
  meta.slug = generateSlug(meta.title);
  return meta;
};

/** Generate the full markdown body for a post. */
const generateBlogContent = async (
  topic: string,
  title: string,
  keywords: string[],
  category: string,
  recentTopics: string[],
  research: string,
  productContext: string,
): Promise<string> => {
  const prompt = BLOG_POST_PROMPT.replace('{{TOPIC}}', topic)
    .replace('{{TITLE}}', title)
    .replace('{{KEYWORDS}}', keywords.join(', '))
    .replace('{{CATEGORY}}', category)
    .replace(
      '{{RECENT_TOPICS}}',
      recentTopics.length > 0 ? recentTopics.join('\n- ') : 'None',
    );

  const groundedPrompt = `${prompt}\n\nFACT-CHECKED RESEARCH DOSSIER:\n${research}\n\nLIVE CATALOGUE CONTEXT:\n${productContext || '(No close product match.)'}\n\nUse only the dossier for factual claims. Cite at least two dossier sources as inline Markdown links. Link named products only when they appear in the live catalogue context.`;

  const { text } = await generateText({
    model: models.text,
    system: BLOG_POST_SYSTEM,
    prompt: groundedPrompt,
    temperature: 0.7,
  });

  return stripMarkdownCodeFences(text);
};

const matchingProductContext = async (topic: BlogTopic): Promise<string> => {
  const products = await getAllProducts();
  const terms = [...(topic.productTerms ?? []), ...topic.keywords].map((term) =>
    term.toLowerCase(),
  );
  const matches = products.filter((product) => {
    const haystack =
      `${product.title} ${product.vendor} ${product.productType}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });

  return matches
    .slice(0, 12)
    .map(
      (product) =>
        `- ${product.title} by ${product.vendor}: https://www.auntiemarlenes.com/product/${product.handle}`,
    )
    .join('\n');
};

const validateArticleQuality = (markdown: string): void => {
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;
  const headings = markdown.match(/^##\s+/gm)?.length ?? 0;
  if (wordCount < 900 || wordCount > 2_200) {
    throw new Error(
      `Generated article failed length gate (${wordCount} words)`,
    );
  }
  if (headings < 4) {
    throw new Error(
      `Generated article failed structure gate (${headings} H2s)`,
    );
  }
  if (markdown.includes('—')) {
    throw new Error('Generated article contains a prohibited em dash');
  }
};

/** Upsert the specialty-matched author, return a Sanity reference. */
const getOrCreateAuthor = async (category: string): Promise<SanityRef> => {
  const author = getAuthorBySpecialty(category);

  const existing = await writeClient.fetch<string | null>(
    `*[_type == "author" && slug.current == $slug][0]._id`,
    { slug: author.slug },
  );
  if (existing) return { _type: 'reference', _ref: existing };

  const created = await writeClient.create({
    _type: 'author',
    name: author.name,
    slug: { _type: 'slug', current: author.slug },
    title: author.title,
    bio: author.bio,
    social: author.social,
  });
  return { _type: 'reference', _ref: created._id };
};

/** Upsert the category document, return a Sanity reference. */
const getOrCreateCategory = async (
  categoryName: string,
): Promise<SanityRef> => {
  const slug = categoryName.toLowerCase().replace(/\s+/g, '-');

  const existing = await writeClient.fetch<string | null>(
    `*[_type == "blogCategory" && slug.current == $slug][0]._id`,
    { slug },
  );
  if (existing) return { _type: 'reference', _ref: existing };

  const created = await writeClient.create({
    _type: 'blogCategory',
    title: categoryName,
    slug: { _type: 'slug', current: slug },
  });
  return { _type: 'reference', _ref: created._id };
};

/**
 * Generate one full blog post for a specific topic and PUBLISH it to Sanity.
 * Auto-published (status:'published'). Source retrieval, citation, length and
 * structure gates fail closed before the Sanity write; the house voice and
 * anti-colourist policy are also reinforced in the prompts.
 */
export async function generateBlogPostForTopic(
  blogTopic: BlogTopic,
): Promise<{ slug: string; title: string; success: boolean; error?: string }> {
  try {
    console.log('Generating blog post for topic:', blogTopic.topic);

    // 1. Idempotency: skip if this topic already has a post.
    const topicExists = await writeClient.fetch<boolean>(topicExistsQuery, {
      topic: blogTopic.topic,
    });
    if (topicExists) {
      throw new Error(`Topic "${blogTopic.topic}" has already been covered`);
    }

    // 2. Metadata.
    const meta = await generateBlogMeta(
      blogTopic.topic,
      blogTopic.category,
      blogTopic.keywords,
    );
    console.log('Generated metadata:', { title: meta.title, slug: meta.slug });

    // 3. Guard against a slug collision.
    const existingPost = await writeClient.fetch<string | null>(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      { slug: meta.slug },
    );
    if (existingPost) {
      throw new Error(`Post with slug "${meta.slug}" already exists`);
    }

    // 4. Recently covered topics (for internal-linking context).
    const coveredRows = await writeClient
      .fetch<Array<{ topic: string }>>(coveredTopicsQuery)
      .catch(() => []);
    const recentTopics = coveredRows
      .map((row) => row?.topic)
      .filter((t): t is string => Boolean(t));

    // 5. Retrieve live catalogue context and a current, verified source dossier
    // before drafting. Factual content fails closed if either step is missing.
    const productContext = await matchingProductContext(blogTopic);
    const research = await researchBlogTopic({
      topic: blogTopic,
      productContext,
    });

    // 6. Content, image, author, category, in parallel.
    console.log('Generating content for:', meta.title);
    const [content, imageResult, authorRef, categoryRef] = await Promise.all([
      generateBlogContent(
        blogTopic.topic,
        meta.title,
        meta.keywords,
        blogTopic.category,
        recentTopics,
        researchPrompt(research),
        productContext,
      ),
      getFeaturedImage(meta.title, meta.excerpt, blogTopic.category, meta.slug),
      getOrCreateAuthor(blogTopic.category),
      getOrCreateCategory(blogTopic.category),
    ]);

    if (!content) throw new Error('Failed to generate content');
    validateArticleQuality(content);
    validateResearchCitations(content, research);

    // 7. Markdown to Portable Text.
    const body: PortableTextNode[] = markdownToPortableText(content);

    // 8. Generation metadata (idempotency anchor lives here: generationMeta.topic).
    const generationMeta: GenerationMeta = {
      isGenerated: true,
      topic: blogTopic.topic,
      generatedAt: new Date().toISOString(),
      model: 'claude-sonnet-5',
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
      sourcesCheckedAt: research.checkedAt,
      researchSources: research.sources.map((source) => source.url),
    };

    // 9. Write the post (auto-published).
    console.log('Creating post in Sanity:', meta.title);
    await writeClient.create({
      _type: 'post',
      title: meta.title,
      slug: { _type: 'slug', current: meta.slug },
      excerpt: meta.excerpt,
      body,
      author: authorRef,
      category: categoryRef,
      publishedAt: new Date().toISOString(),
      status: 'published',
      seo: {
        metaTitle: meta.metaTitle,
        metaDescription: meta.metaDescription,
        keywords: meta.keywords,
      },
      generationMeta,
      ...(imageResult.image
        ? {
            featuredImage: {
              _type: 'image',
              asset: imageResult.image.asset,
              alt: imageResult.image.alt,
              credit: imageResult.image.credit,
              creditUrl: imageResult.image.creditUrl,
            },
          }
        : {}),
    });

    console.log(
      `[blog] published: ${meta.slug}${imageResult.image ? ' (with image)' : ''}`,
    );
    return { slug: meta.slug, title: meta.title, success: true };
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
 * Blog cron entry point. Picks an uncovered seed topic; when the seed list is
 * exhausted, falls back to the never-dry dynamic generator so the pipeline
 * never runs out of topics. Then generates + publishes one post.
 */
export async function runBlogCron(): Promise<{
  slug: string;
  title: string;
  success: boolean;
  error?: string;
}> {
  const coveredRows = await writeClient
    .fetch<Array<{ topic: string }>>(coveredTopicsQuery)
    .catch(() => []);
  const covered = new Set(
    coveredRows
      .map((row) => row?.topic)
      .filter((topic): topic is string => Boolean(topic)),
  );

  // 1. Prefer an uncovered fixed seed topic.
  let topic = pickUncoveredTopic(covered);

  // 2. Seed list exhausted → never-dry dynamic generation.
  if (!topic) {
    console.log('Seed topic list exhausted, generating dynamic topics');
    const dynamicTopics = await generateDynamicTopics(
      covered,
      seedTopicSlugs(),
    );
    if (dynamicTopics.length === 0) {
      return {
        slug: '',
        title: '',
        success: false,
        error: 'No uncovered topics available and dynamic generation failed',
      };
    }
    topic = dynamicTopics[0];
  }

  return generateBlogPostForTopic(topic);
}
