import type { ImageLoaderProps } from 'next/image';

// Use the source CDNs rather than shipping an image processor in the Worker.
export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (url.protocol !== 'https:') return src;
  if (url.hostname === 'cdn.shopify.com') {
    url.searchParams.set('width', String(width));
  } else if (url.hostname === 'cdn.sanity.io') {
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality || 75));
    url.searchParams.set('auto', 'format');
  } else {
    // Pexels and local/static assets retain their original URL.
    return src;
  }
  return url.toString();
}
