/**
 * Hero image generation pipeline.
 *
 * Generates 6 cinematic hero scenes for the Auntie Marlene's homepage using
 * gemini-3-pro-image-preview via @ai-sdk/google, with a Claude representation
 * judge loop for skin tone, hair texture, and anatomical quality.
 *
 * Workflow:
 *   1. Generate Scene 1 (The Bonnet Moment) as the tonal anchor, using a
 *      blank warm-cream 1920x1080 PNG purely to lock 16:9 aspect ratio.
 *   2. Resize Scene 1 to exactly 1920x1080 and save it.
 *   3. For Scenes 2-6, pass Scene 1 as a style/color/mood reference image
 *      (NOT subject reference) so the set feels like one editorial shoot.
 *   4. Each generation is judged by Claude for representation quality. REDOs
 *      are retried up to 2 times before giving up on that scene.
 *   5. Final PNGs land in apps/web/public/images/hero/.
 *
 * Run with: pnpm gen:hero (from apps/worker)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import sharp from 'sharp';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiImage: any = google('gemini-3-pro-image-preview');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

// ─── Paths ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// apps/worker/src → repo root → apps/web/public/images/hero
const HERO_OUTPUT_DIR = path.resolve(
  __dirname,
  '../../../apps/web/public/images/hero',
);

const HERO_WIDTH = 1920;
const HERO_HEIGHT = 1080;
const MAX_RETRIES = 2;

// ─── Scene Definitions ──────────────────────────────────────────────────────

interface HeroScene {
  id: string;
  filename: string;
  title: string;
  prompt: string;
}

// v2 — documentary-realistic constraints. Replaces v1's "editorial Black
// fashion photography" + "cinematic mood" framing which was causing the
// AI-gleam / over-polished skin problem. The new constraints push Gemini 3
// toward unretouched photo-journalism aesthetic: visible pores, natural
// imperfections, harsh single-source lighting, no beauty retouching, SOOC
// camera language.
const SHARED_CONSTRAINTS = `### Critical requirements (maintain all)
- Natural matte skin with visible pores, fine lines, small blemishes, uneven pigmentation preserved — NOT airbrushed
- No artificial beauty-retouching glow or sheen on skin
- Authentic Black hair texture with natural irregularity, individual strands and coils visible, some loose flyaway strands — no synthetic uniformity
- Anatomically correct hands with exactly five fingers each, natural finger positioning, correct proportions
- Harsh realistic single-source lighting with real shadow falloff — NOT three-point studio softness
- Dignified documentary representation — a real lived moment, not a commercial beauty shot
- 16:9 landscape composition with subject comfortably framed, no cropping of heads or hands
- Visible 35mm film grain across the whole image, slight natural lens vignetting
- Shot on a mid-range DSLR with natural white balance, SOOC (straight out of camera) look — no color grading, no post-processing
- NOT: airbrushed, retouched, cinematic, editorial fashion, magazine cover, glossy, polished, Kodak Portra, beauty campaign aesthetic`;

const STYLE_LOCK = `### Brand style match
Match the warm natural lighting tone, shadow depth, and documentary photo-journalism aesthetic of IMAGE 1 (the brand reference). Preserve the same visual language so this image feels like part of the same unretouched photo set. Do NOT copy the subject or composition of Image 1 — generate a different scene as described below. This is NOT a cinematic or editorial fashion look — it is a raw, SOOC, documentary style.`;

const HERO_SCENES: HeroScene[] = [
  {
    id: 'bonnet',
    filename: 'hero-01-bonnet.png',
    title: 'The Bonnet Moment',
    // v2 — documentary-realistic treatment. Matches Scene 4 v2 formula:
    // "unretouched documentary photograph", explicit skin imperfections, harsh
    // single-source lighting, SOOC camera, 35mm grain. Replaces v1's
    // "editorial beauty portrait" + Kodak Portra + three-point studio framing.
    prompt: `### Subject
An unretouched documentary photograph of a Black woman in her mid-thirties with deep mahogany skin (Monk Skin Tone 8) and warm golden undertones. Natural matte skin with visible pores, fine lines around her eyes, subtle uneven pigmentation, faint darker patches on her forehead, and a few small natural blemishes on her cheek. No beauty retouching, no airbrushing, no artificial glow. Her 4c natural hair is freshly moisturised — tight defined coils with natural variation and some loose flyaway strands near her hairline. She wears a soft oversized cream cotton t-shirt. She stands at her bedroom mirror, mid-gesture tying a jewel-toned emerald satin bonnet over her hair, her fingers tucking edge pieces at the nape of her neck. Her face caught in the mirror reflection with a small self-knowing half-smile. A real moment, not a pose.

### Setting
A lived-in master bedroom at night. A warm wooden nightstand with visible grain and slight wear, beside her with a single lit tungsten lamp with a linen shade. An unmade bed with rumpled cream linen sheets behind her. A small wall-mounted round mirror in a brass frame. On the nightstand: a dark glass bottle of leave-in conditioner and a small amber-glass bottle of hair oil. Warm earth-toned walls.

### Lighting
- **Primary light:** Single warm tungsten lamp (approximately 2800K color temperature) as the ONLY light source in the scene. Positioned lower-left, roughly 45° below her eye line and 1 meter away. Harsh single-source lighting with real shadow edges.
- **Shadow behavior:** Deep warm shadows falling to the right side of her face and across the bed behind her. Some parts of the scene in genuine natural shadow with minimal detail — realistic contrast, not filled in by soft bounce or fill lights.
- **No fill light, no bounce cards, no diffusion, no rim light.** The shadows should be real and slightly deep, the way a single warm bedside lamp actually behaves in a real bedroom.
- **Mood:** Quiet, private, unposed — the nightly ritual captured as if by a friend.

### Camera
Shot on a mid-range full-frame DSLR with a 50mm f/2.8 lens, natural white balance, SOOC (straight out of camera) look — no color grading, no post-processing, no beauty retouching. Visible 35mm film grain across the whole image. Slight natural lens vignetting at the corners. Medium close-up framing — her face and hands visible through the mirror reflection, shoulders just in frame, a slight three-quarter side angle.

### Materials & Physics
- **Skin surface:** Real human skin with visible pores, faint veins at the temples, subtle color variation across the face (slightly warmer ears, cooler under-eyes, natural uneven pigmentation), fine lines, small blemishes, and no artificial sheen. Matte natural appearance.
- **Satin bonnet:** Smooth silk surface catching the lamp light in a defined but restrained sheen, not glossy or over-polished.
- **Hair:** 4c coils with authentic texture and natural irregularity, some loose flyaway strands near the hairline.
- **Cotton t-shirt:** Matte soft cotton fabric with visible weave texture and natural drape, no sheen.
- **Glass bottles on nightstand:** Partial light refraction, warm amber glow through the oil bottle glass, no extra sparkle.

### Output
Aspect ratio 16:9 landscape matching the uploaded reference image, approximately 2K resolution (1920×1080 equivalent). NO color grading. NO cinematic look. NO magazine-quality polish. Straight out of camera, mid-range DSLR, documentary style, 35mm film grain visible, photo-journalism aesthetic. Think: a friend's photo of a quiet private moment, not a beauty campaign.

### Critical requirements (maintain all)
- Natural matte skin with visible pores, fine lines, small blemishes, uneven pigmentation preserved — NOT airbrushed
- No artificial beauty-retouching glow or sheen on skin
- Authentic 4c hair texture with natural irregularity and some loose strands — no synthetic uniformity
- Anatomically correct hands with exactly five fingers each, natural finger positioning tying the bonnet
- Harsh realistic single-source tungsten lamp lighting with real shadow falloff — NOT three-point studio softness
- Dignified documentary representation — a real private moment, not a commercial beauty shot
- 16:9 landscape composition with subject comfortably framed, no cropping of head or hands
- Visible 35mm film grain across the whole image
- NOT: airbrushed, retouched, cinematic, editorial fashion, magazine cover, glossy, polished, Kodak Portra, beauty campaign aesthetic`,
  },
  {
    id: 'mother-daughter',
    filename: 'hero-02-mother-daughter.png',
    title: 'Between Her Knees',
    prompt: `${STYLE_LOCK}

### Subject
Two Black subjects, unretouched documentary photograph of a real family moment, photo-journalism style. **Mother:** early forties, bronze skin tone matching MST 7 with neutral-warm undertone, her own long box braids pulled back into a low bun. She wears a loose cream linen dress. **Daughter:** approximately six years old, matching MST 7 bronze skin tone, 4b natural hair being worked on — half already cornrowed neatly along the scalp, half loose and freshly parted. She wears a soft pink school-uniform polo shirt. The mother is seated on a floor cushion, the daughter sitting cross-legged between her mother's knees on the rug. The mother's hands are mid-motion weaving a clean three-strand cornrow close to the daughter's scalp along the side of her head. The daughter holds a small round handheld mirror, watching her mother's fingers work, a patient gentle smile on her face.

### Setting
A warm lived-in living room in late afternoon. Large bay window on the right with sheer cream curtains diffusing the light. A soft wool rug on hardwood floor. Cushions stacked on a sofa in the soft-focus background. Beside them on the floor: a small wicker basket containing a plastic spray bottle with water, sectioning clips, a small tub of edge control, a jar of shea butter hair cream, a wide-tooth comb, and a small glass bottle of coconut oil.

### Lighting
- **Primary light:** Warm afternoon sunlight (approximately 3800K color temperature) streaming through the bay window on the right, diffused by sheer curtains, acting as a soft broad key light from camera-right at roughly 60° angle above the subjects.
- **Secondary fill:** Gentle bounce light from a cream-painted wall on the left at approximately 30% intensity, softly filling shadows on the shaded side of both subjects' faces.
- **Backlight/rim:** Warm rim light catching loose strands of the daughter's hair at the crown, creating a subtle halo that separates her from the background.
- **Shadow behavior:** Soft graduated shadows falling to the left across the rug. Shadows retain full detail in the deeper skin tones — never crushed, never flat.
- **Specular highlights:** Tiny catch-lights in both subjects' eyes. Subtle highlights on the mother's hands where sunlight catches the natural oils on her fingers from working product through the daughter's hair.
- **Color temperature:** Overall warm golden-hour cast at around 3600–3900K.
- **Mood:** Unhurried, generational, tender — the intimacy of teaching through touch.

### Camera
Shot on 50mm lens at f/2.2. Wide shot from a low side angle, camera positioned just above floor level looking slightly upward at both figures, capturing the full scene from the mother's shoulders down to where the daughter sits between her knees. Rule-of-thirds composition with the mother's hands and the daughter's face on the left third, the window and bright living room falling away on the right. Moderate depth of field — both figures in focus, living room background softly blurred.

### Materials & Physics
- **Skin surface:** Natural texture with visible pores, warm subsurface scattering in the sunlight, authentic micro-imperfections preserved on both mother and daughter.
- **Hair:** The daughter's 4b texture showing natural irregularity and individual coil definition in the loose half, clean tight cornrows in the parted half, with baby hairs refined at the hairline. The mother's box braids showing realistic individual strand definition.
- **Linen dress and pink polo:** Matte fabric with soft natural drape, gentle shadow detail in the folds.
- **Wool rug:** Visible pile texture, gentle light absorption, subtle warm tones.
- **Glass bottles and wicker basket:** Natural light refraction through the coconut oil bottle, woven texture of the basket catching the sidelight.
- **Handheld mirror:** Small reflective surface catching a fragment of the sunlight and the mother's hands.

### Output
Aspect ratio 16:9 landscape matching the uploaded reference image, approximately 2K resolution (1920×1080 equivalent). NO color grading. NO cinematic look. NO magazine-quality polish. Straight out of camera, mid-range DSLR, documentary style, 35mm film grain visible, photo-journalism aesthetic matching IMAGE 1.

${SHARED_CONSTRAINTS}`,
  },
  {
    id: 'kitchen-beautician',
    filename: 'hero-03-kitchen-beautician.png',
    title: 'Kitchen Beautician',
    // v3 — repositioned composition. v1/v2 framed the standing friend to the
    // SIDE with her active hands visible, which caused Runway to hallucinate
    // hair-pulling/morphing gestures on the braid. v3 moves the camera to a
    // more head-on angle where the standing friend is DIRECTLY BEHIND the
    // seated friend, working on the back of her head. This puts the active
    // hands partially obscured by the seated friend's head and hair — Runway
    // can't hallucinate what it can't see. Visible motion zones are now: the
    // standing friend's shoulders, face, and upper arms (all safe), plus the
    // seated friend's face. Also removed the tea mug from the scene entirely
    // to eliminate the steam hallucination risk from v2.
    prompt: `${STYLE_LOCK}

### Subject
Two Black women in their late twenties, close friends, unretouched documentary photograph of a real moment, photo-journalism style. **Standing friend (the beautician):** caramel skin tone matching MST 6 with warm golden undertone, her own 4a natural hair pulled back into a high bun, wearing a fitted cropped ribbed tee. She stands DIRECTLY BEHIND the seated friend, working on the BACK of her head. Her upper body is visible from the waist up, but her hands and the specific hair sections she is working on are largely HIDDEN behind the seated friend's head and long braids — we can see her shoulders, arms, concentrated face, and just a glimpse of her fingers at the edge of the seated friend's crown. **Seated friend:** deep mahogany skin tone matching MST 8 with warm undertone, facing the camera mostly head-on with a gentle slight turn, her long 4c box braids falling forward over her shoulders partially obscuring her torso. She wears an oversized grey hoodie, phone held loosely in her lap. Her expression is relaxed and warm — a small contented smile, eyes calm.

### Setting
A bright airy home kitchen in a UK apartment. Large window on the left with a few leafy houseplants on the sill. Soft wooden cabinets and a small white tiled backsplash softly visible in the background behind them. A small wooden kitchen table to the side with a woven tray holding hair supplies: a plastic spray bottle, a jar of braiding gel, a small ceramic dish of bobby pins, sectioning clips, and a wide-tooth comb. A kitchen chair where the seated friend sits. NO coffee mug, NO tea mug, NO hot beverages anywhere in the scene.

### Lighting
- **Primary light:** Soft natural daylight (approximately 5200K at source, warmed slightly by the warm color palette) streaming through the left window as a broad diffused key light, at roughly 45° to the subjects.
- **Shadow behavior:** Soft graduated shadows with full detail preserved in both skin tones. Some natural fall-off — no three-point studio fill.
- **Specular highlights:** Catch-lights in both women's eyes. Gentle highlight running along the standing friend's forearms where the window light hits her skin.
- **Color temperature:** Warm natural daylight cast overall at around 4200K.
- **Mood:** Warm, intimate, a quiet moment of focus during a braiding session.

### Camera
Shot on a mid-range DSLR with a 50mm f/2.8 lens, natural white balance, SOOC look with 35mm film grain. Medium shot from directly IN FRONT of the seated friend, looking slightly up past her to frame the standing friend behind her. Camera at approximately the seated friend's chest level. The composition centers on the seated friend's face and upper torso, with the standing friend's face and shoulders visible above and slightly behind her. The standing friend's active hands at the seated friend's crown are PARTIALLY HIDDEN by the seated friend's own head silhouette and by her long braids — we see the hands only as a glimpse at the edges, not clearly. Both women in focus, kitchen softly falling off behind them.

### Materials & Physics
- **Skin surface:** Real human skin with visible pores and authentic micro-imperfections on both women, warm subsurface scattering in the window light.
- **Hair:** The beautician's 4a high bun showing individual coil definition. The seated friend's 4c texture showing completed long box braids falling forward over her shoulders with natural irregularity.
- **Cropped tee and hoodie:** Matte cotton fabrics with natural drape and subtle shadow detail.
- **Ceramic dish and plastic jars:** Smooth surfaces with subtle specular highlights.
- **Wooden kitchen surfaces:** Visible grain texture, warm light absorption.

### Output
Aspect ratio 16:9 landscape matching the uploaded reference image, approximately 2K resolution (1920×1080 equivalent). NO color grading. NO cinematic look. NO magazine-quality polish. Straight out of camera, mid-range DSLR, documentary style, 35mm film grain visible, photo-journalism aesthetic matching IMAGE 1.

${SHARED_CONSTRAINTS}`,
  },
  {
    id: 'locs-oil',
    filename: 'hero-04-locs-oil.png',
    title: 'Anointing the Locs',
    // Rewritten v2: de-gleamed documentary aesthetic + covered shoulders to
    // clear Sora 2's content classifier (which rejected the v1 still twice
    // because of bare shoulders in an intimate bathroom setting). Key changes
    // from the v1 prompt: (1) "unretouched documentary photograph" instead of
    // "editorial beauty portrait", (2) explicit skin-imperfection language
    // ("natural matte skin with visible pores, uneven pigmentation, faint
    // darker patches, small blemishes, fine lines"), (3) "no beauty
    // retouching" and "no artificial sheen" anti-prompts, (4) "SOOC straight
    // out of camera" camera language instead of "Kodak Portra 400",
    // (5) cream cotton camisole instead of bare shoulders / bralette, (6)
    // harsh single-source lighting instead of soft fill+rim.
    prompt: `${STYLE_LOCK}

### Subject
An unretouched documentary photograph of a Black woman in her early thirties with mahogany skin (Monk Skin Tone 8) and warm golden undertones. Natural matte skin with visible pores, fine lines around her eyes, subtle uneven pigmentation, faint darker patches on her forehead, and a few small natural blemishes on her cheek. No beauty retouching, no airbrushing, no artificial glow. Shoulder-length mature locs with natural thickness variation, some looser flyaway strands near her temples, individual loc definition clearly visible. She wears a simple soft cream cotton camisole with thin straps covering her shoulders. She stands at a bathroom vanity, working a small amount of golden hair oil along one loc near her temple with her fingertips, her other hand resting loosely on the counter. Her eyes focused calmly on her own reflection in the mirror. A real moment, not a pose.

### Setting
A lived-in minimalist bathroom. Warm wooden vanity with visible grain and a few subtle scratches from everyday use. A large wall mirror with a slim brass frame. On the counter: a small amber glass jar of shea butter with the lid off, a wooden wide-tooth comb, a folded silk headscarf, a half-used bottle of moisturiser. A small side window to the right of frame casting direct morning sunlight.

### Lighting
- **Primary light:** Direct warm morning sunlight streaming through the side window on the right as the ONLY light source in the scene. Harsh single-source lighting at roughly 60° to the subject from camera-right, approximately 3500K color temperature.
- **Shadow behavior:** Sharp shadow edges on the left side of her face, cheek, and along the vanity. Some parts of the scene in genuine natural shadow with minimal detail — realistic contrast, not filled in by soft bounce or fill lights. This is NOT a three-point studio setup.
- **No fill light, no bounce cards, no diffusion, no rim light.** The shadows should be real and slightly deep, the way morning light actually behaves in a real bathroom.
- **Mood:** Quiet, private, unposed — the kind of moment a friend might glimpse if they walked past.

### Camera
Shot on a mid-range full-frame DSLR with a 50mm f/2.8 lens, natural white balance, SOOC (straight out of camera) look — no color grading, no post-processing, no beauty retouching. Visible 35mm film grain across the whole image. Slight natural lens vignetting at the corners. Medium shot from a slightly off-centre side angle, capturing her from mid-chest up with her hands, face reflected in the mirror, and some of the bathroom counter in frame.

### Materials & Physics
- **Skin surface:** Real human skin with visible pores, faint veins at the temples, subtle color variation across the face (slightly warmer ears, cooler under-eyes, natural uneven pigmentation), fine lines, small blemishes, and no artificial sheen. Matte natural appearance.
- **Locs:** Authentic texture with natural variation in thickness and tone, individual loc definition, loose flyaway strands, the oiled loc near her temple slightly darker and slightly heavier than the dry locs around it.
- **Cream cotton camisole:** Matte soft cotton fabric with visible weave texture, natural drape, no sheen.
- **Wooden vanity:** Visible grain, small everyday wear marks, matte finish.
- **Glass oil jar:** Amber glass with warm light passing through it, a single defined but not glowing highlight.
- **Mirror:** Clean reflective surface with accurate reflection, no extra sparkle.

### Output
Aspect ratio 16:9 landscape matching the uploaded reference image, approximately 2K resolution (1920×1080 equivalent). NO color grading. NO cinematic look. NO magazine-quality polish. Straight out of camera, mid-range DSLR, documentary style, 35mm film grain visible, photo-journalism aesthetic. Think: a friend's photo of a quiet morning moment, not a beauty campaign.

### Critical requirements (maintain all)
- Natural matte skin with visible pores, fine lines, small blemishes, uneven pigmentation preserved — NOT airbrushed
- No artificial beauty-retouching glow or sheen on skin
- Authentic loc texture with natural irregularity and some loose strands — no synthetic uniformity
- Anatomically correct hands with exactly five fingers each, natural finger positioning
- Harsh realistic single-source window lighting with real shadow falloff — NOT three-point studio softness
- Dignified documentary representation — a real private moment, not a commercial beauty shot
- 16:9 landscape composition with subject comfortably framed, no cropping of head or hands
- Visible 35mm film grain across the whole image
- Shoulders fully covered by cream cotton camisole straps — no bare shoulders, no bralette
- NOT: airbrushed, retouched, cinematic, editorial fashion, magazine cover, glossy, polished, Kodak Portra, beauty campaign aesthetic`,
  },
  {
    id: 'barbershop-fade',
    filename: 'hero-05-barbershop-fade.png',
    title: 'The Fade Moment',
    prompt: `${STYLE_LOCK}

### Subject
Two Black men, unretouched documentary photograph of a real barbershop moment, photo-journalism style. **The barber:** a master craftsman in his forties, bronze skin tone matching MST 7 with neutral-warm undertone, his own short fade haircut, full short beard, wearing a fitted black barber smock. His expression is one of focused precision. **The client:** a young man in his early twenties, deep mahogany skin tone matching MST 8 with warm undertone, mid-fade haircut in progress — crisp taper transitioning from skin on the sides up to longer defined 4b coils on top. His head is tilted slightly forward, eyes calm and focused straight ahead, chin draped with a black barber cape. The barber's steady hands hold cordless clippers, running them up the side of the client's head creating a razor-sharp line.

### Setting
A classic Black-owned barbershop interior. Mirror-lined wall behind the chair reflecting the scene. Open wooden shelves on the wall holding clippers, trimmers, small bottles of beard oil and aftershave, a barber's brush, and a few neatly folded towels. A black leather barber chair. A rolled towel on the counter. Soft-focus background showing a second empty barber chair and framed photographs on the wall. A small practical desk lamp on the counter.

### Lighting
- **Primary light:** Warm overhead tungsten shop lights (approximately 3200K color temperature) from above and slightly in front of the client, bouncing off the mirror wall to create a natural key-fill-backlight setup — defining the precision of the haircut without harsh shadows.
- **Secondary fill:** Warm bounce light from the mirror wall behind the chair, providing even fill on the shaded side of both men's faces at approximately 45% intensity.
- **Backlight/rim:** Subtle rim light from an adjacent shop fixture catching the tops of both men's shoulders, separating them from the background.
- **Shadow behavior:** Clean directional shadows falling softly — defined enough to show form, soft enough to preserve all skin and hair detail. Full shadow detail in both bronze and mahogany skin tones.
- **Specular highlights:** Defined highlight on the metal body of the cordless clippers showing the overhead light. Subtle highlight on the leather barber chair. Gentle catch-lights in both men's eyes. Warm highlight on the well-groomed coils at the top of the client's head.
- **Color temperature:** Overall warm tungsten cast around 3200–3500K.
- **Mood:** Focused, reverent, proud — the barbershop as sanctuary and the barber as craftsman.

### Camera
Shot on a mid-range DSLR with a 50mm f/2.8 lens, natural white balance, SOOC (straight out of camera) look. Visible 35mm film grain, slight natural lens vignetting. Side profile medium shot of both figures, camera at approximately the client's eye level. The barber and his clippers in focus, the client's profile softly in frame, the scene loosely composed through or beside the large mirror wall behind the chair for depth. Rule-of-thirds composition.

### Materials & Physics
- **Skin surface:** Natural texture with visible pores on both men, warm subsurface scattering in the tungsten light, the client's fresh-cut hairline showing authentic skin detail.
- **Hair:** The client's sharp fade transition from skin to longer 4b coils with realistic individual strand definition on top. The barber's close fade and beard with accurate texture. No synthetic smoothness.
- **Metal clippers:** Defined specular reflection of the shop light on the polished metal body, matte black handle.
- **Black barber smock and cape:** Matte fabric absorbing most light, subtle fold detail.
- **Mirror wall:** Accurate reflection of the opposite side of the shop, slight warm cast.
- **Leather barber chair:** Subtle sheen on the worn leather surface.

### Output
Aspect ratio 16:9 landscape matching the uploaded reference image, approximately 2K resolution (1920×1080 equivalent). NO color grading. NO cinematic look. NO magazine-quality polish. Straight out of camera, mid-range DSLR, documentary style, 35mm film grain visible, photo-journalism aesthetic matching IMAGE 1.

${SHARED_CONSTRAINTS}`,
  },
  {
    id: 'dad-braids',
    filename: 'hero-06-dad-braids.png',
    title: "Dad's Saturday Hair Day",
    prompt: `${STYLE_LOCK}

### Subject
An unretouched documentary photograph of a Black father and his young daughter on a Saturday morning, photo-journalism style, no beauty retouching. **Father:** mid-thirties, mahogany skin (MST 8) with warm undertone and visible pores, fine lines, small natural skin texture — NOT airbrushed. Short natural cut, clean-shaven or light stubble, wearing a plain grey cotton t-shirt and joggers. **Daughter:** approximately six years old, matching MST 8 mahogany skin with real natural skin texture and no polish. 4c natural hair half-sectioned into two springy puffs on top, the lower sections being parted and prepared. She wears pink flannel pyjamas. The father sits on the edge of a low sofa, his daughter sitting on a small floor cushion between his knees. His large hands carefully part her hair with a wide-tooth comb, creating a clean section, his face set in focused concentration. The daughter has one hand reaching back in curiosity to touch a bottle of hair oil on the sofa beside him. Small colourful elastics in bright pinks and yellows are scattered on the sofa cushion.

### Setting
A warm cozy living room on a Saturday morning. The sofa is soft oatmeal fabric. A small wicker basket on the floor beside them containing: a plastic spray bottle with water, a small jar of shea butter, a clear amber-glass dropper bottle of hair oil, a tub of edge control, a wide-tooth comb. A ceramic mug of coffee on a side table. A large undressed window on the left letting in soft morning light. Hardwood floors and a patterned rug.

### Lighting
- **Primary light:** Soft natural morning daylight (approximately 5200K at source, warmed by the room's warm palette to around 4400K in the scene) streaming through the large left window as a broad diffused key light, at roughly 50° to the subjects.
- **Secondary fill:** Warm bounce light from a cream-painted living room wall on the right at approximately 40% intensity, softly filling shadows on both subjects' faces.
- **Backlight/rim:** Subtle rim light catching the edges of the daughter's puffs and the top of the father's shoulder, separating them gently from the background.
- **Shadow behavior:** Soft graduated shadows falling to the right across the sofa. Full shadow detail preserved in both mahogany skin tones.
- **Specular highlights:** Catch-lights in both subjects' eyes. Gentle highlight on the dropper bottle of hair oil where morning light catches the glass. Soft highlight on the father's forearms where the window light hits.
- **Color temperature:** Warm morning daylight at around 4200–4400K.
- **Mood:** Tender, slightly uncertain but deeply committed, unhurried — genuine connection over perfection. Saturday morning family rhythm.

### Camera
Shot on 50mm lens at f/2.2. Wide shot from the side at approximately the daughter's eye level, capturing both figures with the father's hands and the daughter's face in focus. Rule-of-thirds composition with the daughter's face in the center-left and the father's focused expression in the upper-right. Living room background softly blurred.

### Materials & Physics
- **Skin surface:** Natural texture with visible pores on both father and daughter, warm subsurface scattering in the morning window light, authentic micro-imperfections preserved.
- **Hair:** The daughter's 4c texture on the two finished puffs showing natural springy irregularity and individual coil definition, the loose sections showing authentic texture being newly parted. The father's short natural cut with realistic texture. No synthetic smoothness.
- **Cotton t-shirt, joggers, flannel pyjamas:** Matte fabric with natural drape and visible texture.
- **Oatmeal sofa fabric and patterned rug:** Visible weave texture, subtle light absorption.
- **Wicker basket:** Woven texture catching the sidelight, warm shadow detail in the gaps.
- **Glass hair oil bottle:** Warm amber refraction where morning light passes through.
- **Plastic spray bottle and shea butter jar:** Subtle specular highlights.

### Output
Aspect ratio 16:9 landscape matching the uploaded reference image, approximately 2K resolution (1920×1080 equivalent). NO color grading. NO cinematic look. NO magazine-quality polish. Straight out of camera, mid-range DSLR, documentary style, 35mm film grain visible, photo-journalism aesthetic matching IMAGE 1.

${SHARED_CONSTRAINTS}`,
  },
];

// ─── Aspect anchor PNG ──────────────────────────────────────────────────────

/**
 * Create a blank warm-cream 1920x1080 PNG used purely as a 16:9 aspect-ratio
 * anchor for Scene 1's generation (since @ai-sdk/google doesn't expose
 * imageConfig.aspectRatio cleanly as of SDK v3.0.6).
 */
