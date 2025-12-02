import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { getUserId } from '@/utils/user';

/**
 * Get the user's country code from server-side context.
 * Reads from cookie set by LocationContext on the client.
 * Defaults to 'GB' if no cookie is found.
 *
 * Calls connection() to opt-out of caching in Cache Components mode
 * since country selection is user-specific (via cookies).
 */
export async function getServerCountry(): Promise<string> {
  // Wait for incoming request - ensures dynamic rendering
  await connection();

  const cookieStore = await cookies();
  const savedCountry = cookieStore.get('auntie-marlenes-country')?.value;
  const country = savedCountry || 'GB';

  console.log('[server-location] Country from cookie:', {
    cookieValue: savedCountry,
    finalCountry: country,
  });

  return country;
}

/**
 * Get the user's ID from server-side context.
 * Reads from headers to identify the user.
 * Returns null if user cannot be identified.
 *
 * This function should be called OUTSIDE of cached scopes
 * and the result passed as an argument to cached components.
 */
export async function getServerUserId(): Promise<string | null> {
  // Wait for incoming request - ensures dynamic rendering
  await connection();

  try {
    const userId = await getUserId('get the current user');
    console.log(
      '[server-location] User ID retrieved:',
      userId ? 'Found' : 'Not found',
    );
    return userId;
  } catch (error) {
    console.log('[server-location] Could not retrieve user ID:', error);
    return null;
  }
}
