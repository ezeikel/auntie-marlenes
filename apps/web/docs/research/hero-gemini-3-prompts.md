# Auntie Marlene's — Hero Image Prompts (Gemini 3 Pro Image)

6 cinematic hero scenes, rewritten for **`gemini-3-pro-image-preview`** via
`@ai-sdk/google`.

## Why these differ from the Nano Banana prompts

Gemini 3 Pro Image has a "World Simulator" reasoning engine that builds an
internal 3D scene before generating. It rewards **explicit physics** (light
direction, angle, bounce, specular behavior, material interaction) over pure
aesthetic reference. Google's own Gemini 3 prompting guidance says: be precise,
structured, and place critical constraints at the end. Key changes from the Nano
Banana version:

- **Structured markdown sections** instead of prose paragraphs
- **Explicit light physics** per scene (direction in degrees, quality, bounce,
  shadow behavior, specular highlights) tuned for dark skin tones
- **MST skin tone framework + "editorial Black fashion photography" contextual
  framing** in the Subject section — proven to anchor the model to the right
  training distribution
- **Positive constraints at the end** instead of `avoiding X, not Y` — Gemini 3
  Pro Image deprioritizes negations and the World Simulator handles positive
  specs more reliably
- **Warm color temperature (3200–4000K)** called out explicitly for dark skin
  rendering — preserves detail in shadows without flatness
- **Natural skin texture with visible pores and micro-imperfections** framed
  positively to kill the plasticky AI look
- **2K resolution, 16:9** specified in Output section of every scene

## Generation workflow

1. Generate **Scene 1 (The Bonnet Moment)** first using a blank 1920×1080
   warm-cream PNG as a 16:9 aspect anchor. This is the tonal reference for the
   whole set.
2. Resize the output to exactly 1920×1080 via `sharp`.
3. For **Scenes 2–6**, pass Scene 1's output as a **style/color/mood reference
   image** with this instruction:
   > "IMAGE 1 is the brand style reference — match its color grading, warm color
   > temperature, lighting quality, film-like aesthetic, shadow richness, and
   > 16:9 aspect ratio exactly. Do NOT copy the subject or composition of
   > Image 1. Generate a different scene as described below."
4. Run each scene through the Claude representation judge. Retry REDOs up to 2
   times.
5. Save to `apps/web/public/images/hero/hero-01-bonnet.png` …
   `hero-06-dad-braids.png`.

## Shared style lock (appended to every prompt for scenes 2–6)

> **Brand style match:** Match the color grading, warm color temperature,
> golden-hour film aesthetic, shadow richness, and cinematic mood of IMAGE 1
> (the brand reference) exactly. Preserve the same visual language so this image
> feels like part of the same editorial photo set.

## Shared positive-constraint block (appended at the end of every prompt)

> **Critical requirements (maintain all):**
>
> - Natural skin texture with visible pores, fine lines, and subtle surface
>   micro-variation clearly preserved
> - Authentic Black hair texture with natural irregularity, individual strands
>   and coils visible, no synthetic uniformity
> - Anatomically correct hands with exactly five fingers each, natural finger
>   positioning, correct proportions
> - Physically plausible lighting with realistic shadow falloff and specular
>   behavior
> - Dignified, respectful representation grounded in editorial Black fashion
>   photography traditions
> - Professional styling, warm and authentic emotional expression
> - 16:9 landscape composition with subject comfortably framed, no cropping of
>   heads or hands
> - Photographic realism in the tradition of 35mm editorial film photography
> - Rich shadow detail preserved without crushed blacks, warm highlights without
>   blown-out whites

---

## Scene 1 — The Bonnet Moment

**Filename:** `hero-01-bonnet.png` **Reference image:** Blank 1920×1080 warm
cream canvas (aspect anchor only)

### Subject

A Black woman in her mid-thirties, editorial beauty portrait in the tradition of
professional Black fashion photography. Deep mahogany skin tone matching Monk
Skin Tone scale MST 8, with warm golden undertone and natural luminous quality.
Her 4c natural hair is freshly moisturised — tight defined coils with natural
variation and individual strand visibility. She is wearing a soft oversized
cream cotton t-shirt. She is mid-gesture, tying a jewel-toned emerald satin
bonnet over her hair, her fingers tucking edge pieces at the nape of her neck
with practiced precision. Her face, caught in the mirror reflection, wears a
small self-knowing half-smile — the quiet confidence of a nightly ritual
completed.

