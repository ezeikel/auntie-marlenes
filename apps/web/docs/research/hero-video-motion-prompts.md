# Auntie Marlene's — Hero Video Motion Prompts (Seedance 1.5 Pro)

Per-scene motion prompts for
`fal-ai/bytedance/seedance/v1.5/pro/image-to-video`, designed for **subtle
cinematic hero loops** that preserve identity and avoid camera drift.

## Global config (applied to every scene)

| Field            | Value        | Why                                                                                                                |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `camera_fixed`   | `true`       | Tripod lock — no pans, zooms, or dolly moves. Most important flag we set.                                          |
| `generate_audio` | `false`      | Hero backgrounds are muted. Saves ~50% on cost (~$0.13 vs $0.26 per clip).                                         |
| `resolution`     | `"720p"`     | Max supported. CSS scales to 1920×1080 on the page.                                                                |
| `aspect_ratio`   | `"16:9"`     | Matches source stills.                                                                                             |
| `duration`       | `"5"`        | 5s loops are the sweet spot — long enough to feel alive, short enough to cycle 6 scenes every 30s on the homepage. |
| `seed`           | `42` (fixed) | Reproducible regens. Change if we want variation.                                                                  |

## Prompt design rules

1. **Terse.** ~15–25 words. Long prompts push Seedance toward its dramatic-clip
   training distribution.
2. **One or two named ambient actions max.** Every extra verb is another chance
   for the model to invent something.
3. **Belt + braces camera lock.** `camera_fixed: true` in config _and_ "static
   camera, no camera movement, tripod shot" in the text prompt.
4. **Identity lock phrase.** "Preserve all facial features, skin tone, and hair
   texture from the input image exactly" at the end of every prompt — fights
   drift.
5. **Motion vocabulary:** gentle blink, slow breath, subtle hand adjustment,
   hair catching light, curtain drift, ambient lamp glow, tiny smile. Never:
   turn around, stand up, walk, large gesture, speak.

---

## Scene 1 — The Bonnet Moment

**Still:** Woman in cream t-shirt at bedroom mirror, tying emerald satin bonnet.
Warm tungsten lamp light.

### Motion prompt

> She slowly finishes tying the satin bonnet, her hands settling as she gives a
> small self-knowing smile in the mirror. A gentle blink. Warm lamp light holds
> steady. Static camera, no camera movement, tripod shot. Preserve all facial
> features, skin tone, and 4c hair texture from the input image exactly.

**Why this works:** The still captures her mid-gesture, so the obvious natural
motion is completing the gesture — Seedance has a very strong prior for this and
will execute it gently. The blink is a universal "this is alive" cue. No body
motion, no head turn beyond what she'd naturally do in-place.

---

## Scene 2 — Between Her Knees (Mother & Daughter Cornrows)

**Still:** Mother on floor cushion cornrowing daughter's hair, daughter holds
mirror between her knees. Afternoon window light.

### Motion prompt

> The mother's fingers continue weaving the cornrow with slow steady rhythm. The
> daughter watches patiently in the handheld mirror, a tiny smile. Sheer curtain
> drifts faintly in the background. Static camera, no camera movement, tripod
> shot. Preserve all facial features, skin tones, and hair textures from the
> input image exactly.

**Why this works:** Braiding is continuous repetitive motion — the model handles
rhythm well and won't invent chaos. The curtain drift is a classic
ambient-motion cue that sells "living photo" without touching subjects. No
hand-off, no pose change.

---

## Scene 3 — Kitchen Beautician

**Still:** Standing friend mid-braiding seated friend's hair, seated friend
laughing back over shoulder with phone.

### Motion prompt

> The standing friend continues braiding with focused hands. The seated friend's
> laugh softens into a warm smile as her eyes stay on her friend. Steam rises
> gently from the tea mug. Static camera, no camera movement, tripod shot.
> Preserve all facial features, skin tones, and hair textures from the input
> image exactly.

