/**
 * Search term mappings for Pexels photo searches
 *
 * Maps blog categories and topics to relevant search terms
 * Terms are ordered by relevance - first term is most specific
 *
 * Focus on Black hair care, natural hair, and beauty content
 */

// Category-based search terms
export const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  // Hair Care Categories
  'natural-hair': [
    'black woman natural hair',
    'afro hair care',
    'natural curly hair black woman',
    'textured hair portrait',
    'coily hair beauty',
  ],
  'protective-styles': [
    'black woman braids',
    'african braids hairstyle',
    'box braids beauty',
    'protective hairstyle black woman',
    'locs hairstyle portrait',
  ],
  'hair-products': [
    'natural hair products',
    'hair care routine',
    'hair oil treatment',
    'black hair care products',
    'curly hair moisturizer',
  ],
  'hair-growth': [
    'healthy hair growth',
    'black woman long hair',
    'natural hair journey',
    'hair health routine',
    'scalp care treatment',
  ],
  styling: [
    'black woman hairstyle',
    'natural hair styling',
    'twist out hairstyle',
    'wash and go curls',
    'afro styling routine',
  ],
  // Skincare Categories
  skincare: [
    'black woman skincare',
    'melanin skin care',
    'glowing dark skin',
    'skincare routine portrait',
    'black beauty face care',
  ],
  // Lifestyle Categories
  beauty: [
    'black woman beauty portrait',
    'african beauty makeup',
    'melanin beauty editorial',
    'black model portrait',
    'natural beauty photography',
  ],
  wellness: [
    'self care routine',
    'black woman wellness',
    'relaxation spa',
    'mindful beauty',
    'holistic self care',
  ],
  trends: [
    'beauty trends',
    'modern hairstyle black woman',
    'fashion beauty portrait',
    'contemporary hair styling',
    'beauty editorial photography',
  ],
  'hair-types': [
    'curly hair texture',
    'coily hair type',
    '4c hair texture',
    'natural curl pattern',
    'textured hair close up',
  ],
};