### Setting

Intimate master bedroom at night. A warm wooden nightstand beside her with a
single lit tungsten lamp with a soft linen shade. An unmade bed with rumpled
cream linen sheets in soft focus behind her. A small wall-mounted round mirror
in a brass frame. On the nightstand: a dark glass bottle of leave-in conditioner
and a small amber-glass bottle of hair oil. Warm earth-toned walls. A lived-in,
grounded, private space.

### Lighting

- **Primary light:** Single warm tungsten lamp (approximately 2800K color
  temperature) positioned lower-left, roughly 45° below her eye line and 1 meter
  away. Creates soft directional glow on her face and hands.
- **Secondary fill:** Warm bounce light reflecting off the cream wall behind the
  nightstand, gently filling shadows on the right side of her face at
  approximately 25% the intensity of the key light.
- **Shadow behavior:** Deep warm shadows falling to the right side of her face
  and across the bed behind her, with soft graduated edges — not harsh. Shadows
  retain full detail, never crushing to pure black.
- **Specular highlights:** Sharp gentle highlight running along the satin bonnet
  where the lamp light hits the fabric, showing the silk sheen. Warm catch-light
  in her eyes in the mirror reflection.
- **Color temperature of the scene:** Overall warm amber-gold cast around
  3000–3400K, complementing the warm undertones of her deep skin tone and
  preserving dimensional detail.
- **Mood:** Peaceful, meditative, almost sacred. The quiet intimacy of a nightly
  hair-care ritual.

### Camera

Shot on 85mm portrait lens at f/2.0. Medium close-up framing — her face and
hands visible through the mirror reflection, shoulders just in frame. Camera
positioned at a slight three-quarter side angle to her, slightly below her eye
line. Rule-of-thirds composition with her face in the upper-left third of the
frame. Shallow depth of field — her face, hands, and the bonnet in sharp focus,
the bedroom behind softly out of focus with gentle bokeh on the bedside lamp.

### Materials & Physics

- **Satin bonnet:** Smooth reflective silk surface catching the lamp light in a
  defined, soft sheen, following the curve of her head.
- **Skin surface:** Natural texture with visible pores, fine lines, subtle sheen
  from moisturised hair products, authentic micro-imperfections preserved. Light
  wraps around the curve of her jaw showing three-dimensional form.
- **Hair:** 4c coils absorbing most light on their own texture, with subtle
  highlights where the lamp catches the tops of individual coils near the crown.
- **Cotton t-shirt:** Matte soft diffusion of light, slight wrinkles and natural
  fabric drape.
- **Glass bottles on nightstand:** Partial light refraction, warm amber glow
  through the oil bottle glass, gentle highlight on the dark conditioner bottle.

### Output

Aspect ratio 16:9 cinematic landscape, approximately 2K resolution (1920×1080
equivalent), warm editorial color grading with preserved shadow detail and
gentle highlight roll-off. Kodak Portra 400 film aesthetic referenced as color
direction: warm peachy rendering, rich shadow detail, smooth highlight
gradations, organic film-like grain.

### Critical requirements (maintain all)

- Natural skin texture with visible pores, fine lines, and subtle surface
  micro-variation clearly preserved
- Authentic 4c Black hair texture with natural irregularity, individual coils
  visible, no synthetic uniformity
- Anatomically correct hands with exactly five fingers each, natural finger
  positioning tying the bonnet
- Physically plausible tungsten lamp lighting with realistic warm shadow falloff
  and silk specular behavior
- Dignified, respectful representation grounded in editorial Black fashion
  photography traditions
- Warm, private, self-knowing emotional tone — not performative
- 16:9 landscape composition with subject comfortably framed, no cropping of
  head or hands
- Photographic realism in the tradition of 35mm editorial film photography
- Rich shadow detail preserved without crushed blacks, warm highlights without
  blown-out whites

---

## Scene 2 — Between Her Knees (Mother & Daughter Cornrows)

**Filename:** `hero-02-mother-daughter.png` **Reference image:** Scene 1 output
(style/color lock)

### Brand style match

