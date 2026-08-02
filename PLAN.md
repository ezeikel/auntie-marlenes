# Auto-Generating Blog Implementation Plan for Auntie Marlene's

> ## ✅ SHIPPED — this plan is COMPLETE. Kept for design rationale only.
>
> All seven phases below are built and live: the blog runs on **Sanity**
> (`608c8bf`), serving at <https://www.auntiemarlenes.com/blog>. There is **no
> `@vercel/blob` anywhere in this repo** and no migration outstanding.
>
> | Phase | Where it lives now |
> |---|---|
> | 1. Sanity CMS | `apps/web/lib/sanity-blog.ts`, Studio at `app/studio/[[...tool]]` |
> | 2. AI integration | `apps/worker/src/blog/{pipeline,prompts,models}.ts` |
> | 3. Image pipeline + judge | `apps/worker/src/blog/{image,image-evaluation,pexels}.ts` — images upload straight into Sanity as assets |
> | 4. Topic system | `apps/worker/src/blog/{topics,dynamic-topics}.ts` |
> | 5. Generation | `apps/worker/src/blog/{sanity,markdown-to-portable-text}.ts` |
> | 6. Frontend | `apps/web/app/[locale]/blog/**`, `app/api/sanity/revalidate` |
> | 7. Scheduling | worker cron (see `CLAUDE.md`) |
>
> **The "Current State" section below is the state in ~2026-06, before any of
> this existed.** It was never updated after the work landed and on 2026-08-02 it
> caused a real misread — the blog was believed to still be Vercel-Blob-based and
> in need of migration. Read `CLAUDE.md` for the current architecture; treat
> everything below as a historical record of intent, not of reality.

## Overview

Implement an AI-powered auto-generating blog system for Auntie Marlene's (a Black-owned premium hair & beauty supply store) to drive SEO traffic and customer engagement. The system will generate high-quality, SEO-optimized blog content targeting people with textured/afro hair (3c-4c types) and melanin-rich skin.

---

## Current State (HISTORICAL — pre-implementation, ~2026-06. Not true today.)

- **Existing Blog**: 5 hardcoded blog posts in `/lib/blog-data.tsx`
- **No Sanity CMS**: Currently no Sanity integration
- **No AI SDK**: No AI capabilities integrated
- **Tech Stack**: Next.js 16, React 19, Shopify Storefront API, Prisma/PostgreSQL

---

## Architecture

