import { z } from 'zod';

/**
 * Product type used across web and mobile
 */
export type Product = {
  id: string;
  handle: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  colors?: { name: string; value: string; image: string }[];
  sizes?: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  saveCount?: number;
  variantId?: string; // First available variant ID for add to cart
};

/**
 * Shopify GraphQL Product Type (simplified)
 */
export type ShopifyProduct = {
  id: string;
  handle: string;
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
 * Shopify Cart Line Item
 */
export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: {
      amount: string;
      currencyCode: string;
    };
    compareAtPriceV2?: {
      amount: string;
      currencyCode: string;
    } | null;
    product: {
      id: string;
      title: string;
      handle: string;
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
    };
    image?: {
      url: string;
      altText: string | null;
    } | null;
  };
};

/**
 * Shopify Cart
 */
export type ShopifyCart = {
  id: string;
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  checkoutUrl: string;
  cost: {
    checkoutChargeAmount?: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmountEstimated: boolean;
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmountEstimated: boolean;
  };
  createdAt: string;
};

/**
 * Cart Line Item (adapted for app use)
 */
export type CartLineItem = {
  id: string;
  productId: string;
  variantId: string;
  handle: string;
  name: string;
  brand: string;
  variant: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image: string;
};

/**
 * Cart type
 */
export type Cart = {
  id: string;
  lines: CartLineItem[];
  subtotal: number;
  total: number;
  checkoutUrl: string;
  itemCount: number;
};

/**
 * Zod schemas for validation
 */
export const ProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  description: z.string(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  image: z.string(),
  images: z.array(z.string()).optional(),
  colors: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        image: z.string(),
      }),
    )
    .optional(),
  sizes: z.array(z.string()).optional(),
  inStock: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().nonnegative().optional(),
  saveCount: z.number().nonnegative().optional(),
});