Match the color grading, warm color temperature, golden-hour film aesthetic,
shadow richness, and cinematic mood of IMAGE 1 (the brand reference) exactly.
Preserve the same visual language so this image feels like part of the same
editorial photo set. Do NOT copy the subject or composition of Image 1 —
generate a different scene as described below.

### Subject

Two Black subjects, editorial portrait in the tradition of professional Black
family photography. **Mother:** early forties, bronze skin tone matching MST 7
with neutral-warm undertone, her own long box braids pulled back into a low bun.
She wears a loose cream linen dress. **Daughter:** approximately six years old,
matching MST 7 bronze skin tone, 4b natural hair being worked on — half already
cornrowed neatly along the scalp, half loose and freshly parted. She wears a
soft pink school-uniform polo shirt. The mother is seated on a floor cushion,
the daughter sitting cross-legged between her mother's knees on the rug. The
mother's hands are mid-motion weaving a clean three-strand cornrow close to the
daughter's scalp along the side of her head. The daughter holds a small round
handheld mirror, watching her mother's fingers work, a patient gentle smile on
her face. An unposed, ritual moment of generational care.

### Setting

A warm lived-in living room in late afternoon. Large bay window on the right
with sheer cream curtains diffusing the light. A soft wool rug on hardwood
floor. Cushions stacked on a sofa in the soft-focus background. Beside them on
the floor: a small wicker basket containing a plastic spray bottle with water,
sectioning clips, a small tub of edge control, a jar of shea butter hair cream,
a wide-tooth comb, and a small glass bottle of coconut oil.

### Lighting

- **Primary light:** Warm afternoon sunlight (approximately 3800K color
  temperature) streaming through the bay window on the right, diffused by sheer
  curtains, acting as a soft broad key light from camera-right at roughly 60°
  angle above the subjects.
- **Secondary fill:** Gentle bounce light from a cream-painted wall on the left
  at approximately 30% intensity, softly filling shadows on the shaded side of
  both subjects' faces.
- **Backlight/rim:** Warm rim light catching loose strands of the daughter's
  hair at the crown, creating a subtle halo that separates her from the
  background.
- **Shadow behavior:** Soft graduated shadows falling to the left across the
  rug. Shadows retain full detail in the deeper skin tones — never crushed,
  never flat.
- **Specular highlights:** Tiny catch-lights in both subjects' eyes. Subtle
  highlights on the mother's hands where sunlight catches the natural oils on
  her fingers from working product through the daughter's hair.
- **Color temperature:** Overall warm golden-hour cast at around 3600–3900K,
  flattering both bronze skin tones and preserving dimensional detail.
- **Mood:** Unhurried, generational, tender — the intimacy of teaching through
  touch.

### Camera

Shot on 50mm lens at f/2.2. Wide shot from a low side angle, camera positioned
just above floor level looking slightly upward at both figures, capturing the
full scene from the mother's shoulders down to where the daughter sits between
her knees. Rule-of-thirds composition with the mother's hands and the daughter's
face on the left third, the window and bright living room falling away on the
right. Moderate depth of field — both figures in focus, living room background
softly blurred.

### Materials & Physics

- **Skin surface:** Natural texture with visible pores, warm subsurface
  scattering in the sunlight, authentic micro-imperfections preserved on both
  mother and daughter.
- **Hair:** The daughter's 4b texture showing natural irregularity and
  individual coil definition in the loose half, clean tight cornrows in the
  parted half, with baby hairs refined at the hairline. The mother's box braids
  showing realistic individual strand definition.
- **Linen dress and pink polo:** Matte fabric with soft natural drape, gentle
  shadow detail in the folds.
- **Wool rug:** Visible pile texture, gentle light absorption, subtle warm
  tones.
- **Glass bottles and wicker basket:** Natural light refraction through the
  coconut oil bottle, woven texture of the basket catching the sidelight.
- **Handheld mirror:** Small reflective surface catching a fragment of the
  sunlight and the mother's hands.

### Output

Aspect ratio 16:9 cinematic landscape, approximately 2K resolution (1920×1080
equivalent), warm editorial color grading matching Scene 1, Kodak Portra 400
film aesthetic, rich shadow detail, smooth highlight gradations.

### Critical requirements (maintain all)

- Natural skin texture with visible pores, fine lines, and subtle surface
  micro-variation clearly preserved on both subjects
- Authentic 4b Black hair texture with natural irregularity, individual coils
  visible on the daughter, realistic box braid definition on the mother