**Why this works:** The still catches a laugh at its peak — the natural next
frame is the laugh settling, which is exactly the motion we want. Steam from the
mug is _perfect_ ambient motion: it's continuous, naturally subtle, and fal.ai's
Seedance examples frequently feature this exact cue. No body rotation needed.

---

## Scene 4 — Anointing the Locs

**Still:** Woman at bathroom vanity working oil through one loc, mirror
reflection, golden hour.

### Motion prompt

> Her fingers slowly work the oil down the length of the loc she's holding. A
> calm slow breath. Golden sunlight holds steady through the window. Static
> camera, no camera movement, tripod shot. Preserve all facial features, skin
> tone, and loc texture from the input image exactly.

**Why this works:** The oil-application gesture is short, controlled, and the
model will continue it naturally. "Slow breath" is one of the most reliable
subtle-motion cues — it produces a tiny shoulder rise and a flare of the
nostrils that sells realism without risking drift. Locs in motion are the single
riskiest texture in the set, so I kept motion minimal.

---

## Scene 5 — The Fade Moment (Barbershop)

**Still:** Barber running cordless clippers up client's nape, client calm and
forward-facing, barbershop interior.

### Motion prompt

> The barber steadily runs the clippers along the fade line, his focused hands
> holding precise. The client blinks slowly, expression calm. Warm shop lights
> hold steady. Static camera, no camera movement, tripod shot. Preserve all
> facial features, skin tones, and hair textures from the input image exactly.

**Why this works:** The clipper motion is already implied — Seedance continues
it as a small steady sweep. The client's slow blink is the subtle "alive" cue
that doesn't risk head movement (which would be dangerous with clippers in frame
and blow the continuity). No other body motion asked for.

---

## Scene 6 — Dad's Saturday Hair Day

**Still:** Dad on sofa edge carefully parting daughter's hair with wide-tooth
comb, daughter reaching back toward oil bottle in curiosity.

### Motion prompt

> The father gently continues parting her hair with the comb, his focused
> expression holding. The daughter's hand slowly touches the hair oil bottle
> with soft curiosity. Warm morning light holds steady. Static camera, no camera
> movement, tripod shot. Preserve all facial features, skin tones, and hair
> textures from the input image exactly.

**Why this works:** The still catches the daughter's hand mid-reach toward the
bottle — the natural continuation is her fingertips _touching_ the bottle, which
is about 0.5s of motion. The dad's combing is continuous and controlled. Two
tiny motions, both already implied by the still's composition, both easy for the
model to execute gently.

---

## Retry strategy (if a clip fails the judge)

If Claude flags drift or unwanted motion on a scene, in order of cheapness:

1. **Re-roll with a different seed** — sometimes the same prompt and seed=84 or
   1337 just lands better. Cheapest retry.
2. **Tighten the prompt** — remove the ambient-cue (curtain, steam, light) and
   keep only the primary motion. Reduces the model's freedom.
3. **Drop duration to 4s** — shorter clips have fewer frames to drift across.
   Slight quality hit but identity preservation improves.
4. **Fall back to Runway Gen-4 Turbo** — we still have the SDK wired up. More
   expensive per clip but documented better identity preservation on dark skin
   in the comparison research.

## Judge rubric (Claude on extracted frames)

I'll extract 3 frames from each output MP4 via ffmpeg (first, middle, last),
send them to Claude alongside the original still, and score on:

1. **identityMatch** (1-5) — Does the subject in every frame match the subject
   in the input still? Same face, same skin tone, same hair? (Primary axis.)
2. **motionSubtlety** (1-5) — Is the motion subtle and appropriate, or
   dramatic/unwanted? (5 = Apple ad, 1 = TikTok effect.)
3. **cameraStillness** (1-5) — Is the camera actually locked? (5 = no
   perceptible movement frame-to-frame, 1 = obvious pan/zoom.)
4. **textureIntegrity** (1-5) — Does hair/skin stay photoreal or does it go
   jello/rubber/plastic?
5. **compositionStability** (1-5) — Do background elements stay in place? No
   morphing shelves, no warping mirrors.

PASS if all ≥4. Otherwise REDO up to 2 retries with different seeds.