async function createAspectAnchor(): Promise<Buffer> {
  return sharp({
    create: {
      width: HERO_WIDTH,
      height: HERO_HEIGHT,
      channels: 3,
      background: { r: 245, g: 235, b: 220 }, // warm cream
    },
  })
    .png()
    .toBuffer();
}

// ─── Generation ─────────────────────────────────────────────────────────────

interface GenerationAttempt {
  buffer: Buffer;
  attempt: number;
}

async function generateScene(
  scene: HeroScene,
  referenceImage: Buffer,
  referenceLabel: string,
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = [
    { type: 'image', image: referenceImage },
    { type: 'text', text: referenceLabel },
    { type: 'text', text: scene.prompt },
  ];

  const result = await generateText({
    model: geminiImage,
    messages: [{ role: 'user', content }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageFile = result.files?.find((f: any) =>
    (f.mediaType || f.mimeType)?.startsWith('image/'),
  );

  if (!imageFile) {
    throw new Error(`Gemini did not return an image for scene ${scene.id}`);
  }

  // Resize to exact 1920x1080 (Gemini may return slightly different dimensions)
  return sharp(Buffer.from(imageFile.uint8Array))
    .resize(HERO_WIDTH, HERO_HEIGHT, { fit: 'cover', position: 'center' })
    .png({ quality: 95 })
    .toBuffer();
}

// ─── Claude Representation Judge ────────────────────────────────────────────

type Verdict = 'PASS' | 'REDO';

const judgeSchema = z.object({
  skinToneAccuracy: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = deep rich skin tone matching MST target with preserved shadow detail. 1 = clearly lightened, flat, or incorrect tone.',
    ),
  hairTextureAuthenticity: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = authentic natural Black hair texture with individual strand/coil definition. 1 = synthetic, plasticky, or stereotyped rendering.',
    ),
  anatomyCorrectness: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = anatomically perfect hands, faces, proportions. 1 = extra fingers, distorted hands, or warped features.',
    ),
  plasticFreeSkin: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = natural skin texture with visible pores and authentic micro-variation. 1 = obviously airbrushed plastic waxy AI skin.',
    ),
  dignifiedRepresentation: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = dignified, warm, editorial representation grounded in authentic Black cultural context. 1 = stereotypical, exoticized, or undignified.',
    ),
  feedback: z.string().describe('Brief feedback on what to fix if REDO.'),
});