- Clean well-executed cornrow sections close to the scalp, refined baby hairs at
  the daughter's hairline
- Anatomically correct hands with exactly five fingers each for both subjects,
  the mother's fingers naturally positioned mid-weave
- Physically plausible afternoon window light with realistic shadow falloff
- Dignified, tender generational representation in the tradition of editorial
  Black family photography
- Warm unhurried emotional tone — not staged, not performative
- 16:9 landscape composition comfortably framing both figures, no cropping of
  heads or hands
- Rich shadow detail preserved in both bronze skin tones without crushed blacks
  or flat rendering

---

## Scene 3 — Kitchen Beautician

**Filename:** `hero-03-kitchen-beautician.png` **Reference image:** Scene 1
output (style/color lock)

### Brand style match

Match the color grading, warm color temperature, golden-hour film aesthetic,
shadow richness, and cinematic mood of IMAGE 1 (the brand reference) exactly.
Preserve the same visual language so this image feels like part of the same
editorial photo set. Do NOT copy the subject or composition of Image 1 —
generate a different scene as described below.

### Subject

Two Black women in their late twenties, close friends, editorial documentary
portrait in the tradition of professional Black fashion photography. **Standing
friend (the beautician):** caramel skin tone matching MST 6 with warm golden
undertone, her own 4a natural hair pulled back into a high bun, wearing a fitted
cropped ribbed tee and relaxed jeans, standing behind her seated friend. Her
hands are mid-motion installing medium knotless box braids — sections of hair
gathered and being plaited — her lips slightly pressed in focused concentration.
**Seated friend:** deep mahogany skin tone matching MST 8 with warm undertone,
half her 4c hair already braided on one side, half still loose and freshly
parted. She wears an oversized grey hoodie, phone in her lap, glancing back over
her shoulder mid-conversation with a wide laughing grin. An unposed, warm
sisterhood moment.

### Setting

A bright airy home kitchen in a UK apartment. Large window on the left with a
few leafy houseplants on the sill. Soft wooden cabinets and a small white tiled
backsplash softly visible in the background behind them. A small wooden kitchen
table with a steaming ceramic mug of tea and a small woven tray holding hair
supplies: a plastic spray bottle, a jar of braiding gel, a jar of twist cream, a
small ceramic dish of bobby pins, sectioning clips, and a wide-tooth comb. A
kitchen chair where the seated friend sits.

### Lighting

- **Primary light:** Soft natural daylight (approximately 5200K at source,
  warmed slightly by the warm color palette) streaming through the left window
  as a broad diffused key light, at roughly 45° to the subjects.
- **Secondary fill:** Warm bounce light from a cream-painted kitchen wall on the
  right at approximately 40% intensity, softly filling shadows on the right side
  of both women's faces.
- **Shadow behavior:** Soft graduated shadows with full detail preserved in both
  skin tones. Shadows fall to the right across the kitchen table.
- **Specular highlights:** Catch-lights in both women's eyes. Gentle highlight
  running along the standing friend's forearms where the window light hits her
  skin. Subtle highlight on the ceramic tea mug and the surface of the twist
  cream jar.
- **Color temperature:** Warm natural daylight cast overall at around 4200K,
  flattering both skin tones and preserving dimensional detail in the deeper
  mahogany tones.
- **Mood:** Warm, laughing, full of sisterhood energy — kitchen-beautician
  culture captured in a real moment.

### Camera

Shot on 50mm lens at f/2.2. Medium shot from the side capturing both women,
camera at approximately the seated friend's eye level, framing from the
beautician's waist to the seated friend's shoulders. Rule-of-thirds composition
with the beautician's focused hands in the left third and the seated friend's
laughing face in the center-right. Moderate depth of field — both women in sharp
focus with kitchen depth softly falling off behind them.

### Materials & Physics

- **Skin surface:** Natural texture with visible pores and authentic
  micro-imperfections on both women, warm subsurface scattering in the window
  light.
- **Hair:** The beautician's 4a high bun showing individual coil definition. The
  seated friend's 4c texture showing natural irregularity where loose, and clean
  realistic knotless braid formation where worked. No synthetic uniformity.
- **Cropped tee and hoodie:** Matte cotton fabrics with natural drape and subtle
  shadow detail in folds.
