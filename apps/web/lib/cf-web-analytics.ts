import type {
  Request,
  Response,
  HTMLRewriter as WorkersHTMLRewriter,
} from '@cloudflare/workers-types';

declare const HTMLRewriter: typeof WorkersHTMLRewriter;

/** Stream the beacon into HTML, leaving all other responses untouched. */
export function injectWebAnalytics(
  request: Request,
  response: Response,
  token?: string,
): Response {
  const configuredToken = token?.trim();
  if (
    !configuredToken ||
    request.method !== 'GET' ||
    request.headers.has('range') ||
    response.status === 206 ||
    (response.status >= 300 && response.status < 400) ||
    response.headers.has('content-range') ||
    !response.body ||
    !response.headers.get('content-type')?.toLowerCase().startsWith('text/html')
  ) {
    return response;
  }

  const beacon = JSON.stringify({ token: configuredToken })
    .replaceAll('&', '&amp;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  const script = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${beacon}'></script>`;
  let hasBeacon = false;
  return new HTMLRewriter()
    .on('script[src*="static.cloudflareinsights.com"]', {
      element() {
        hasBeacon = true;
      },
    })
    .on('body', {
      element(body) {
        body.onEndTag((tag) => {
          if (!hasBeacon) {
            tag.before(script, { html: true });
            hasBeacon = true;
          }
        });
      },
    })
    .onDocument({
      end(document) {
        // Next's global 404 can omit the opening body tag. HTMLRewriter
        // cannot match that body, so cover fragments without buffering.
        if (!hasBeacon) document.append(script, { html: true });
      },
    })
    .transform(response);
}
