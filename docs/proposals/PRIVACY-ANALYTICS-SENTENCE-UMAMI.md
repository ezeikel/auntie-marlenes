# Proposal: Auntie Marlene's privacy page entry for the Umami counter

Status: APPROVED by the owner on 7 November 2026 (the entry as written). The privacy page carries it, "Last updated" is November 2026,
and the two values are set in `.github/workflows/deploy-cloudflare.yml`.

## Where it goes

The "Analytics and Performance" list on the privacy page, as a new entry after Plausible Analytics. The page is English only.

## Proposed entry (plain text)

Umami: A cookie-free analytics tool that we run ourselves on our own server in Germany. On our public pages (the home page, the shop and product pages, the blog and our information pages) it counts visits. It receives the page address, with no query string apart from the advertising campaign tags on a link (such as utm_source), no page title, and the site you came from. It does not run on your account, bag, saved items or order pages, it sets nothing on your device, and it respects your browser's Do Not Track setting.

## What the code backs

| Claim | Where |
|---|---|
| Only public pages, in every language | `COUNTABLE_PATHS` and `withoutLocale` in `apps/web/lib/umami.ts`; tests in `lib/__tests__/umami.test.ts` |
| Not account, bag, saved items, orders or the thank-you page | `PRIVATE_PAGES` and the same tests |
| Campaign tags only, nothing else from the query | `umamiCampaignQuery` (utm_source, utm_medium, utm_campaign, utm_content, utm_term; each a short plain word) |
| No title | `umamiPageview` sends `title: ''` |
| The site you came from | `umamiReferrer` |
| Respects Do Not Track | `data-do-not-track="true"` |
| Our own server, in Germany | `docs/HETZNER_ANALYTICS.md` in chewy-bytes-docs |
| Cookies, credentials and the page address never reach Umami | `middleware.ts` strips them (`UMAMI_STRIPPED_HEADERS`, including the Referer) |

## Things the owner should know

- Shopify hosts the checkout. Umami never runs there, and the privacy page already says so for Shopify's own processing.
- Shop categories come from Shopify, so the allowlist accepts any single path segment as a category except the private page names.
  A mistyped address that returns a 404 page can therefore be counted as a page view.
- The repo can inject the Cloudflare Web Analytics beacon (`lib/cf-web-analytics.ts`, only when a token is configured; not checked
  whether one is), which the privacy page does not mention.

## Not checked

- "Cookie-free" and "sets nothing on your device" are Umami's documented behaviour, not shown by this repo.
- What Umami records by default beyond the page and referrer (browser, operating system, screen size, language, country).