- **Tea mug and ceramic dish:** Smooth ceramic surfaces with soft specular
  highlights from the window.
- **Plastic and glass jars of product:** Natural light refraction and subtle
  highlights.
- **Wooden kitchen surfaces:** Visible grain texture, warm light absorption.

### Output

Aspect ratio 16:9 cinematic landscape, approximately 2K resolution (1920×1080
equivalent), warm editorial color grading matching Scene 1, Kodak Portra 400
film aesthetic, rich shadow detail, natural daylight warmth.

### Critical requirements (maintain all)

- Natural skin texture with visible pores, fine lines, and subtle surface
  micro-variation on both women
- Authentic 4a and 4c Black hair textures with natural irregularity, individual
  coils visible, realistic knotless braid formation
- Anatomically correct hands with exactly five fingers each for both subjects,
  the beautician's fingers naturally positioned mid-braid
- Physically plausible natural window light with realistic shadow falloff and
  warm bounce fill
- Dignified, joyful representation of sisterhood and kitchen-beautician culture
- Warm authentic laughter and focused concentration — not performative
- 16:9 landscape composition comfortably framing both figures, no cropping of
  heads or hands
- Rich shadow detail preserved in both caramel and mahogany skin tones

---

## Scene 4 — Anointing the Locs

**Filename:** `hero-04-locs-oil.png` **Reference image:** Scene 1 output
(style/color lock)

### Brand style match

Match the color grading, warm color temperature, golden-hour film aesthetic,
shadow richness, and cinematic mood of IMAGE 1 (the brand reference) exactly.
Preserve the same visual language so this image feels like part of the same
editorial photo set. Do NOT copy the subject or composition of Image 1 —
generate a different scene as described below.

### Subject

A Black woman in her early thirties, editorial beauty portrait in the tradition
of professional Black fashion photography. Mahogany skin tone matching MST 8
with warm golden undertone and natural luminous quality. Shoulder-length mature
locs with natural color variation and realistic individual loc definition — some
darker at the root, warmer at the ends. Bare shoulders or wearing a simple black
bralette. She stands at a bathroom vanity mid-ritual, having just warmed a small
amount of golden hair oil between her palms. Now working it methodically from
root to tip through one loc near her temple, her eyes steady on her own
reflection in the mirror. Her face is calm, self-reverent, focused — no
performance, just private ritual.

### Setting

A minimalist bathroom with warm wooden vanity cabinetry and a large clean wall
mirror. On the counter: a small amber-glass jar of shea butter or argan oil with
the lid off, a wooden wide-tooth comb, a folded silk headscarf at the edge of
the vanity, a small ceramic dish. A small side window to the right of frame
casting direct morning golden light.

### Lighting

- **Primary light:** Direct warm golden-hour sunlight (approximately 3200K color
  temperature) streaming through the side window on the right, acting as a
  defined directional key light at roughly 70° to the subject from camera-right.
- **Secondary fill:** Soft bounce light from the white bathroom mirror and
  vanity surface on the left, gently filling shadows at approximately 35%
  intensity.
- **Backlight/rim:** The golden window light wraps around and creates a distinct
  warm halo on the top curves of her locs and her bare shoulder on the right
  side — a signature rim light that separates her from the bathroom.
- **Shadow behavior:** Directional shadows falling to the left across the vanity
  counter. Full shadow detail preserved in her deep mahogany skin — dimensional,
  never flat.
- **Specular highlights:** Bright warm highlight on the glass oil jar from the
  window. Gentle highlight on her shoulder and collarbone where the sunlight
  catches the subtle sheen of warmed oil on her skin. Catch-light in her eyes in
  the mirror reflection.
- **Color temperature:** Overall warm golden-hour cast at 3200–3500K,
  complementing the warm undertones of her deep skin and creating a sensual,
  reverent atmosphere.
- **Mood:** Meditative, almost spiritual. Self-reverence and intentional
  self-care.

### Camera

Shot on 85mm portrait lens at f/2.0. Close-up portrait framing — her hands,
shoulders, locs, and face reflected in the mirror all visible in frame. Slightly
off-centre rule-of-thirds composition with her face in the upper-left third.
Shallow depth of field — her hands and face in sharp focus, bathroom details in
soft falloff.

### Materials & Physics

