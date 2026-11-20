// Paths the middleware proxies or that are route handlers: they take POSTs of
// their own and are never rendered as a page.
const HANDLED_PREFIXES = ['/api/', '/relay-hyx5/', '/m/'] as const;

const FILE_LIKE_LAST_SEGMENT = /\/[^/]*\.[a-z0-9]{1,5}$/i;

/**
 * True for a POST to a file-like path (`/anything/name.txt`) outside the API
 * and analytics proxies. Server actions post to the URL of the page they are
 * on, and no page URL here ends in a file extension (the middleware already
 * treats any dotted path as a non-page), so such a request can only be a
 * probe. POSTs to real pages, including truncated ones, are left to Next so
 * their errors are still reported.
 */
export function isFilePathFormPost(method: string, pathname: string): boolean {
  if (method.toUpperCase() !== 'POST') return false;
  if (HANDLED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  return FILE_LIKE_LAST_SEGMENT.test(pathname);
}
