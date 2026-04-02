# AI Product Content Generation — Model Research

_Research date: April 2026 (via Perplexity sonar-deep-research)_

## Key Finding

**Pure AI image generation cannot reliably render product packaging text.** The
best approach is a hybrid composite: generate the scene/background with AI, then
composite the real product photo on top.

## Image Generation — Rankings for Product Packaging Text

### 1. Composite Approach (Best — 100% text accuracy)

**Photoroom Scene API**

- Extracts product, generates scene, composites with lighting/shadows
- Pricing: ~£0.004-0.006/image or £99-299/month enterprise
- API: `POST /api/scenes/generate`
- Text preservation: ~100% (real product photo)

**Pebblely**

- £25-99/month (500-5000 scenes/month)
- Good for bathroom/shelf scenes specifically
- Text preservation: ~99%

### 2. Flux Pro (Best pure generative for text)

- Better text rendering than Gemini 3 Pro
- Brand name (2-4 words): ~70% legible
- Full ingredients: ~30% (unacceptable)
- fal.ai: `fal-ai/flux-pro` — $0.015-0.025/image
- Replicate: `black-forest-labs/flux-pro` — $0.04/image

### 3. Ideogram 3 (Good text, no API)

- Text rendering ~75% for brand names
- Web-only, no API — can't automate
- Not suitable for pipeline

### 4. Gemini 3 Pro Image (Current — garbles text)

- Text rendering: ~40-50% for packaging
- Good scene composition but text unreliable

### 5. SDXL + IP-Adapter (Complex, marginal gains)

- Text preservation ~40-50%
- Too much complexity for the result

### Not Recommended

- Midjourney v7: No API, can't automate
- Sora 2: Overkill and expensive

## Video Generation — Rankings for Text Preservation

### 1. Google Veo 3.1 (Best text stability)

- Text preservation: ~75%
- Best ambient motion quality (light shifts, steam)
- Pricing: $0.10-0.15/video via Vertex AI
- Already integrated in our pipeline

### 2. Runway Gen-4 (Best for automation)

- Text preservation: ~70%
- Faster generation (30-90s vs 2-3 min)
- Better API ergonomics
- Pricing: $1.20-3.00/video
- Not yet integrated

### 3. Kling 3.0/O3 (Good motion, worse text)

- Text preservation: ~65%
- Excellent ambient effects
- Already integrated via fal.ai

### 4. Seedance 2.0 (No API)

- Text preservation: ~60%
- No public API available

### 5. Sora 2 (Overkill)

- Text preservation: ~70%
- $15-30/video — too expensive

## Recommended Pipeline

```
1. Photoroom API → generate scene with real product composited ($0.005)
2. Veo 3.1 → animate the composited image ($0.10-0.15)
3. Remotion → add brand text overlays (free)
Total: ~$0.16/product for image + video
```

## Alternative: Multi-Frame Approach

Instead of video generation:

1. Generate 5-8 static images with different lighting (Photoroom)
2. Combine into video with smooth transitions (FFmpeg)
3. Text preservation: ~95%
4. Cost: ~$0.03 + time

## Text Preservation Prompting Tips

- Request "label facing camera" not "slightly angled"
- Keep it simple: "brand name clearly visible" not ingredient lists
- Request 4K output where available
- Avoid heavy motion on the product itself
- "Camera remains static" is essential
