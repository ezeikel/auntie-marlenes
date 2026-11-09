# Auntie Marlene's — Brand Assets

> Fleet convention: `~/Development/docs/BRAND-STORE-ASSETS.md`.

## Figma — **one file only**

**[Auntie Marlene's — Brand](https://www.figma.com/design/gftXaOASIFQRqthE98pUyL)**

| Page | Contents |
|---|---|
| **Cover** | App name, production icon (byte-exact `icon.png`), one-line store description, repo path |
| **Foundations** | Brand colours from `apps/mobile/global.css` Brand Colors; Playfair Display, Inter; type families and roles |
| **Logo Lockups** | App icon + on-dark / white / mono marks; horizontal, stacked, wordmark |
| **App Icons** | Production / Internal (preview) / Dev, iOS + Android adaptive, byte-exact with `apps/mobile/assets/images` |
| **Store Screenshots** | (none yet) |
| **Social** | (none yet) |

Pages follow the fleet standard (`~/Development/docs/BRAND-STORE-ASSETS.md`, "Brand Figma file standard (owner, 9 Nov 2026)"): the six pages above in that order, then working pages, then `… ARCHIVE (do not edit)` pages. The app icon PNGs in the repo on `origin/main` are the source of truth; Figma mirrors them byte for byte.

_Canonical Brand file — use this link only._

## App icon variants (Expo)

| File | Env | BG |
|---|---|---|
| `icon.png` | production | Brand store art |
| `icon-preview.png` | preview → Internal | Purple `#5B2C6F` + light grid |
| `icon-dev.png` | development → Dev | Teal `#0E6655` + large code |

Wired via `pickIcon` in mobile `app.config.ts`. Regenerator:
`~/Development/Personal/scripts/generate-app-icon-variants.sh`

## Repo exports

`branding/lockups/` — mark tiles exported for Figma.