interface JudgeResult {
  verdict: Verdict;
  scores: Omit<z.infer<typeof judgeSchema>, 'feedback'>;
  feedback: string;
}

async function judgeScene(
  generatedImage: Buffer,
  scene: HeroScene,
): Promise<JudgeResult> {
  const result = await generateObject({
    model: claude,
    schema: judgeSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: generatedImage },
          {
            type: 'text',
            text: `You are a representation-focused creative director reviewing an unretouched documentary hero image for Auntie Marlene's, a Black-owned afro hair and beauty e-commerce brand. The aesthetic is photo-journalism / SOOC (straight out of camera) — NOT cinematic, NOT editorial fashion, NOT magazine cover polish. A slightly gritty, realistic, friend-took-this-photo look is CORRECT and should score HIGH.

Scene: "${scene.title}"

Evaluate the image on five 1-5 axes. Be strict — this is for a homepage hero that will be seen by thousands of Black women and families who deserve accurate, dignified representation. Any of the following forces a low score:

- Skin tone lightened compared to the prompt's MST target
- Flat or crushed rendering of darker skin (no dimensional detail preserved)
- Synthetic, uniform, plasticky hair texture lacking individual strand/coil definition
- Any anatomical error in hands (extra fingers, missing fingers, warped positioning)
- Airbrushed waxy plastic skin without visible pores or micro-variation
- Any hint of stereotyping or undignified representation

Verdict rule: if any axis scores below 4, the verdict is REDO. Return detailed feedback explaining what went wrong so the prompt can be corrected on retry. If all axes are 4 or 5, return concise positive feedback.`,
          },
        ],
      },
    ],
  });

  const scores = {
    skinToneAccuracy: result.object.skinToneAccuracy,
    hairTextureAuthenticity: result.object.hairTextureAuthenticity,
    anatomyCorrectness: result.object.anatomyCorrectness,
    plasticFreeSkin: result.object.plasticFreeSkin,
    dignifiedRepresentation: result.object.dignifiedRepresentation,
  };

  const minScore = Math.min(...Object.values(scores));
  const verdict: Verdict = minScore >= 4 ? 'PASS' : 'REDO';

  return {
    verdict,
    scores,
    feedback: result.object.feedback,
  };
}

