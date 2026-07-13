/**
 * Meta Product Catalog integration.
 * Maps Shopify products to Meta catalog product IDs for Instagram Shopping tags.
 *
 * Loads all 58 products on first call and matches by name (Meta's search API
 * is unreliable — returns same results regardless of query).
 */

const GRAPH_API = 'https://graph.facebook.com/v24.0';

// In-memory cache: lowercase product name → Meta catalog product ID
const catalogCache = new Map<string, string>();
let cacheLoaded = false;

interface CatalogProduct {
  id: string;
  retailer_id: string;
  name: string;
}

/**
 * Load all catalog products into cache.
 */
async function ensureCacheLoaded(): Promise<void> {
  if (cacheLoaded) return;

  const catalogId = process.env.META_CATALOG_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!catalogId || !token) {
    console.warn(
      '[Catalog] Missing META_CATALOG_ID or FACEBOOK_PAGE_ACCESS_TOKEN',
    );
    return;
  }

  console.log('[Catalog] Loading full product catalog...');

  const url = new URL(`${GRAPH_API}/${catalogId}/products`);
  url.searchParams.set('fields', 'id,retailer_id,name');
  url.searchParams.set('limit', '100');
  url.searchParams.set('access_token', token);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok || data.error) {
    console.error('[Catalog] Failed to load catalog:', data.error || data);
    return;
  }

  const products: CatalogProduct[] = data.data || [];

  for (const product of products) {
    catalogCache.set(product.name.toLowerCase(), product.id);
    if (product.retailer_id) {
      catalogCache.set(product.retailer_id, product.id);
    }
  }

  cacheLoaded = true;
  console.log(`[Catalog] Cached ${products.length} products`);
}

/**
 * Look up a Meta catalog product ID by product name.
 * Loads full catalog on first call, then matches from cache.
 */
export async function getCatalogProductId(
  _handle: string,
  productName: string,
): Promise<string | null> {
  await ensureCacheLoaded();

  // Exact match
  const exact = catalogCache.get(productName.toLowerCase());
  if (exact) {
    console.log(`[Catalog] Matched: ${productName} → ${exact}`);
    return exact;
  }

  // Fuzzy match — find closest by checking if product name contains catalog name or vice versa
  const lowerName = productName.toLowerCase();
  for (const [key, id] of catalogCache) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      console.log(`[Catalog] Fuzzy matched: ${productName} → ${id}`);
      return id;
    }
  }

  console.warn(`[Catalog] No match for: ${productName}`);
  return null;
}

/**
 * Build product_tags array for Meta Graph API.
 */
export function buildProductTags(
  productId: string,
  x = 0.5,
  y = 0.6,
): Array<{ product_id: string; x: number; y: number }> {
  return [{ product_id: productId, x, y }];
}