- **Locs:** Authentic texture with natural variation in thickness and tone,
  individual loc definition, the oiled loc near her temple catching more light
  than the dry ones.
- **Skin surface:** Natural texture with visible pores on her shoulders and
  face, warm subsurface scattering, a subtle glow from the freshly applied oil.
- **Glass oil jar:** Warm amber refraction where sunlight passes through,
  defined specular highlight on the curved glass surface.
- **Wooden vanity and silk scarf:** Wooden grain catching the sidelight, silk
  showing sheen and natural drape.
- **Mirror:** Clean reflective surface with accurate reflection of her face and
  the opposite wall.

### Output

Aspect ratio 16:9 cinematic landscape, approximately 2K resolution (1920×1080
equivalent), warm editorial color grading matching Scene 1, Kodak Portra 400
film aesthetic, rich golden-hour rendering.

### Critical requirements (maintain all)

- Natural skin texture with visible pores and authentic micro-variation on
  shoulders, collarbone, and face
- Authentic loc texture with natural variation in thickness, tone, and
  individual loc definition — no synthetic uniformity
- Anatomically correct hands with exactly five fingers each, naturally
  positioned working oil through one loc
- Physically plausible golden-hour side-window light with realistic warm rim
  halo on locs and shoulder
- Dignified, reverent representation of Black hair as covenant and ritual, in
  the tradition of editorial beauty photography
- Meditative, self-reverent emotional tone — private, not performative
- 16:9 landscape composition comfortably framing subject, no cropping of head or
  hands
- Rich shadow detail preserved in deep mahogany skin, luminous highlights
  without blown-out whites

---

## Scene 5 — The Fade Moment (Barbershop)

**Filename:** `hero-05-barbershop-fade.png` **Reference image:** Scene 1 output
(style/color lock)

### Brand style match

Match the color grading, warm color temperature, golden-hour film aesthetic,
shadow richness, and cinematic mood of IMAGE 1 (the brand reference) exactly.
Preserve the same visual language so this image feels like part of the same
editorial photo set. Do NOT copy the subject or composition of Image 1 —
generate a different scene as described below.

### Subject

Two Black men, editorial documentary portrait in the tradition of professional
Black barbershop photography. **The barber:** a master craftsman in his forties,
bronze skin tone matching MST 7 with neutral-warm undertone, his own short fade
haircut, full short beard, wearing a fitted black barber smock. His expression
is one of focused precision. **The client:** a young man in his early twenties,
deep mahogany skin tone matching MST 8 with warm undertone, mid-fade haircut in
progress — crisp taper transitioning from skin on the sides up to longer defined
4b coils on top. His head is tilted slightly forward, eyes calm and focused
straight ahead, chin draped with a black barber cape. The barber's steady hands
hold cordless clippers, running them up the side of the client's head creating a
razor-sharp line.

### Setting

A classic Black-owned barbershop interior. Mirror-lined wall behind the chair
reflecting the scene. Open wooden shelves on the wall holding clippers,
trimmers, small bottles of beard oil and aftershave, a barber's brush, and a few
neatly folded towels. A black leather barber chair. A rolled towel on the
counter. Soft-focus background showing a second empty barber chair and framed
photographs on the wall. A small practical desk lamp on the counter.

### Lighting

- **Primary light:** Warm overhead tungsten shop lights (approximately 3200K
  color temperature) from above and slightly in front of the client, bouncing
  off the mirror wall to create a natural key-fill-backlight setup — defining
  the precision of the haircut without harsh shadows.
- **Secondary fill:** Warm bounce light from the mirror wall behind the chair,
  providing even fill on the shaded side of both men's faces at approximately
  45% intensity.
- **Backlight/rim:** Subtle rim light from an adjacent shop fixture catching the
  tops of both men's shoulders, separating them from the background.
- **Shadow behavior:** Clean directional shadows falling softly — defined enough
  to show form, soft enough to preserve all skin and hair detail. Full shadow
  detail in both bronze and mahogany skin tones.
- **Specular highlights:** Defined highlight on the metal body of the cordless
  clippers showing the overhead light. Subtle highlight on the leather barber
  chair. Gentle catch-lights in both men's eyes. Warm highlight on the
  well-groomed coils at the top of the client's head.
- **Color temperature:** Overall warm tungsten cast around 3200–3500K,
  flattering the barbershop's classic aesthetic and both skin tones.