// ─── Orchestration ──────────────────────────────────────────────────────────

async function generateWithJudge(
  scene: HeroScene,
  referenceImage: Buffer,
  referenceLabel: string,
): Promise<Buffer> {
  let bestAttempt: GenerationAttempt | null = null;
  let lastFeedback = '';

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    console.log(
      `[Hero] ${scene.filename} — attempt ${attempt}/${MAX_RETRIES + 1}...`,
    );

    try {
      const buffer = await generateScene(scene, referenceImage, referenceLabel);
      console.log(`[Hero] ${scene.filename} — generated, judging...`);

      const judgment = await judgeScene(buffer, scene);
      console.log(
        `[Hero] ${scene.filename} — ${judgment.verdict} — scores:`,
        judgment.scores,
      );
      if (judgment.feedback) {
        console.log(
          `[Hero] ${scene.filename} — feedback: ${judgment.feedback}`,
        );
      }

      if (judgment.verdict === 'PASS') {
        return buffer;
      }

      // REDO — keep as fallback if this is our best attempt so far
      bestAttempt = { buffer, attempt };
      lastFeedback = judgment.feedback;
    } catch (err) {
      console.error(
        `[Hero] ${scene.filename} — attempt ${attempt} failed:`,
        err,
      );
    }
  }

  if (bestAttempt) {
    console.warn(
      `[Hero] ${scene.filename} — all attempts REDO, using best attempt (#${bestAttempt.attempt}). Last feedback: ${lastFeedback}`,
    );
    return bestAttempt.buffer;
  }

  throw new Error(
    `[Hero] ${scene.filename} — failed all attempts with no output`,
  );
}

