import type { Product } from '@/lib/constants';

export type FilterOption = {
  id: string;
  label: string;
  count?: number;
};

export type FilterSection = {
  id: string;
  title: string;
  type: 'checkbox' | 'price' | 'toggle';
  options?: FilterOption[];
  min?: number;
  max?: number;
};

export function getFilterSections(products: Product[]): FilterSection[] {
  // Derive categories from products
  const categoryCounts = new Map<string, number>();
  for (const p of products) {
    if (p.category) {
      categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
    }
  }
  const categoryOptions: FilterOption[] = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      count,
    }));

  // Derive brands from products
  const brandCounts = new Map<string, number>();
  for (const p of products) {
    if (p.brand) {
      brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
    }
  }
  const brandOptions: FilterOption[] = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      count,
    }));

  // Derive price range from products
  const prices = products.map((p) => p.price).filter((p) => p > 0);
  const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000;

  return [
    {
      id: 'availability',
      title: 'Availability',
      type: 'toggle',
    },
    {
      id: 'category',
      title: 'Category',
      type: 'checkbox',
      options: categoryOptions,
    },
    {
      id: 'brand',
      title: 'Brand',
      type: 'checkbox',
      options: brandOptions,
    },
    {
      id: 'price',
      title: 'Price',
      type: 'price',
      min: 0,
      max: maxPrice,
    },
  ];
}

export const filterSections: FilterSection[] = getFilterSections([]);
