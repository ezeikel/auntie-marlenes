import { Redis } from '@upstash/redis';

// Initialize Redis client - will be undefined if env vars not set
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Get cart from Redis cache or fallback to fetching from Shopify
 * @param cartId - Shopify cart ID
 * @param fetchFn - Function to fetch cart from Shopify if not in cache
 * @returns Cart data
 */
export async function getCachedCart<T>(
  cartId: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  if (!redis) {
    // If Redis not configured, just fetch directly
    return fetchFn();
  }

  const cacheKey = `cart:${cartId}`;

  try {
    // Try to get from cache
    const cached = await redis.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - fetch from Shopify
    const cart = await fetchFn();

    // Cache for 1 hour (3600 seconds)
    await redis.setex(cacheKey, 3600, cart);

    return cart;
  } catch (error) {
    console.error('Redis error, falling back to direct fetch:', error);
    return fetchFn();
  }
}

/**
 * Invalidate cart cache when cart is updated
 * @param cartId - Shopify cart ID
 */
export async function invalidateCartCache(cartId: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(`cart:${cartId}`);
  } catch (error) {
    console.error('Error invalidating cart cache:', error);
  }
}