export interface GenerateHeroOptions {
  /**
   * Restrict generation to specific scenes. Accepts scene IDs (e.g. "bonnet")
   * or 1-based indices as strings (e.g. "1"). If omitted, generates all 6.
   * Scene 1 (bonnet) is always generated first when included, since it acts
   * as the style reference for later scenes in a full run.
   */
  only?: string[];
}

function resolveScenes(only?: string[]): HeroScene[] {
  if (!only || only.length === 0) return HERO_SCENES;

  const resolved: HeroScene[] = [];
  for (const token of only) {
    const asIndex = Number.parseInt(token, 10);
    const match = Number.isFinite(asIndex)
      ? HERO_SCENES[asIndex - 1]
      : HERO_SCENES.find((s) => s.id === token);
    if (!match) {
      throw new Error(
        `[Hero] Unknown scene "${token}". Valid IDs: ${HERO_SCENES.map((s) => s.id).join(', ')}`,
      );
    }
    if (!resolved.includes(match)) resolved.push(match);
  }
  return resolved;
}

export async function generateAllHeroImages(
  options: GenerateHeroOptions = {},
): Promise<void> {
  await fs.mkdir(HERO_OUTPUT_DIR, { recursive: true });
  console.log(`[Hero] Output directory: ${HERO_OUTPUT_DIR}`);

  const targets = resolveScenes(options.only);
  console.log(
    `[Hero] Generating ${targets.length} scene(s): ${targets.map((s) => s.id).join(', ')}`,
  );

  const scene1 = HERO_SCENES[0];
  const scene1Path = path.join(HERO_OUTPUT_DIR, scene1.filename);
  const targetsIncludeScene1 = targets.some((s) => s.id === scene1.id);

  // Scene 1 is the tonal anchor. If we're generating it (or any later scene
  // that needs it as a style reference) and it's not already on disk, we
  // need to generate it first.
  let scene1Buffer: Buffer | null = null;

  if (targetsIncludeScene1) {
    console.log(`\n[Hero] ═══ ${scene1.title} ═══`);
    const aspectAnchor = await createAspectAnchor();
    scene1Buffer = await generateWithJudge(
      scene1,
      aspectAnchor,
      'IMAGE 1: This is a 16:9 landscape aspect-ratio reference canvas only — do not copy its content (it is a blank warm cream canvas). Match only its 16:9 landscape aspect ratio in your output.',
    );
    await fs.writeFile(scene1Path, scene1Buffer);
    console.log(`[Hero] ✓ Saved ${scene1Path}`);
  }

  // Scenes 2-6: use Scene 1 as style/color/mood reference
  const laterTargets = targets.filter((s) => s.id !== scene1.id);
  if (laterTargets.length > 0) {
    if (!scene1Buffer) {
      // Load existing Scene 1 from disk to use as style reference
      try {
        scene1Buffer = await fs.readFile(scene1Path);
        console.log(
          `[Hero] Loaded existing ${scene1.filename} as style reference`,
        );
      } catch {
        throw new Error(
          `[Hero] Cannot generate later scenes without ${scene1.filename}. Run with --only=bonnet first or include it in your selection.`,
        );
      }
    }

    for (const scene of laterTargets) {
      console.log(`\n[Hero] ═══ ${scene.title} ═══`);
      const buffer = await generateWithJudge(
        scene,
        scene1Buffer,
        'IMAGE 1: This is the brand style reference from the same documentary photo-journalism set — match its warm natural lighting tone, shadow depth, unretouched skin texture, film grain, and 16:9 landscape aspect ratio. This is a raw SOOC (straight out of camera) documentary style, NOT a cinematic or editorial fashion look. DO NOT copy its subject or composition — generate the completely different scene described in the prompt below.',
      );

      const outPath = path.join(HERO_OUTPUT_DIR, scene.filename);
      await fs.writeFile(outPath, buffer);
      console.log(`[Hero] ✓ Saved ${outPath}`);
    }
  }

  console.log(`\n[Hero] ✅ ${targets.length} scene(s) generated.`);
}
