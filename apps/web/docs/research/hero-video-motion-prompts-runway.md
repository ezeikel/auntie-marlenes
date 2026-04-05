# Auntie Marlene's — Hero Video Motion Prompts (Runway Gen-4.5 + Slow-Mo)

Per-scene motion prompts for **Runway Gen-4.5** via `@runwayml/sdk`, designed
for **butter-smooth slow-motion hero loops** with locked backgrounds and
preserved identity.

## Pipeline

Each scene goes through two stages:

1. **Runway generates a 5s clip** at 1280×720 with the slow-mo prompt below
2. **ffmpeg post-processing** stretches 5s → 7s (1.4× slowdown) with the
   `minterpolate` filter for true frame interpolation — not just held frames.
   The result is silky, not mechanical.

Combined effect: Runway already interprets "slow motion" semantically in the
generation (subjects move more deliberately), then ffmpeg smoothly
time-stretches the result for genuine buttery flow.

## Global config

| Field      | Value                      | Why                                                      |
| ---------- | -------------------------- | -------------------------------------------------------- |
| `model`    | `'gen4.5'`                 | Latest Runway image-to-video model                       |
| `ratio`    | `'1280:720'`               | 16:9 landscape, the only landscape ratio that works here |
| `duration` | `5`                        | Generate 5s, then ffmpeg stretches to 7s                 |
| `seed`     | `42` (retry: `84`, `1337`) | Reproducibility + retry diversity                        |

**Note:** Runway Gen-4.5 has no `camera_fixed` boolean — stillness must come
entirely from the prompt text. This is the single biggest difference from the
Seedance prompts.

## Prompt design rules

1. **Lead with "slow motion" language.** Runway has strong slow-mo priors from
   its training data — invoking them up front makes the model render the content
   at a naturally deliberate pace.
2. **Camera stillness repeated multiple times.** No API lock, so we say "locked
   camera, tripod shot, camera does not move, static frame" to make absolutely
   sure.
3. **Explicit background lock.** New requirement after the first Runway test
   where nightstand objects appeared unstable. Every prompt now says "all
   background objects remain perfectly still and do not move or multiply".
4. **Motion still terse and singular.** One primary ambient gesture + one minor
   cue. Same principle as before.
5. **Identity lock phrase at the end.** "Preserve all facial features, skin
   tone, and hair texture from the input image exactly."
6. **Runway prompt length sweet spot is ~60–120 words.** Longer than the
   Seedance prompts because we're carrying extra camera + background locks.

---

## Scene 1 — The Bonnet Moment

**Still:** Woman in cream t-shirt at bedroom mirror, tying emerald satin bonnet.
Warm tungsten lamp light.

### Runway prompt

> Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. She gently
> finishes tying the satin bonnet, her fingers settling at the nape of her neck,
> then a soft self-knowing smile rises in the mirror. A single slow blink. Warm
> lamp light holds perfectly steady. Locked tripod camera, static frame, camera
> does not move at all. All background elements — the lamp, the bed, the bottles
> on the nightstand, the mirror — remain perfectly still and do not move,
> multiply, or change shape. Preserve all facial features, skin tone, and 4c
> hair texture from the input image exactly.

---

## Scene 2 — Between Her Knees (Mother & Daughter Cornrows)

**Still:** Mother on floor cushion cornrowing daughter's hair, daughter holds
mirror between her knees. Afternoon window light.

### Runway prompt

> Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The
> mother's fingers slowly continue weaving the cornrow with gentle deliberate
> rhythm. The daughter watches patiently in the handheld mirror, a tiny smile
> forming slowly. The sheer curtain drifts almost imperceptibly. Locked tripod
> camera, static frame, camera does not move at all. All background elements —
> the sofa cushions, the wicker basket, the hair products, the window frame —
> remain perfectly still and do not move, multiply, or change shape. Preserve
> all facial features, skin tones, and hair textures from both subjects in the
> input image exactly.

---

## Scene 3 — Kitchen Beautician

**Still:** Standing friend mid-braiding seated friend's hair, seated friend
laughing back over shoulder with phone.

### Runway prompt

> Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The
> standing friend continues braiding with slow focused hands. The seated
> friend's laugh softens gradually into a warm smile as her eyes hold on her
> friend. Steam rises slowly from the tea mug. Locked tripod camera, static
> frame, camera does not move at all. All background elements — the kitchen
> cabinets, the houseplants, the tea mug, the hair products on the table —
> remain perfectly still and do not move, multiply, or change shape. Preserve
> all facial features, skin tones, and hair textures from both subjects in the
> input image exactly.

