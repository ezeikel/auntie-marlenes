/**
 * Meta Product Catalog integration.
 * Maps Shopify products to Meta catalog product IDs for Instagram Shopping tags.
 */

const GRAPH_API = 'https://graph.facebook.com/v20.0';

// In-memory cache of Shopify handle → Meta catalog product ID
const catalogCache = new Map<string, string>();

interface CatalogProduct {
  id: string;
  retailer_id: string;
  name: string;
}

/**
 * Query Meta product catalog for products matching a search term.
 */
export async function getCatalogProducts(
  query?: string,
): Promise<CatalogProduct[]> {
  const catalogId = process.env.META_CATALOG_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!catalogId || !token) {
    throw new Error('Missing META_CATALOG_ID or FACEBOOK_PAGE_ACCESS_TOKEN');
  }

  const url = new URL(`${GRAPH_API}/${catalogId}/products`);
  url.searchParams.set('fields', 'id,retailer_id,name');
  url.searchParams.set('access_token', token);
  url.searchParams.set('limit', '100');
  if (query) url.searchParams.set('q', query);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      `Meta catalog query failed: ${JSON.stringify(data.error || data)}`,
    );
  }

  return data.data || [];
}

/**
 * Load all catalog products and build the cache.
 */
export async function loadCatalogCache(): Promise<void> {
  console.log('[Catalog] Loading product catalog...');

  const products = await getCatalogProducts();

  for (const product of products) {
    // retailer_id from Meta typically matches Shopify product ID or variant ID
    // Also index by name for fuzzy matching
    if (product.retailer_id) {
      catalogCache.set(product.retailer_id, product.id);
    }
    // Store by lowercase name for lookup
    catalogCache.set(product.name.toLowerCase(), product.id);
  }

  console.log(`[Catalog] Cached ${products.length} products`);
}

/**
 * Look up a Meta catalog product ID by Shopify product handle or name.
 * Returns null if not found (post will go out without product tag).
 */
export async function getCatalogProductId(
  handle: string,
  productName: string,
): Promise<string | null> {
  // Check cache first
  const cached =
    catalogCache.get(handle) ||
    catalogCache.get(productName.toLowerCase());
  if (cached) return cached;

  // Try searching by product name
  try {
    const results = await getCatalogProducts(productName);
    if (results.length > 0) {
      const match = results[0];
      catalogCache.set(handle, match.id);
      catalogCache.set(productName.toLowerCase(), match.id);
      console.log(
        `[Catalog] Found product: ${productName} → ${match.id}`,
      );
      return match.id;
    }
  } catch (err) {
    console.warn(`[Catalog] Failed to look up product: ${productName}`, err);
  }

  console.warn(`[Catalog] Product not found in Meta catalog: ${productName}`);
  return null;
}

/**
 * Build product_tags array for Meta Graph API.
 * Position defaults to center of image.
 */
export function buildProductTags(
  productId: string,
  x = 0.5,
  y = 0.6,
): Array<{ product_id: string; x: number; y: number }> {
  return [{ product_id: productId, x, y }];
}
