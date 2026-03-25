export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const slugToProductType: Record<string, string> = {
  'wigs-extensions': 'Wigs & Extensions',
  mens: "Men's",
};

export function deslugify(slug: string): string {
  if (slugToProductType[slug]) {
    return slugToProductType[slug];
  }
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