```
Vercel Cron (Daily 6AM UTC)
        ↓
/api/blog/generate
        ↓
Server Action: generateRandomBlogPost()
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Select uncovered topic from 200+ topic pool              │
│ 2. Generate metadata (gpt-4o-mini): title, slug, SEO        │
│ 3. Generate content (gpt-4o): 1200-1800 word article        │
│ 4. Generate image search terms (gpt-4o-mini)                │
│ 5. Search Pexels API for candidate images (up to 5)         │
│ 6. AI Judge evaluates each image (Gemini 3 Pro vision)      │
│    └─ Select best image meeting 60% confidence threshold    │
│    └─ Fallback: Generate with Gemini 3 Pro Image if none    │
│ 7. Convert markdown → Sanity Portable Text                  │
│ 8. Upload image to Sanity                                   │
│ 9. Create post document in Sanity                           │
│ 10. Revalidate blog cache                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Sanity CMS Setup

1. **Install Sanity dependencies**
   - `next-sanity`, `@sanity/client`, `@sanity/image-url`
   - Create Sanity project or use existing one

2. **Create Sanity schemas**
   - `post.ts` - Blog post with SEO, generationMeta, featuredImage
   - `author.ts` - Author profiles (guest writers)
   - `category.ts` - Blog categories

3. **Set up Sanity clients**
   - Read client (CDN, public)
   - Write client (API token, server-only)

4. **Create GROQ queries**
   - Posts listing, single post, covered topics, slugs

### Phase 2: AI Integration

5. **Install AI SDK**
   - `ai`, `@ai-sdk/openai`, `@ai-sdk/google`

6. **Create AI model configuration** (`/lib/ai/models.ts`)
   ```typescript
   export const MODEL_IDS = {
     // OpenAI
     GPT_4O: 'gpt-4o',
     GPT_4O_MINI: 'gpt-4o-mini',

     // Google Gemini (Latest Jan 2026)
     GEMINI_3_FLASH: 'gemini-3-flash-preview',      // Fast vision/analytics
     GEMINI_3_PRO: 'gemini-3-pro-preview',          // Most intelligent (AI Judge)
     GEMINI_3_PRO_IMAGE: 'gemini-3-pro-image-preview', // Image generation
   };

   export const models = {
     text: openai(MODEL_IDS.GPT_4O),           // Blog content
     textFast: openai(MODEL_IDS.GPT_4O_MINI),  // Metadata, search terms
     analytics: google(MODEL_IDS.GEMINI_3_FLASH),
     vision: google(MODEL_IDS.GEMINI_3_PRO),    // AI Judge for images
     geminiImage: google(MODEL_IDS.GEMINI_3_PRO_IMAGE), // Fallback generation
   };
   ```

7. **Create prompt templates** (`/lib/ai/prompts.ts`)
   - Blog metadata system prompt (SEO expert for Black hair care)
   - Blog content system prompt (expert writer on textured hair)
   - Image search system prompt (visual descriptions)
   - Image evaluation system prompt (AI Judge criteria)
   - Image generation prompt (Gemini fallback)

8. **Define Zod schemas** for structured AI output
   - `blogMetaSchema`: title, slug, excerpt, metaTitle, metaDescription, keywords
   - `imageSearchSchema`: searchTerms[], altText
   - `imageEvaluationSchema`: isRelevant, confidence (0-100), reasoning, concerns[]

### Phase 3: Image Pipeline with AI Judge

9. **Create Pexels client** (`/lib/pexels/client.ts`)
   - `searchPhotos()` - Search with landscape orientation
   - `fetchBlogPhotosForEvaluation()` - Fetch up to 5 candidates
   - `downloadPhoto()` - Download as buffer for upload
   - `formatPhotoCredit()` - Photographer attribution

10. **Create AI Image Evaluation (AI Judge)** (`/lib/ai/image-evaluation.ts`)
    ```typescript
    const ImageEvaluationSchema = z.object({
      isRelevant: z.boolean(),
      confidence: z.number().min(0).max(100),
      reasoning: z.string(),
      concerns: z.array(z.string()),
    });

    // Evaluate single image relevance
    async function evaluateImageRelevance(
      imageUrl: string,
      context: { title: string; excerpt: string; category: string; searchTerm: string }
    ): Promise<ImageEvaluation>

    // Evaluate multiple images, return best match
    async function findBestImage(
      images: Array<{ url: string; searchTerm: string }>,
      context: { title: string; excerpt: string; category: string },
      minConfidence: number = 60
    ): Promise<{ selectedIndex: number | null; evaluations: ImageEvaluation[] }>
    ```

    **Evaluation criteria for Auntie Marlene's:**
    - Image shows diverse Black models with textured hair
    - Professional quality suitable for e-commerce blog
    - Relevant to hair care, styling, or beauty context
    - Authentic representation (not tokenizing or stereotyping)
    - Good lighting showing hair texture clearly
    - Avoid: generic stock photos, irrelevant settings, poor representation

11. **Create image fallback** (`/lib/ai/image-providers.ts`)
    - Try Pexels first with AI-generated search terms
    - AI Judge evaluates candidates (60% confidence threshold)
    - Fallback to Gemini 3 Pro Image generation if none suitable
    - Upload result to Sanity assets

12. **Define category search terms** (`/lib/pexels/search-terms.ts`)
    ```typescript
    export const CATEGORY_SEARCH_TERMS = {
      'hair-care': ['Black woman natural hair', 'textured hair care', 'afro hair styling'],
      'protective-styles': ['box braids styling', 'cornrows braids', 'protective hairstyle'],
      'natural-hair': ['4c hair texture', 'coily hair', 'natural curls Black woman'],
      'skincare': ['melanin skin care', 'Black woman skincare routine', 'dark skin beauty'],
      // ... more categories
    };
    ```

### Phase 4: Topic System

13. **Create comprehensive topic list** (`/constants/blog-topics.ts`)

    **200+ Topics across categories:**

    **Hair Care Fundamentals (25 topics)**
    - Deep conditioning guide for 4c hair
    - How to properly detangle textured hair
    - The LOC vs LCO method explained
    - Protein vs moisture balance for coily hair
    - Porosity: What it means and how to test
    - Scalp care for textured hair
    - Heat damage prevention and recovery
    - Co-washing: Benefits and best practices

    **Protective Styles (25 topics)**
    - Box braids maintenance guide
    - Knotless braids vs traditional box braids
    - How to care for hair under wigs
    - Passion twists installation tips
    - Crochet braids for beginners
    - Faux locs styling and maintenance
    - Cornrow patterns for different face shapes
    - Protective styles for swimming

    **Natural Hair Journey (20 topics)**
    - Big chop vs transitioning: Which is right for you
    - First-year natural hair tips
    - How to define your curl pattern
    - Shrinkage: Understanding and embracing it
    - Building a natural hair regimen
    - Common natural hair mistakes to avoid
    - Tracking your hair growth progress

    **Product Knowledge (20 topics)**
    - Understanding ingredient labels
    - Best oils for textured hair
    - Sulfate-free shampoos explained
    - Leave-in conditioners: How to choose
    - Edge control vs edge gel
    - Clarifying shampoos: When and how to use
    - DIY hair masks with kitchen ingredients

    **Styling Techniques (20 topics)**
    - Twist out tutorials for different hair types
    - Wash and go for coily hair
    - Braid out techniques
    - Flexi rod sets on natural hair
    - Bantu knots styling guide
    - Finger coils for definition
    - Pineapple method for preserving styles

    **Children's Hair Care (15 topics)**
    - Gentle detangling for kids
    - Protective styles for school
    - Building hair care routines for children
    - When to start loc'ing children's hair
    - Swimming and children's textured hair

    **Men's Textured Hair (15 topics)**
    - Men's natural hair care basics
    - Waves and 360 waves guide
    - Beard care for Black men
    - Fades and natural hair maintenance
    - Hair loss prevention for men

    **Skin Care for Melanin-Rich Skin (20 topics)**
    - Hyperpigmentation treatments
    - Dark spot correction safely
    - Sunscreen for dark skin tones
    - Best ingredients for melanin-rich skin
    - Acne scarring on dark skin
    - Body care routines for even skin tone

    **Seasonal & Situational (15 topics)**
    - Winter hair care for textured hair
    - Summer humidity and natural hair
    - Wedding day hair preparation
    - Post-partum hair changes
    - Traveling with natural hair

    **Trending & Cultural (15 topics)**
    - TikTok hair trends worth trying
    - Cultural significance of braiding
    - Natural hair in the workplace
    - Celebrity natural hair inspiration
    - Hair care myths debunked

    **DIY & Treatments (10 topics)**
    - Hot oil treatment guide
    - Rice water rinse benefits
    - Apple cider vinegar rinse
    - Flaxseed gel recipe
    - Ayurvedic hair care introduction

14. **Create topic selection logic**
    - Query covered topics from Sanity
    - Filter for uncovered topics
    - Random selection with category balance

### Phase 5: Blog Generation

15. **Create server action** (`/app/actions/blog.ts`)
    ```typescript
    generateRandomBlogPost()
    generateBlogPostForTopic(topic)
    getBlogTopicStats()
    getCoveredTopics()
    ```

16. **Image acquisition flow in blog action**
    ```typescript
    // 1. Generate search terms
    const searchTerms = await generateImageSearchTerms(title, excerpt, category);

    // 2. Fetch candidate images from Pexels
    const pexelsResult = await fetchBlogPhotosForEvaluation(searchTerms.searchTerms);

    // 3. AI Judge evaluates candidates
    const { selectedIndex, evaluations } = await findBestImage(
      pexelsResult.photos.map(p => ({ url: p.photo.src.large, searchTerm: p.searchTerm })),
      { title, excerpt, category },
      IMAGE_EVALUATION_THRESHOLD // 60
    );

    // 4. Use selected image or fallback to Gemini
    if (selectedIndex !== null) {
      selectedPhoto = pexelsResult.photos[selectedIndex];
      logger.info(`AI Judge selected image: ${selectedPhoto.photo.photographer} (${evaluations[selectedIndex].confidence}% confidence)`);
    } else {
      logger.info('No suitable Pexels image, falling back to Gemini generation');
      const geminiImage = await generateImageWithGemini(title);
      // Upload gemini image to Sanity
    }
    ```

17. **Create markdown to Portable Text converter**
    - Parse headers, lists, blockquotes
    - Handle bold, italic, links
    - Generate unique _key values

18. **Create API route** (`/app/api/blog/generate/route.ts`)
    - Validate CRON_SECRET
    - Call generation action
    - Return success/coverage stats

### Phase 6: Blog Frontend

19. **Update blog pages to use Sanity**
    - `/app/blog/page.tsx` - List from Sanity
    - `/app/blog/[slug]/page.tsx` - Single post from Sanity
    - Keep existing hardcoded posts as initial seed

20. **Create Portable Text renderer component**
    - Render Sanity blocks
    - Handle images, links, formatting

21. **Generate SEO metadata**
    - Dynamic `generateMetadata` functions
    - Article structured data
    - Open Graph images

### Phase 7: Deployment & Scheduling

22. **Configure Vercel cron** (`vercel.json`)
    ```json
    {
      "crons": [
        {
          "path": "/api/blog/generate",
          "schedule": "0 6 * * *"
        }
      ]
    }
    ```

23. **Set environment variables**
    - `OPENAI_API_KEY`
    - `GOOGLE_GENERATIVE_AI_API_KEY`
    - `PEXELS_API_KEY`
    - `SANITY_PROJECT_ID`
    - `SANITY_DATASET`
    - `SANITY_API_TOKEN`
    - `CRON_SECRET`

24. **Migrate existing blog posts**
    - Script to import 5 existing posts to Sanity
    - Mark as `isGenerated: false`

---

## AI Judge Feature Details

### Purpose
Ensures blog featured images are high-quality, relevant, and represent the Auntie Marlene's brand well. Prevents generic stock photos that don't resonate with the target audience.

### Evaluation Criteria (Domain-Specific)
```typescript
const EVALUATION_PROMPT = `
You are an expert image evaluator for a Black-owned hair and beauty supply blog.

Evaluate if this image is suitable for a blog post about: {{TITLE}}
Context: {{EXCERPT}}
Category: {{CATEGORY}}
Search term used: {{SEARCH_TERM}}

POSITIVE criteria (increases confidence):
- Shows Black women/men with textured natural hair (3c-4c)
- Professional quality, good lighting
- Hair texture is visible and well-displayed
- Authentic, relatable representation
- Relevant to hair care, styling, or beauty context
- UK/diverse settings preferred

NEGATIVE criteria (decreases confidence):
- Generic stock photo feel
- Hair texture not visible or relevant
- Poor representation or stereotyping
- Irrelevant background or context
- Low quality or poor lighting
- Wrong hair type (straight hair for natural hair article)

Return your evaluation as JSON with:
- isRelevant: boolean
- confidence: 0-100
- reasoning: brief explanation
- concerns: array of specific issues
`;
```

### Confidence Threshold
- **60% minimum** - Image must score 60+ to be used
- Below 60% triggers Gemini image generation fallback

### Parallel Evaluation
- Evaluates up to 5 Pexels images simultaneously
- Selects highest confidence image that meets threshold
- Logs all evaluations for debugging/improvement

---

## Guest Writer Personas

Random assignment from pool of 15 expert personas (similar to parking-ticket-pal):

| Name | Title | Bio Focus |
|------|-------|-----------|
| Keisha Williams | Natural Hair Specialist | 12+ years as a licensed cosmetologist specializing in textured hair care |
| Marcus Johnson | Men's Grooming Expert | Barber and men's hair care advocate, 8 years experience |
| Amara Okonkwo | Trichologist | Certified trichologist specializing in Afro-textured hair health |
| Jasmine Carter | Protective Styles Artist | Award-winning braider with 15 years in the industry |
| Dami Adeyemi | Natural Hair Blogger | Content creator and natural hair journey advocate |
| Simone Baptiste | Skincare Specialist | Esthetician focused on melanin-rich skin care |
| David Thompson | Loctician | Loc specialist and natural hair advocate |
| Naomi Clarke | Hair Product Formulator | Cosmetic chemist specializing in products for textured hair |
| Anthony Williams | Beard Care Expert | Men's grooming specialist and barber |
| Zara Mensah | Children's Hair Specialist | Pediatric hair care expert and mother of three |
| Crystal Morgan | DIY Beauty Enthusiast | Herbalist and natural beauty recipe creator |
| Jerome Baptiste | Waves & Styling Expert | 360 waves specialist and men's styling coach |
| Imani Johnson | Transitioning Guide | Former relaxed hair wearer, 5-year natural veteran |
| Tobi Adekunle | Hair Science Writer | Biology graduate specializing in hair health education |
| Aaliyah Brown | Wedding Hair Specialist | Bridal hair stylist for textured hair brides |

**Author assignment**: Random selection per post, stored in Sanity as reference.

---

## SEO Strategy

### Target Keywords (Examples)
- "4c hair care tips"
- "natural hair for beginners"
- "best products for textured hair UK"
- "protective styles for natural hair"
- "Black hair care guide"
- "afro hair products UK"
- "how to moisturize 4c hair"
- "braiding hair near me" (local SEO)

### Content Goals
- 1,200-1,800 words per article
- Natural keyword integration (2-3 per article)
- Internal links to products and categories
- Soft CTAs to shop relevant products
- Educational, helpful tone (not salesy)

### Technical SEO
- Meta titles: 50-60 characters
- Meta descriptions: 150-160 characters
- Clean URL slugs
- Article schema markup
- Image alt text (AI-generated)
- Reading time display

---

## File Structure

```
apps/web/
├── app/
│   ├── api/
│   │   └── blog/
│   │       └── generate/
│   │           └── route.ts
│   ├── actions/
│   │   └── blog.ts
│   └── blog/
│       ├── page.tsx
│       └── [slug]/
│           └── page.tsx
├── lib/
│   ├── ai/
│   │   ├── models.ts
│   │   ├── prompts.ts
│   │   ├── image-evaluation.ts    ← AI Judge
│   │   └── image-providers.ts
│   ├── pexels/
│   │   ├── client.ts
│   │   └── search-terms.ts
│   └── sanity/
│       ├── client.ts
│       ├── queries.ts
│       └── image.ts
├── constants/
│   └── blog-topics.ts
├── sanity/
│   ├── schemas/
│   │   ├── post.ts
│   │   ├── author.ts
│   │   └── category.ts
│   └── schema.ts
├── components/
│   └── blog/
│       ├── portable-text.tsx
│       └── blog-card.tsx
└── vercel.json
```

---

## Dependencies to Install

```bash
# AI SDK
pnpm add ai @ai-sdk/openai @ai-sdk/google

# Sanity
pnpm add next-sanity @sanity/client @sanity/image-url sanity

# Utilities
pnpm add zod
```

---

## Environment Variables Required

```env
# AI
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Pexels
PEXELS_API_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# Cron Security
CRON_SECRET=
```

---

## Traffic & SEO Impact Projections

Based on similar implementations:
- **200+ topics** = 200+ indexed pages over time
- **Daily generation** = Fresh content signals to Google
- **Long-tail keywords** = Lower competition, higher conversion intent
- **Educational content** = Builds trust and authority
- **Internal linking** = Improved crawlability and session duration

Target audience searches:
- "how to care for 4c hair" - 5,400 monthly searches
- "best leave in conditioner for natural hair" - 8,100 monthly searches
- "protective styles" - 40,500 monthly searches
- "natural hair products" - 14,800 monthly searches

---

## Questions for Clarification

1. **Sanity Project**: Should I create a new Sanity project or is there an existing one to use?

2. **Post Frequency**: Daily generation (7/week) or less frequent (3/week)?

3. **Category Structure**: Use the 10 categories outlined above or adjust?

4. **Confidence Threshold**: 60% threshold for AI Judge - adjust higher/lower?
