/**
 * Honest organisational byline for AI-assisted editorial.
 *
 * Do not add invented people, qualifications, years of experience or social
 * profiles here. A real contributor can be added only with their permission
 * and an accurate bio.
 */
export interface GuestAuthor {
  name: string;
  slug: string;
  title: string;
  bio: string;
  specialty: string[];
  social?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

export const EDITORIAL_AUTHOR: GuestAuthor = {
  name: "Auntie Marlene's Editorial Team",
  slug: 'auntie-marlenes-editorial-team',
  title: 'Editorial Team',
  bio: "Practical, source-checked guidance from Auntie Marlene's, a Black-owned hair and beauty supply store in South London. Our articles celebrate textured hair and melanin-rich skin without pretending to offer personal or medical advice.",
  specialty: [
    'Natural Hair Care',
    'Protective Styles',
    'Hair Products',
    'Hair Growth',
    'Styling',
    'Skincare',
    'Beauty',
    'Wellness',
    'Trends',
    'Hair Types',
  ],
};

export const GUEST_AUTHORS: GuestAuthor[] = [EDITORIAL_AUTHOR];

export function getRandomAuthor(): GuestAuthor {
  return EDITORIAL_AUTHOR;
}

export function getAuthorBySpecialty(_category: string): GuestAuthor {
  return EDITORIAL_AUTHOR;
}

export function getAuthorBySlug(slug: string): GuestAuthor | undefined {
  return slug === EDITORIAL_AUTHOR.slug ? EDITORIAL_AUTHOR : undefined;
}

export function getTotalAuthorsCount(): number {
  return GUEST_AUTHORS.length;
}
