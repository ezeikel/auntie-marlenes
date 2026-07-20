# Auntie Marlene's — Brand Assets

> Fleet convention: `~/Development/docs/BRAND-STORE-ASSETS.md`.

## Figma (canonical — one file)

**[Auntie Marlene's — Brand](https://www.figma.com/design/gftXaOASIFQRqthE98pUyL)**

Pages: Logo Lockups · App Icons · Store Screenshots · Social.

## App icon variants (Expo)

| File | Env |
|---|---|
| `apps/mobile/assets/images/icon.png` | production |
| `apps/mobile/assets/images/icon-preview.png` | preview → Internal (grid) |
| `apps/mobile/assets/images/icon-dev.png` | development → Dev (code) |

Also `adaptive-icon{,-preview,-dev}.png`. Wired via `pickIcon` + per-env bundle ids
(`.app` / `.app.internal` / `.app.dev`). Regenerator:
`~/Development/Personal/scripts/generate-app-icon-variants.sh`

## Canonical assets

Expo icons live in `apps/mobile/assets/images/`. Export lockups from Figma into this folder as the logo system is built out.