- **Mood:** Focused, reverent, proud — the barbershop as sanctuary and the
  barber as craftsman.

### Camera

Shot on 50mm lens at f/2.5. Side profile medium shot of both figures, camera at
approximately the client's eye level. The barber and his clippers in sharp
focus, the client's profile softly in frame, the scene loosely composed through
or beside the large mirror wall behind the chair for cinematic depth.
Rule-of-thirds composition.

### Materials & Physics

- **Skin surface:** Natural texture with visible pores on both men, warm
  subsurface scattering in the tungsten light, the client's fresh-cut hairline
  showing authentic skin detail.
- **Hair:** The client's sharp fade transition from skin to longer 4b coils with
  realistic individual strand definition on top. The barber's close fade and
  beard with accurate texture. No synthetic smoothness.
- **Metal clippers:** Defined specular reflection of the shop light on the
  polished metal body, matte black handle.
- **Black barber smock and cape:** Matte fabric absorbing most light, subtle
  fold detail.
- **Mirror wall:** Accurate reflection of the opposite side of the shop, slight
  warm cast.
- **Leather barber chair:** Subtle sheen on the worn leather surface.

### Output

Aspect ratio 16:9 cinematic landscape, approximately 2K resolution (1920×1080
equivalent), warm editorial color grading matching Scene 1, Kodak Portra 400
film aesthetic, rich warm tungsten rendering.

### Critical requirements (maintain all)

- Natural skin texture with visible pores on both men, authentic micro-variation
  preserved
- Authentic 4b coil texture on top of the client's head with individual strand
  definition, sharp clean fade transition, realistic beard texture on the barber
- Anatomically correct hands with exactly five fingers each, the barber's
  fingers naturally positioned holding clippers
- Clippers held at a plausible angle consistent with a real fade haircut in
  progress
- Physically plausible warm tungsten barbershop light with realistic mirror
  reflection
- Dignified, reverent representation of Black barbershop culture and craft — the
  barber as artisan
- Focused, proud emotional tone — craftsmanship captured in a real moment
- 16:9 landscape composition comfortably framing both figures, no cropping of
  heads or hands
- Rich shadow detail preserved in both bronze and mahogany skin tones

---

## Scene 6 — Dad's Saturday Hair Day

**Filename:** `hero-06-dad-braids.png` **Reference image:** Scene 1 output
(style/color lock)

### Brand style match

Match the color grading, warm color temperature, golden-hour film aesthetic,
shadow richness, and cinematic mood of IMAGE 1 (the brand reference) exactly.
Preserve the same visual language so this image feels like part of the same
editorial photo set. Do NOT copy the subject or composition of Image 1 —
generate a different scene as described below.

### Subject

A Black father and his young daughter, editorial family portrait in the
tradition of professional Black fashion photography. **Father:** mid-thirties,
mahogany skin tone matching MST 8 with warm undertone, short natural cut,
clean-shaven or light stubble, wearing a plain grey cotton t-shirt and joggers.
**Daughter:** approximately six years old, matching MST 8 mahogany skin tone, 4c
natural hair half-sectioned into two springy puffs on top, the lower sections
being parted and prepared. She wears pink flannel pyjamas. The father sits on
the edge of a low sofa, his daughter sitting on a small floor cushion between
his knees. His large hands carefully part her hair with a wide-tooth comb,
creating a clean section, his face set in focused concentration — tender,
committed, slightly out of his depth but determined to get it right. The
daughter has one hand reaching back in curiosity to touch a bottle of hair oil
on the sofa beside him. Small colourful elastics in bright pinks and yellows are
scattered on the sofa cushion.

### Setting

A warm cozy living room on a Saturday morning. The sofa is soft oatmeal fabric.
A small wicker basket on the floor beside them containing: a plastic spray
bottle with water, a small jar of shea butter, a clear amber-glass dropper
bottle of hair oil, a tub of edge control, a wide-tooth comb. A ceramic mug of
coffee on a side table. A large undressed window on the left letting in soft
morning light. Hardwood floors and a patterned rug.

### Lighting