// Topic-specific search terms (for blog post titles/keywords)
export const TOPIC_SEARCH_TERMS: Record<string, string[]> = {
  // Hair care topics
  moisture: [
    'moisturizing hair',
    'hydrated curls',
    'hair conditioning treatment',
    'deep conditioning',
  ],
  wash: [
    'washing natural hair',
    'hair wash day',
    'shampoo natural hair',
    'cleansing curly hair',
  ],
  protein: [
    'protein hair treatment',
    'hair strengthening',
    'healthy hair routine',
    'hair repair treatment',
  ],
  detangle: [
    'detangling natural hair',
    'brushing curly hair',
    'gentle hair care',
    'wide tooth comb hair',
  ],
  trim: [
    'hair trimming',
    'cutting split ends',
    'hair salon trim',
    'hair maintenance',
  ],
  // Protective styles
  braids: [
    'box braids hairstyle',
    'cornrows braids',
    'african braids beauty',
    'braiding hair salon',
  ],
  locs: [
    'dreadlocks hairstyle',
    'loc maintenance',
    'starter locs journey',
    'mature locs portrait',
  ],
  twists: [
    'twist hairstyle natural hair',
    'two strand twists',
    'flat twists style',
    'mini twists protective',
  ],
  wigs: [
    'wig styling',
    'natural wig hairstyle',
    'lace front wig',
    'protective style wig',
  ],
  weave: [
    'hair weave styling',
    'sew in weave',
    'hair extensions beauty',
    'weave protective style',
  ],
  // Styling topics
  'twist out': [
    'twist out natural hair',
    'defined curls styling',
    'natural curl definition',
    'textured hair styling',
  ],
  'wash and go': [
    'wash and go curls',
    'natural curls wet',
    'defined wash day curls',
    'curly hair routine',
  ],
  'flat twist': [
    'flat twist hairstyle',
    'flat twist out',
    'protective flat twists',
    'natural hair flat twist',
  ],
  bantu: [
    'bantu knots hairstyle',
    'bantu knot out',
    'african bantu style',
    'bantu knots portrait',
  ],
  afro: [
    'afro hairstyle portrait',
    'big afro hair',
    'natural afro beauty',
    'textured afro styling',
  ],
  // Skincare topics
  glow: [
    'glowing melanin skin',
    'radiant dark skin',
    'healthy skin glow',
    'skincare glow routine',
  ],
  hyperpigmentation: [
    'skincare routine face',
    'melanin skincare',
    'even skin tone',
    'dark skin beauty care',
  ],
  sunscreen: [
    'applying sunscreen',
    'sun protection skin',
    'skincare spf routine',
    'melanin sun care',
  ],
  // Seasonal/Occasion
  summer: [
    'summer hair care',
    'beach natural hair',
    'summer beauty portrait',
    'vacation hairstyle',
  ],
  winter: [
    'winter hair care',
    'cold weather hair protection',
    'winter beauty routine',
    'moisturizing dry hair',
  ],
  wedding: [
    'wedding hairstyle black woman',
    'bridal natural hair',
    'elegant updo hairstyle',
    'wedding day beauty',
  ],
  // Product types
  oil: [
    'hair oil treatment',
    'natural hair oils',
    'scalp oiling routine',
    'coconut oil hair',
  ],
  shampoo: [
    'shampooing hair',
    'clarifying shampoo wash',
    'natural hair cleansing',
    'sulfate free shampoo',
  ],
  conditioner: [
    'conditioning natural hair',
    'deep conditioner treatment',
    'leave in conditioner',
    'moisturizing hair product',
  ],
  gel: [
    'styling gel curls',
    'edge control styling',
    'curl defining gel',
    'natural hair gel',
  ],
  // Experience level
  beginner: [
    'learning hair care',
    'natural hair journey start',
    'hair care basics',
    'simple hair routine',
  ],
  transition: [
    'transitioning to natural hair',
    'hair transition journey',
    'growing out relaxer',
    'natural hair growth',
  ],
  'big chop': [
    'short natural hair',
    'twa hairstyle',
    'big chop natural',
    'short afro beauty',
  ],
};

// Fallback terms for generic hair/beauty content
export const FALLBACK_SEARCH_TERMS = [
  'black woman portrait beauty',
  'natural hair beauty portrait',
  'african beauty editorial',
  'melanin beauty photography',
  'textured hair portrait',
];

/**
 * Get search terms for a blog category
 */
export function getSearchTermsForCategory(category: string): string[] {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_SEARCH_TERMS[normalizedCategory] || FALLBACK_SEARCH_TERMS;
}

/**
 * Get search terms based on blog post keywords/title
 * Analyzes the text to find relevant search terms
 */
export function getSearchTermsForTopic(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const matchedTerms: string[] = [];

  // Check each topic for matches in the text
  for (const [topic, terms] of Object.entries(TOPIC_SEARCH_TERMS)) {
    if (normalizedText.includes(topic)) {
      matchedTerms.push(...terms);
    }
  }

  // If no matches, use fallback
  if (matchedTerms.length === 0) {
    return FALLBACK_SEARCH_TERMS;
  }

  // Remove duplicates and return
  return [...new Set(matchedTerms)];
}

/**
 * Combine category and topic search terms, deduplicating
 */
export function getCombinedSearchTerms(
  category: string,
  title: string,
): string[] {
  const categoryTerms = getSearchTermsForCategory(category);
  const topicTerms = getSearchTermsForTopic(title);

  // Combine and deduplicate, prioritizing topic-specific terms
  const combined = [...topicTerms, ...categoryTerms];
  return [...new Set(combined)];
}

/**
 * Generate alt text for a hair/beauty-related image
 */
export function generateAltText(
  searchTerm: string,
  context: { title?: string; category?: string } = {},
): string {
  // If we have title context, use it
  if (context.title) {
    return `Image related to ${context.title}`;
  }

  // Otherwise, base it on the search term
  const cleanedTerm = searchTerm
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${cleanedTerm} - Auntie Marlene's Blog`;
}