---

## Scene 4 — Anointing the Locs

**Still:** Woman at bathroom vanity working oil through one loc, mirror
reflection, golden hour.

### Runway prompt

> Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. Her
> fingers slowly work the golden oil down the length of the loc she is holding.
> A calm slow breath, her shoulders rising almost imperceptibly. Golden sunlight
> holds perfectly steady through the window. Locked tripod camera, static frame,
> camera does not move at all. All background elements — the vanity, the oil
> jar, the wooden comb, the silk scarf, the mirror — remain perfectly still and
> do not move, multiply, or change shape. Preserve all facial features, skin
> tone, and loc texture from the input image exactly.

---

## Scene 5 — The Fade Moment (Barbershop)

**Still:** Barber running cordless clippers up client's nape, client calm and
forward-facing, barbershop interior.

### Runway prompt

> Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The barber
> steadily runs the clippers along the fade line with slow precise focus. The
> client's expression remains calm, a single slow blink. Warm shop lights hold
> perfectly steady. Locked tripod camera, static frame, camera does not move at
> all. All background elements — the mirror wall, the shelves of tools, the
> second chair, the framed photos — remain perfectly still and do not move,
> multiply, or change shape. Preserve all facial features, skin tones, and hair
> textures from both subjects in the input image exactly.

---

## Scene 6 — Dad's Saturday Hair Day

**Still:** Dad on sofa edge carefully parting daughter's hair with wide-tooth
comb, daughter reaching back toward oil bottle in curiosity.

### Runway prompt

> Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The father
> gently continues parting her hair with the comb, his focused expression
> holding. The daughter's small fingertips slowly touch the hair oil bottle with
> soft curiosity. Warm morning light holds perfectly steady. Locked tripod
> camera, static frame, camera does not move at all. All background elements —
> the sofa, the rug, the wicker basket of hair products, the coffee mug on the
> side table — remain perfectly still and do not move, multiply, or change
> shape. Preserve all facial features, skin tones, and hair textures from both
> subjects in the input image exactly.

---

## ffmpeg post-processing command

After each Runway clip downloads, we stretch it to 1.4× duration with frame
interpolation:

```bash
ffmpeg -i input.mp4 \
  -filter:v "setpts=1.4*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1:me_mode=bidir" \
  -c:v libx264 -preset medium -crf 18 \
  -an \
  output.mp4
```

**What this does:**

- `setpts=1.4*PTS` — stretches the presentation timestamps by 1.4×, making a 5s
  clip play for 7s
- `minterpolate` — generates new intermediate frames via motion-compensated
  interpolation (instead of just holding source frames longer, which would look
  jerky)
- `mi_mode=mci` — motion-compensated interpolation (highest quality)
- `mc_mode=aobmc` — adaptive overlapped block motion compensation (reduces
  blocking artifacts at edges)
- `vsbmf=1` — variable-size block motion finding (better on subtle motion)
- `me_mode=bidir` — bidirectional motion estimation (looks at both preceding and
  following frames)
- `fps=30` — outputs 30 fps for smooth playback on the web
- `-crf 18` — high-quality H.264 encode (visually lossless)
- `-an` — drops audio (not needed for muted hero backgrounds)

**Latency:** ~30–60 seconds per clip for the ffmpeg step. Adds meaningful time
to the pipeline but the result is genuinely silky. The alternative (no
interpolation, just held frames) takes ~2s but looks slightly stuttery on close
inspection.

## Retry strategy

Same as before, in order of cheapness:

1. Re-roll with seed `84`, then `1337`
2. Tighten the prompt — remove the ambient cue and keep only the primary motion
3. Shorten generation duration to 4s before ffmpeg stretch (1.4× → 5.6s loop)
4. Fall back to Seedance for that specific scene

## Judge rubric caveat

The Claude video judge scores the 3 extracted frames against the original still,
but:

- **It has a blind spot for prop morphing between adjacent frames** (since we
  only sample 3 frames out of ~150)
- **It can false-positive on "multiplying props"** when a prop was present all
  along but caught different light in the sampled frames

**Your eyes on the actual video file are the final arbiter.** Treat judge scores
as an advisory sanity check, not authoritative.
