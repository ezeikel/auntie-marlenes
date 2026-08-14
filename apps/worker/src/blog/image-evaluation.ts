/**
 * AI-powered image evaluation for blog posts (worker copy).
 *
 * Uses the Claude Sonnet 5 vision judge to decide whether a stock photo is a
 * relevant, on-brand featured image for Auntie Marlene's hair + beauty content.
 * Ported from apps/web/lib/ai/image-evaluation.ts.
 */

import { generateText, Output } from 'ai';
import { models } from './models';
import { type ImageEvaluation, imageEvaluationSchema } from './schemas';

export interface EvaluateImageOptions {
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  searchTerm: string;
  minConfidence?: number;
}

/**
 * Evaluate whether a single stock photo suits a blog post. Falls back to a
 * neutral "accept" verdict if the judge errors, so a transient failure never
 * blocks publication.
 */
export async function evaluateImageRelevance(
  options: EvaluateImageOptions,
): Promise<ImageEvaluation> {
  const { title, excerpt, category, imageUrl, searchTerm } = options;

  const prompt = `You are an expert image evaluator for a Black-owned hair and beauty supply blog (Auntie Marlene's).

BLOG POST CONTEXT:
- Title: ${title}
- Excerpt: ${excerpt}
- Category: ${category}
- Search term used: "${searchTerm}"

EVALUATION CRITERIA:
1. Representation: Does the image feature Black individuals with textured/natural hair?
2. Hair Visibility: Is the hair texture visible and well-displayed?
3. Relevance: Does the image relate to the blog post's specific topic?
4. Quality: Is the image professional, well-lit, and high resolution?
5. Authenticity: Does it feel authentic and relatable (not overly stereotypical)?
6. Context: Is the setting/scenario appropriate for hair care or beauty content?

POSITIVE criteria (increases confidence):
- Shows Black women/men with textured natural hair (3c-4c types)
- Hair texture is clearly visible and well-displayed
- Professional quality, good lighting
- Authentic, relatable representation
- Relevant to hair care, styling, or beauty context
- Diverse, modern settings
- High resolution, suitable for featured image

NEGATIVE criteria (decreases confidence):
- Generic stock photo feel
- Hair texture not visible or not relevant to topic
- Poor representation or stereotypical imagery
- Wrong hair type (e.g., straight hair for a natural hair article)
- Irrelevant background or context
- Low quality or poor lighting
- Overly posed or artificial looking
- Text overlays or watermarks
- Not featuring Black individuals when the context requires it

Analyze the attached image and determine if it's a good match for this blog post.`;

  try {
    const { output: evaluation } = await generateText({
      model: models.judge,
      output: Output.object({ schema: imageEvaluationSchema }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image', image: imageUrl },
          ],
        },
      ],
    });

    if (!evaluation) {
      throw new Error('Judge returned no structured output');
    }

    return evaluation;
  } catch (error) {
    console.error('Image evaluation failed:', error);
    return {
      isRelevant: true,
      confidence: 50,
      reasoning: 'Evaluation failed, defaulting to accept image',
      concerns: ['Evaluation error - could not analyze image'],
    };
  }
}

/**
 * Evaluate several candidate images in parallel and return the highest-scoring
 * one that clears `minConfidence`, or null if none qualify.
 */
export async function findBestImage(
  images: Array<{ url: string; searchTerm: string }>,
  context: { title: string; excerpt: string; category: string },
  minConfidence: number = 60,
): Promise<{
  selectedIndex: number | null;
  evaluations: ImageEvaluation[];
}> {
  const evaluations = await Promise.all(
    images.map((img) =>
      evaluateImageRelevance({
        ...context,
        imageUrl: img.url,
        searchTerm: img.searchTerm,
        minConfidence,
      }),
    ),
  );

  let bestIndex: number | null = null;
  let bestConfidence = 0;

  evaluations.forEach((evaluation, index) => {
    if (
      evaluation.isRelevant &&
      evaluation.confidence >= minConfidence &&
      evaluation.confidence > bestConfidence
    ) {
      bestIndex = index;
      bestConfidence = evaluation.confidence;
    }
  });

  return { selectedIndex: bestIndex, evaluations };
}

export { type ImageEvaluation };
