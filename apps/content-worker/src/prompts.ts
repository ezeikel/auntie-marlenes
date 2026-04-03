/**
 * Scene prompts for product image generation, mapped to product categories.
 * Each category has multiple scene options for variety.
 */

const SCENE_PROMPTS: Record<string, string[]> = {
  'Hair Care': [
    'warm bathroom shelf with fluffy towels, potted plants, and natural sunlight streaming through a window',
    'wooden vanity table during wash day, with warm ambient lighting and cozy bathroom setting',
    'beautiful marble bathroom counter with folded towels, a wooden comb, and soft morning light',
  ],
  'Wigs & Extensions': [
    'professional salon styling station with a ring light, mirror, and warm ambient lighting',
    'elegant bedroom vanity with a large mirror, soft golden lighting, and silk accessories',
    'modern salon chair setup with styling tools, warm tones, and professional lighting',
  ],
  'Braiding Hair': [
    'cozy living room setting with a comfortable chair, warm lighting, and natural textures',
    'home hair styling session with warm kitchen background, natural sunlight, and homey decor',
    'bright, welcoming salon space with colourful braiding accessories and warm wood tones',
  ],
  'Skincare': [
    'luxurious marble bathroom counter with candles, fresh flowers, and soft diffused lighting',
    'minimalist bathroom shelf with plants, warm wood accents, and morning sunlight',
    'self-care setup on a clean white surface with eucalyptus sprigs and warm ambient glow',
  ],
  'Styling': [
    'bedroom dresser with a round mirror, golden hour light, and fresh flowers',
    'getting-ready scene on a vanity with warm lighting, jewellery, and personal touches',
    'clean modern shelf with styling tools, warm wood background, and soft studio lighting',
  ],
};

const DEFAULT_SCENES = [
  'warm, inviting bathroom shelf with natural wood, plants, towels, and soft golden lighting',
  'cozy vanity setup with warm tones, natural textures, and ambient light',
  'beautiful product display on a clean surface with warm, inviting styling',
];

/**
 * Get a random scene prompt for a product category.
 */
export function getScenePrompt(category: string): string {
  const scenes = SCENE_PROMPTS[category] || DEFAULT_SCENES;
  return scenes[Math.floor(Math.random() * scenes.length)];
}

/**
 * Build the full image generation prompt for a product.
 */
export function buildImagePrompt(product: {
  name: string;
  brand: string;
  category: string;
}): string {
  const scene = getScenePrompt(product.category);

  return [
    `Professional lifestyle photograph for an Instagram ad.`,
    `The product "${product.name}" by ${product.brand} is placed naturally in a ${scene}.`,
    `The product packaging should be clearly visible and recognisable.`,
    `Warm, cozy colour palette with soft natural lighting.`,
    `High-end product photography style. Photorealistic.`,
    `Do NOT include any text, logos, watermarks, or overlays in the image.`,
    `Aspect ratio: 4:5 (1080x1350 pixels).`,
  ].join(' ');
}

/**
 * Build the headline generation prompt for a product.
 */
export function buildHeadlinePrompt(product: {
  name: string;
  brand: string;
  category: string;
}): string {
  return [
    `Generate a catchy, short headline for an Instagram ad for the product "${product.name}" by ${product.brand} (category: ${product.category}).`,
    `The headline should be 2-5 words, aspirational and engaging.`,
    `Also generate a short subheading of 4-8 words.`,
    ``,
    `Brand context: Auntie Marlene's is a black-owned hair and beauty brand. The tone should feel like trusted advice from someone in your community who genuinely knows your hair — a hairdresser, a cousin, someone who put you onto this product. Warm, confident, knowing. Not corporate, not try-hard familiar.`,
    ``,
    `Do NOT use terms of endearment like "honey", "babe", "queen", "girl", "hun", "sis". Let the confidence speak for itself.`,
    ``,
    `Examples of good headlines:`,
    `- "Wash day made easy"`,
    `- "Your bathroom faves"`,
    `- "Salon results at home"`,
    `- "Curls that last"`,
    `- "Moisture that stays"`,
    `- "Put on by the best"`,
    `- "The one you need"`,
    ``,
    `Respond in JSON format: { "headline": "...", "subheading": "..." }`,
  ].join('\n');
}
