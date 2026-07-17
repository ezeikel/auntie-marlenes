/**
 * Pexels API client (worker copy).
 *
 * Ported from apps/web/lib/pexels/client.ts. The Next-specific `next.revalidate`
 * fetch option is dropped — this runs in a plain Node/Bun process. Only the
 * functions the blog pipeline needs are kept: multi-term candidate fetch (for
 * the Opus 4.8 judge), photo download, and credit formatting.
 */

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

export interface SearchOptions {
  page?: number;
  per_page?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
  locale?: string;
}

export interface FetchBlogPhotosResult {
  photos: Array<{
    photo: PexelsPhoto;
    searchTerm: string;
  }>;
  error?: string;
}

const PEXELS_API_BASE = 'https://api.pexels.com/v1';
const DEFAULT_PER_PAGE = 15;

function getApiKey(): string {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY environment variable is not set');
  }
  return apiKey;
}

export async function searchPhotos(
  query: string,
  options: SearchOptions = {},
): Promise<PexelsSearchResponse> {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    query,
    page: String(options.page ?? 1),
    per_page: String(options.per_page ?? DEFAULT_PER_PAGE),
  });

  if (options.orientation) params.set('orientation', options.orientation);
  if (options.size) params.set('size', options.size);
  if (options.color) params.set('color', options.color);
  if (options.locale) params.set('locale', options.locale);

  const response = await fetch(`${PEXELS_API_BASE}/search?${params}`, {
    headers: { Authorization: apiKey },
  });

  if (!response.ok) {
    throw new Error(
      `Pexels API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<PexelsSearchResponse>;
}

/**
 * Fetch multiple candidate photos across several search terms so the AI judge
 * can pick the most on-brand one. Returns up to `maxPhotos` results.
 */
export async function fetchBlogPhotosForEvaluation(
  searchTerms: string[],
  options: SearchOptions = { orientation: 'landscape', size: 'large' },
  maxPhotos: number = 5,
): Promise<FetchBlogPhotosResult> {
  const results: Array<{ photo: PexelsPhoto; searchTerm: string }> = [];

  for (const term of searchTerms) {
    if (results.length >= maxPhotos) break;

    try {
      const response = await searchPhotos(term, options);
      const remaining = maxPhotos - results.length;
      const topPhotos = response.photos.slice(0, Math.min(3, remaining));

      for (const photo of topPhotos) {
        results.push({ photo, searchTerm: term });
        if (results.length >= maxPhotos) break;
      }
    } catch (error) {
      console.error(`Error searching Pexels for "${term}":`, error);
      // Continue to the next search term.
    }
  }

  if (results.length === 0) {
    return { photos: [], error: 'No photos found for any search term' };
  }

  return { photos: results };
}

/**
 * Download a photo at the given size and return it as a Buffer, ready to upload
 * into Sanity as an asset.
 */
export async function downloadPhoto(
  photo: PexelsPhoto,
  size: keyof PexelsPhoto['src'] = 'large2x',
): Promise<Buffer> {
  const url = photo.src[size];
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download photo: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function formatPhotoCredit(photo: PexelsPhoto): {
  credit: string;
  creditUrl: string;
} {
  return {
    credit: `Photo by ${photo.photographer} on Pexels`,
    creditUrl: photo.photographer_url,
  };
}
