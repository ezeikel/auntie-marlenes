import { describe, it, expect } from 'vitest';
import {
  adaptShopifyProduct,
  adaptShopifyProducts,
  getVariantId,
  getVariantByOptions,
} from '../shopify-adapter';

function makeShopifyProduct(overrides: Record<string, any> = {}) {
  return {
    id: 'gid://shopify/Product/1',
    handle: 'test-product',
    title: 'Test Product',
    descriptionHtml: '<p>A test product</p>',
    vendor: 'Test Brand',
    productType: 'Hair Care',
    images: {
      edges: [
        {
          node: { url: 'https://cdn.shopify.com/img1.jpg', altText: 'Image 1' },
        },
        {
          node: { url: 'https://cdn.shopify.com/img2.jpg', altText: 'Image 2' },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default',
            price: { amount: '29.99', currencyCode: 'GBP' },
            compareAtPrice: { amount: '39.99', currencyCode: 'GBP' },
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: 'Medium' }],
          },
        },
      ],
    },
    options: [],
    metafields: [],
    ...overrides,
  };
}

describe('adaptShopifyProduct', () => {
  it('maps basic fields correctly', () => {
    const product = adaptShopifyProduct(makeShopifyProduct());

    expect(product.id).toBe('gid://shopify/Product/1');
    expect(product.handle).toBe('test-product');
    expect(product.name).toBe('Test Product');
    expect(product.brand).toBe('Test Brand');
    expect(product.category).toBe('Hair Care');
    expect(product.description).toBe('<p>A test product</p>');
    expect(product.price).toBe(29.99);
    expect(product.currencyCode).toBe('GBP');
    expect(product.compareAtPrice).toBe(39.99);
    expect(product.inStock).toBe(true);
  });

  it('maps images correctly', () => {
    const product = adaptShopifyProduct(makeShopifyProduct());
    expect(product.image).toBe('https://cdn.shopify.com/img1.jpg');
    expect(product.images).toEqual([
      'https://cdn.shopify.com/img1.jpg',
      'https://cdn.shopify.com/img2.jpg',
    ]);
  });

  it('handles empty variants', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({ variants: { edges: [] } }),
    );
    expect(product.price).toBe(0);
    expect(product.currencyCode).toBe('GBP');
    expect(product.inStock).toBe(false);
  });

  it('handles empty images', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({ images: { edges: [] } }),
    );
    expect(product.image).toBe('/placeholder.svg');
    expect(product.images).toBeUndefined();
  });

  it('handles missing compareAtPrice', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({
        variants: {
          edges: [
            {
              node: {
                id: 'v1',
                title: 'Default',
                price: { amount: '10.00', currencyCode: 'GBP' },
                compareAtPrice: null,
                availableForSale: true,
              },
            },
          ],
        },
      }),
    );
    expect(product.compareAtPrice).toBeUndefined();
  });

  it('extracts colors from options', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({
        options: [{ name: 'Color', values: ['Black', 'Brown'] }],
      }),
    );
    expect(product.colors).toHaveLength(2);
    expect(product.colors![0].name).toBe('Black');
    expect(product.colors![0].value).toBe('black');
  });

  it('extracts sizes from options', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({
        options: [{ name: 'Size', values: ['S', 'M', 'L'] }],
      }),
    );
    expect(product.sizes).toEqual(['S', 'M', 'L']);
  });

  it('extracts rating from metafields', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({
        metafields: [{ key: 'rating', value: '4.5' }],
      }),
    );
    expect(product.rating).toBe(4.5);
  });

  it('extracts review count from metafields', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({
        metafields: [{ key: 'review_count', value: '42' }],
      }),
    );
    expect(product.reviewCount).toBe(42);
  });

  it('handles null metafield entries', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({
        metafields: [null, { key: 'rating', value: '3.0' }, null],
      }),
    );
    expect(product.rating).toBe(3.0);
  });

  it('returns undefined rating for invalid value', () => {
    const product = adaptShopifyProduct(
      makeShopifyProduct({
        metafields: [{ key: 'rating', value: 'not-a-number' }],
      }),
    );
    expect(product.rating).toBeUndefined();
  });
});

describe('adaptShopifyProducts', () => {
  it('maps an array of products', () => {
    const products = adaptShopifyProducts([
      makeShopifyProduct({ title: 'Product A' }),
      makeShopifyProduct({ title: 'Product B' }),
    ]);
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe('Product A');
    expect(products[1].name).toBe('Product B');
  });
});

describe('getVariantId', () => {
  it('returns the first variant ID', () => {
    const id = getVariantId(makeShopifyProduct());
    expect(id).toBe('gid://shopify/ProductVariant/1');
  });

  it('returns null for empty variants', () => {
    const id = getVariantId(makeShopifyProduct({ variants: { edges: [] } }));
    expect(id).toBeNull();
  });
});

describe('getVariantByOptions', () => {
  it('finds matching variant', () => {
    const id = getVariantByOptions(makeShopifyProduct(), { size: 'medium' });
    expect(id).toBe('gid://shopify/ProductVariant/1');
  });

  it('returns null when no match', () => {
    const id = getVariantByOptions(makeShopifyProduct(), {
      size: 'xxl',
    });
    expect(id).toBeNull();
  });

  it('returns null for products without selectedOptions', () => {
    const product = makeShopifyProduct({
      variants: {
        edges: [
          {
            node: {
              id: 'v1',
              title: 'Default',
              price: { amount: '10.00', currencyCode: 'GBP' },
              availableForSale: true,
            },
          },
        ],
      },
    });
    const id = getVariantByOptions(product, { size: 'medium' });
    expect(id).toBeNull();
  });
});
