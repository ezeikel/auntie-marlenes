import type { Product } from './constants';

/**
 * Shopify GraphQL Product Type (simplified)
 */
type ShopifyProduct = {
  id: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        } | null;
        availableForSale: boolean;
        selectedOptions?: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
  options?: Array<{
    name: string;
    values: string[];
  }>;
  metafields?: Array<{
    key: string;
    value: string;
  } | null>;
};

/**
 * Extract color options from Shopify product variants
 */
function extractColors(
  options?: Array<{ name: string; values: string[] }>,
  images?: Array<string>,
): Array<{ name: string; value: string; image: string }> | undefined {
  if (!options) return undefined;

  const colorOption = options.find(
    (opt) =>
      opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour',
  );

  if (!colorOption) return undefined;

  return colorOption.values.map((color, idx) => ({
    name: color,
    value: color.toLowerCase(),
    image: images?.[idx] || images?.[0] || '/placeholder.svg',
  }));
}

/**
 * Extract size options from Shopify product variants
 */
function extractSizes(
  options?: Array<{ name: string; values: string[] }>,
): string[] | undefined {
  if (!options) return undefined;

  const sizeOption = options.find((opt) => opt.name.toLowerCase() === 'size');

  return sizeOption?.values;
}

/**
 * Extract rating from Shopify metafields
 */
function extractRating(
  metafields?: Array<{ key: string; value: string } | null>,
): number | undefined {
  if (!metafields) return undefined;

  const ratingField = metafields
    .filter((field): field is { key: string; value: string } => field !== null)
    .find((field) => field.key === 'rating');
  if (!ratingField) return undefined;

  const rating = parseFloat(ratingField.value);
  return Number.isNaN(rating) ? undefined : rating;
}

/**
 * Extract review count from Shopify metafields
 */
function extractReviewCount(
  metafields?: Array<{ key: string; value: string } | null>,
): number | undefined {
  if (!metafields) return undefined;

  const reviewCountField = metafields
    .filter((field): field is { key: string; value: string } => field !== null)
    .find((field) => field.key === 'review_count');
  if (!reviewCountField) return undefined;

  const count = parseInt(reviewCountField.value, 10);
  return Number.isNaN(count) ? undefined : count;
}

/**
 * Adapt a Shopify product to the v0 Product type
 */
export function adaptShopifyProduct(shopifyProduct: ShopifyProduct): Product {
  const images = shopifyProduct.images.edges.map((edge) => edge.node.url);
  const firstVariant = shopifyProduct.variants.edges[0]?.node;

  return {
    id: shopifyProduct.id,
    name: shopifyProduct.title,
    brand: shopifyProduct.vendor || 'Unknown Brand',
    category: shopifyProduct.productType || 'Uncategorized',
    description: shopifyProduct.descriptionHtml || '',
    price: firstVariant ? parseFloat(firstVariant.price.amount) : 0,
    compareAtPrice: firstVariant?.compareAtPrice
      ? parseFloat(firstVariant.compareAtPrice.amount)
      : undefined,
    image: images[0] || '/placeholder.svg',
    images: images.length > 0 ? images : undefined,
    colors: extractColors(shopifyProduct.options, images),
    sizes: extractSizes(shopifyProduct.options),
    inStock: firstVariant?.availableForSale ?? false,
    rating: extractRating(shopifyProduct.metafields),
    reviewCount: extractReviewCount(shopifyProduct.metafields),
  };
}

/**
 * Adapt an array of Shopify products
 */
export function adaptShopifyProducts(
  shopifyProducts: ShopifyProduct[],
): Product[] {
  return shopifyProducts.map(adaptShopifyProduct);
}

/**
 * Get product variant ID for adding to cart
 * Returns the first available variant ID
 */
export function getVariantId(shopifyProduct: ShopifyProduct): string | null {
  const firstVariant = shopifyProduct.variants.edges[0]?.node;
  return firstVariant?.id || null;
}

/**
 * Get variant by selected options (color, size, etc.)
 */
export function getVariantByOptions(
  shopifyProduct: ShopifyProduct,
  selectedOptions: Record<string, string>,
): string | null {
  const variant = shopifyProduct.variants.edges.find(({ node }) => {
    if (!node.selectedOptions) return false;

    return node.selectedOptions.every(
      (option) =>
        selectedOptions[option.name.toLowerCase()] ===
        option.value.toLowerCase(),
    );
  });

  return variant?.node.id || null;
}