- **Primary light:** Soft natural morning daylight (approximately 5200K at
  source, warmed by the room's warm palette to around 4400K in the scene)
  streaming through the large left window as a broad diffused key light, at
  roughly 50° to the subjects.
- **Secondary fill:** Warm bounce light from a cream-painted living room wall on
  the right at approximately 40% intensity, softly filling shadows on both
  subjects' faces.
- **Backlight/rim:** Subtle rim light catching the edges of the daughter's puffs
  and the top of the father's shoulder, separating them gently from the
  background.
- **Shadow behavior:** Soft graduated shadows falling to the right across the
  sofa. Full shadow detail preserved in both mahogany skin tones.
- **Specular highlights:** Catch-lights in both subjects' eyes. Gentle highlight
  on the dropper bottle of hair oil where morning light catches the glass. Soft
  highlight on the father's forearms where the window light hits.
- **Color temperature:** Warm morning daylight at around 4200–4400K, flattering
  both skin tones and creating an unhurried Saturday-morning atmosphere.
- **Mood:** Tender, slightly uncertain but deeply committed, unhurried — genuine
  connection over perfection. Saturday morning family rhythm.

### Camera

Shot on 50mm lens at f/2.2. Wide shot from the side at approximately the
daughter's eye level, capturing both figures with the father's hands and the
daughter's face in focus. Rule-of-thirds composition with the daughter's face in
the center-left and the father's focused expression in the upper-right. Living
room background softly blurred.

### Materials & Physics

- **Skin surface:** Natural texture with visible pores on both father and
  daughter, warm subsurface scattering in the morning window light, authentic
  micro-imperfections preserved.
- **Hair:** The daughter's 4c texture on the two finished puffs showing natural
  springy irregularity and individual coil definition, the loose sections
  showing authentic texture being newly parted. The father's short natural cut
  with realistic texture. No synthetic smoothness.
- **Cotton t-shirt, joggers, flannel pyjamas:** Matte fabric with natural drape
  and visible texture.
- **Oatmeal sofa fabric and patterned rug:** Visible weave texture, subtle light
  absorption.
- **Wicker basket:** Woven texture catching the sidelight, warm shadow detail in
  the gaps.
- **Glass hair oil bottle:** Warm amber refraction where morning light passes
  through.
- **Plastic spray bottle and shea butter jar:** Subtle specular highlights.

### Output

Aspect ratio 16:9 cinematic landscape, approximately 2K resolution (1920×1080
equivalent), warm editorial color grading matching Scene 1, Kodak Portra 400
film aesthetic, rich morning daylight rendering.

### Critical requirements (maintain all)

- Natural skin texture with visible pores, fine lines, and authentic
  micro-variation on both father and daughter
- Authentic 4c Black hair texture on the daughter with natural springy
  irregularity and individual coil definition in the two finished puffs
- Father's large hands naturally positioned parting hair with the comb, exactly
  five fingers each
- Daughter's hand reaching toward the oil bottle with exactly five fingers,
  natural childhood proportions
- Physically plausible soft morning window light with realistic shadow falloff
  and warm bounce fill
- Dignified, tender representation of Black fatherhood and caregiving
  masculinity — everyday intimacy, not staged
- Tender focused father concentration, patient curious daughter — authentic
  emotional register
- 16:9 landscape composition comfortably framing both figures, no cropping of
  heads or hands
- Rich shadow detail preserved in both mahogany skin tones without crushed
  blacks

---

## Implementation notes for the generator script

When building `apps/content-worker/src/hero-images.ts`:

1. **Scene 1 generation call** — pass only the prompt text (no reference image)
   with a 1920×1080 blank warm-cream PNG as a single
   `{type:'image', image: buffer}` content part labeled "IMAGE 1: aspect-ratio
   reference only — do not copy content, only match the 16:9 landscape aspect
   ratio."
2. **Scenes 2–6 generation calls** — pass Scene 1's buffer as the first content
   part labeled as the brand style reference, then the scene's prompt. The
   prompt's "Brand style match" section already has the right instruction.
3. **Post-processing** — resize every output to exactly 1920×1080 with
   `sharp().resize(1920, 1080, { fit: 'cover' })` and write as PNG.
4. **Judge rubric** — Claude should score on 5 axes (1-5): skinToneAccuracy,
   hairTextureAuthenticity, anatomyCorrectness, plasticFreeSkin,
   dignifiedRepresentation. Verdict PASS if all ≥4, REDO otherwise. Max 2
   retries per scene.
