### 1. Image-to-Video Quality Ranking

**Seedance 2.0 (ByteDance) ranks best for subtle cinematic loops from
photorealistic stills with Black subjects, due to its Universal Reference tech
ensuring identity preservation, texture fidelity (dark skin, natural hair), and
commerce-optimized subtle motion without drift.** Runway Gen-4 Turbo follows for
precise motion control in hero-style outputs. **Veo 3.1 ranks worst among the
three, as it prioritizes cinematic storytelling over e-commerce consistency,
leading to more scene rewrites in subtle animations.[3][5]**

### 2. Skin Tone Preservation

Seedance 2.0 excels with no documented lightening of dark skin tones (MST 6-8)
or facial drift, thanks to multi-data conditioning (image + text) that locks
identities in e-commerce scenarios.[5] Runway Gen-4 shows strong preservation
via motion brushes but occasional subtle lightening in tests with diverse skin
tones.[1] Veo 3.1 has reported issues with skin lightening and feature drift on
dark-skinned subjects during motion, per 2026 benchmarks favoring storytelling
over fidelity.[3][6]

### 3. Natural Black Hair Rendering in Motion

Seedance 2.0 handles 4c coils, locs, and braids best, rendering realistic subtle
motion (e.g., light catch, gentle sway) without jello/rubbery artifacts, due to
texture-focused training for product realism.[5] Runway Gen-4 Turbo produces
natural hair flow in intimate scenes but can introduce minor synthetic wobble on
tight coils.[1] Veo 3.1 struggles most, often generating rubbery or overly
smooth hair movement on natural Black textures, especially in low-motion
prompts.[3][6]

### 4. Motion Control Precision

Runway Gen-4 offers the most precise controls: motion brushes for
region-specific subtle actions (e.g., hands/bonnet only), camera lock to prevent
moves, and start/end-frame for loops.[1][2] Seedance 1.5/2.0 provides
image-reference locking and subtle motion via multi-input conditioning but lacks
pixel-level brushes; fal.ai adds basic region prompts.[5][7] Veo 3.1 Fast
includes camera controls and motion intensity sliders via Vertex AI but defaults
to narrative pans, requiring heavy prompt overrides for zero-camera subtlety.[3]

### 5. Prompt Adherence

**Seedance 2.0 leads for exact adherence to "subtle natural motion — gentle
blink, bonnet adjust, no camera movement," with commerce-tuned prompts yielding
Apple-ad-like restraint.[5]** Runway Gen-4 follows closely via brush+text
combo.[2] Veo 3.1 is weakest, often injecting dramatic elements despite
constraints.[3][6]

### 6. Native Resolution and Aspect Ratio

None natively output 1920x1080 16:9 without upscaling; all max at 1280x720 or
1080p equivalents post-processing.[3] Seedance 2.0 via fal.ai hits 1080p 16:9
natively after late-2025 updates.[5][7] Runway Gen-4 Turbo supports 1080p 16:9
directly via SDK.[1] Veo 3.1 Fast reaches 1440x1080 (upscales to 1920x1080) on
Vertex AI.[3] Max resolutions: Seedance 2.0 (1080p), Runway (1080p), Veo 3.1
(1440p).[3][5]

### 7. Duration

All support 5-8s natively: Runway Gen-4 Turbo (5-10s), Seedance 2.0 (4-10s via
fal.ai), Veo 3.1 Fast (5-8s).[1][3][5]

### 8. Loop-ability

Runway Gen-4 natively supports start/end-frame matching for seamless
loops.[1][2] Seedance 2.0 enables it via dual-image inputs (first/last frame) on
Replicate/fal.ai.[5][7] Veo 3.1 requires post-editing or prompt hacks; no native
start/end-frame in Vertex AI docs.[3]

### 9. Pricing per 1080p 8-Second Clip (April 2026 API)

| Model              | Platform      | Price       |
| ------------------ | ------------- | ----------- |
| Runway Gen-4 Turbo | @runwayml/sdk | $0.12[1]    |
| Seedance 2.0       | fal.ai        | $0.08       |
| Seedance 1.5       | Replicate     | $0.10[5][7] |
| Veo 3.1 Fast       | Vertex AI     | $0.15[3]    |

### 10. Latency

Seedance 2.0 on fal.ai: 20-40s end-to-end.[5][7] Runway Gen-4 Turbo SDK:
30-60s.[1] Veo 3.1 Fast Vertex: 45-90s.[3]

### 11. API Availability

- **Runway Gen-4: Direct @runwayml/sdk (best quality/latency balance).[1]**
- **Seedance: fal.ai (fastest/cheapest), Replicate (reliable scaling); fal.ai
  wins cost/latency.[5][7]**
- **Veo 3.1: @google/genai or Vertex AI (enterprise-scale, highest
  latency/cost).[3]**

### 12. Known Failure Modes and Quirks (Early 2026)

- **Runway Gen-4:** Minor hair wobble on 4c; over-motion if brushes
  misapplied.[1][2]
- **Seedance 2.0:** Rare over-smoothing in ultra-subtle prompts; excels in
  e-comm but needs strong ref images.[5]
- **Veo 3.1:** Identity drift/skin lightening on dark tones; adds unwanted pans;
  high variance.[3][6]

### 13. Battle-Tested Recommendation

**Pick Seedance 2.0 via fal.ai: it minimizes regenerations/identity drift for
your 6 dark-skin/natural-hair stills, delivering precise subtle loops for
e-commerce heroes at best value ($0.08/clip, 20-40s latency).[5][7]** Best
quality regardless of cost: still Seedance, edging Runway on skin/hair fidelity
without brushes needed.[1][5] Avoid Veo for your use case due to drift risks.[3]
