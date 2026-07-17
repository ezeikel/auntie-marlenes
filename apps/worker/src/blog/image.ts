import {
  experimental_generateImage as generateImage,
  generateObject,
} from 'ai';
import { findBestImage, type ImageEvaluation } from './image-evaluation';
import { models } from './models';
import {
  downloadPhoto,
  fetchBlogPhotosForEvaluation,
  formatPhotoCredit,
  type PexelsPhoto,
} from './pexels';
import { IMAGE_GENERATION_PROMPT, IMAGE_SEARCH_PROMPT } from './prompts';
import { writeClient } from './sanity';
import { imageSearchSchema } from './schemas';

// Blog featured image, standardised across the fleet:
//   Pexels multi-term search → Opus 4.8 vision judge → use only a HIGH match,
//   else generate with gpt-image-2 (high) → upload the bytes into Sanity as an
//   asset and return the reference. If everything fails the caller ships the
//   post with no image rather than blocking publication.

/** Minimum confidence for the AI judge to approve a Pexels image. */
const IMAGE_EVALUATION_THRESHOLD = 60;

export type FeaturedImage = {
  asset: { _type: 'reference'; _ref: string };
  alt: string;
  credit?: string;
  creditUrl?: string;
};

export type FeaturedImageResult = {
  image: FeaturedImage | null;
  source: 'pexels' | 'openai';
  pexelsPhotoId?: number;
  imagePrompt?: string;
  evaluation?: ImageEvaluation;
  searchTerm?: string;
};

type ImageSearchTerms = { searchTerms: string[]; altText: string };

/**
 * Ask the fast model for Pexels search terms + alt text tuned to the post.
 */
async function generateImageSearchTerms(
  title: string,
  excerpt: string,
  category: string,
): Promise<ImageSearchTerms> {
  const prompt = IMAGE_SEARCH_PROMPT.replace('{{TITLE}}', title)
    .replace('{{EXCERPT}}', excerpt)
    .replace('{{CATEGORY}}', category);

  const { object: searchTerms } = await generateObject({
    model: models.textFast,
    schema: imageSearchSchema,
    prompt,
    temperature: 0.7,
  });

  return searchTerms as ImageSearchTerms;
}

/**
 * gpt-image-2 (high) fallback — a clean, on-brand editorial image, no text.
 * Returns null on any failure so the post still publishes without an image.
 */
async function generateImageWithGptImage(
  title: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const prompt = IMAGE_GENERATION_PROMPT.replace('{{TITLE}}', title);

  try {
    console.log('Generating image with gpt-image-2 (high)...');
    const { image } = await generateImage({
      model: models.image,
      prompt: `Generate a high-quality professional photograph for this blog post. Do not include any text in the image. ${prompt}`,
      size: '1024x1024',
      providerOptions: { openai: { quality: 'high' } },
    });

    const buffer = Buffer.from(image.base64, 'base64');
    return { buffer, mimeType: image.mediaType ?? 'image/png' };
  } catch (error) {
    console.error('gpt-image-2 generation failed:', error);
    return null;
  }
}

async function uploadImageToSanity(
  buffer: Buffer,
  filename: string,
): Promise<{ _type: 'reference'; _ref: string }> {
  const asset = await writeClient.assets.upload('image', buffer, { filename });
  return { _type: 'reference', _ref: asset._id };
}

/**
 * Produce the post's featured image: Pexels high-match (Opus 4.8 judge) →
 * gpt-image-2 high fallback → Sanity asset. Never throws — returns
 * `{ image: null }` on total failure.
 */
export async function getFeaturedImage(
  title: string,
  excerpt: string,
  category: string,
  slug: string,
): Promise<FeaturedImageResult> {
  try {
    // 1. Search terms.
    console.log('Generating image search terms for:', title);
    const searchTerms = await generateImageSearchTerms(
      title,
      excerpt,
      category,
    );

    // 2. Candidate photos from Pexels.
    console.log('Searching Pexels with terms:', searchTerms.searchTerms);
    const pexelsResult = await fetchBlogPhotosForEvaluation(
      searchTerms.searchTerms,
      { orientation: 'landscape', size: 'large' },
    );

    let selectedPhoto: PexelsPhoto | null = null;
    let selectedSearchTerm = '';
    let evaluationResult: ImageEvaluation | null = null;

    if (pexelsResult.photos.length > 0) {
      // 3. Opus 4.8 vision judge.
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
        });
      } else {
        const bestEvaluation = evaluations.reduce(
          (best, curr) => (curr.confidence > best.confidence ? curr : best),
          evaluations[0],
        );
        console.log('AI rejected all Pexels images:', {
          bestConfidence: bestEvaluation?.confidence ?? 0,
          threshold: IMAGE_EVALUATION_THRESHOLD,
        });
      }
    }

    // 4. Use the selected Pexels photo if the judge approved one.
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

    // 5. gpt-image-2 (high) fallback.
    console.log('No suitable Pexels image found, generating with gpt-image-2');
    const generatedResult = await generateImageWithGptImage(title);

    if (generatedResult) {
      const extension = generatedResult.mimeType.includes('png')
        ? 'png'
        : 'jpg';
      const assetRef = await uploadImageToSanity(
        generatedResult.buffer,
        `${slug}-featured-generated.${extension}`,
      );

      return {
        image: {
          asset: assetRef,
          alt: searchTerms.altText,
          credit: 'Generated with AI',
        },
        source: 'openai',
        imagePrompt: IMAGE_GENERATION_PROMPT.replace('{{TITLE}}', title),
      };
    }

    console.log('gpt-image-2 generation failed, no image available');
    return { image: null, source: 'openai' };
  } catch (error) {
    console.error('Error getting featured image:', error);
    return { image: null, source: 'pexels' };
  }
}
