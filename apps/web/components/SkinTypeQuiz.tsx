'use client';

import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faDroplet,
  faFaceSmile,
  faFlask,
  faRotateLeft,
  faShieldHalved,
  faSparkles,
  faSun,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { TRACKING_EVENTS } from '@/constants/events';
import { useAnalytics } from '@/utils/analytics-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SkinType = 'oily' | 'dry' | 'normal' | 'combination';
type HydrationLevel =
  | 'severely-dehydrated'
  | 'dehydrated'
  | 'mildly-dehydrated'
  | 'well-hydrated';
type Sensitivity = 'high' | 'moderate' | 'low';
type PIHTendency = 'high' | 'moderate' | 'low' | 'none';
type PrimaryConcern =
  | 'dark-spots'
  | 'oil-breakouts'
  | 'hydration'
  | 'anti-ageing'
  | 'sensitivity';
type SPFHabit = 'daily' | 'sunny-only' | 'rarely' | 'want-to';

interface QuizState {
  step: number;
  skinType: SkinType | null;
  hydration: HydrationLevel | null;
  sensitivity: Sensitivity | null;
  pih: PIHTendency | null;
  concern: PrimaryConcern | null;
  spf: SPFHabit | null;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SKIN_TYPE_OPTIONS: {
  value: SkinType;
  title: string;
  description: string;
}[] = [
  {
    value: 'oily',
    title: 'Shiny and slick',
    description: 'Oily quickly — my face feels greasy within 30 minutes',
  },
  {
    value: 'dry',
    title: 'Tight, dry, uncomfortable',
    description: 'My skin feels parched and sometimes flaky',
  },
  {
    value: 'normal',
    title: 'Comfortable, balanced',
    description: 'My skin feels fine — not too oily, not too dry',
  },
  {
    value: 'combination',
    title: 'Oily in some areas, tight in others',
    description: 'My T-zone gets oily but my cheeks feel dry',
  },
];

const HYDRATION_OPTIONS: {
  value: HydrationLevel;
  title: string;
  description: string;
}[] = [
  {
    value: 'severely-dehydrated',
    title: 'Constantly — hard to get a glow',
    description:
      'No matter what I do, my skin looks grey and chalky all the time',
  },
  {
    value: 'dehydrated',
    title: 'Often, especially cheeks and around mouth',
    description: 'I notice ashiness in certain areas throughout the day',
  },
  {
    value: 'mildly-dehydrated',
    title: "Occasionally when I haven't been drinking water",
    description: 'It happens sometimes but usually clears up on its own',
  },
  {
    value: 'well-hydrated',
    title: 'Rarely or never',
    description: 'My skin stays moisturised and has a natural glow',
  },
];

const SENSITIVITY_OPTIONS: {
  value: Sensitivity;
  title: string;
  description: string;
}[] = [
  {
    value: 'high',
    title: 'Frequently stings, burns, or gets irritated',
    description: 'Most new products cause a reaction on my skin',
  },
  {
    value: 'moderate',
    title: 'Sometimes reacts to strong ingredients',
    description: 'Certain actives or fragrances can cause irritation',
  },
  {
    value: 'low',
    title: 'Rarely bothered by anything',
    description: 'I can try most products without any issues',
  },
];

const PIH_OPTIONS: {
  value: PIHTendency;
  title: string;
  description: string;
}[] = [
  {
    value: 'high',
    title: "Yes, it's my biggest skin concern",
    description: 'Dark spots and uneven tone are constantly on my mind',
  },
  {
    value: 'moderate',
    title: 'Some dark marks that take months to fade',
    description: 'I get marks after breakouts that linger for a while',
  },
  {
    value: 'low',
    title: 'Minimal marks that fade quickly',
    description: 'Occasional marks but they clear up within weeks',
  },
  {
    value: 'none',
    title: 'My tone is very even',
    description: "I don't really experience dark spots or uneven tone",
  },
];

const CONCERN_OPTIONS: {
  value: PrimaryConcern;
  title: string;
  description: string;
}[] = [
  {
    value: 'dark-spots',
    title: 'Even out skin tone / fade dark spots',
    description: 'I want brighter, more uniform skin',
  },
  {
    value: 'oil-breakouts',
    title: 'Control oil and breakouts',
    description: 'I want clearer, less congested skin',
  },
  {
    value: 'hydration',
    title: 'Hydrate and reduce ashiness',
    description: 'I want dewy, moisturised skin that glows',
  },
  {
    value: 'anti-ageing',
    title: 'Anti-ageing and firmness',
    description: 'I want to prevent or reduce fine lines and sagging',
  },
  {
    value: 'sensitivity',
    title: 'Calm sensitive, reactive skin',
    description: 'I want to soothe irritation and strengthen my skin barrier',
  },
];

const SPF_OPTIONS: {
  value: SPFHabit;
  title: string;
  description: string;
}[] = [
  {
    value: 'daily',
    title: 'Daily, rain or shine',
    description: 'SPF is a non-negotiable part of my routine',
  },
  {
    value: 'sunny-only',
    title: 'Only on sunny days',
    description: 'I wear it when I know I will be in the sun',
  },
  {
    value: 'rarely',
    title: "Rarely — I don't think I need it",
    description: "I haven't felt the need for sunscreen",
  },
  {
    value: 'want-to',
    title: "I want to but haven't found one that works for my skin tone",
    description: 'Most sunscreens leave a white or purple cast on my skin',
  },
];

// ---------------------------------------------------------------------------
// Result labels
// ---------------------------------------------------------------------------

const SKIN_TYPE_NAMES: Record<SkinType, string> = {
  oily: 'Oily',
  dry: 'Dry',
  normal: 'Normal',
  combination: 'Combination',
};

const SKIN_TYPE_DESCRIPTIONS: Record<SkinType, string> = {
  oily: 'Your skin produces excess sebum, especially in the T-zone. You may be prone to enlarged pores and breakouts, but the upside is oily skin tends to age slower.',
  dry: 'Your skin lacks natural oils and can feel tight or flaky. It needs rich, nourishing products to maintain its barrier and keep it comfortable.',
  normal:
    'Your skin is well-balanced with minimal issues. It produces a healthy amount of oil and retains moisture well.',
  combination:
    'Your skin has an oily T-zone but drier cheeks. You benefit from a targeted approach — lighter products on oily areas, richer ones on dry patches.',
};

const HYDRATION_NAMES: Record<HydrationLevel, string> = {
  'severely-dehydrated': 'Severely Dehydrated',
  dehydrated: 'Dehydrated',
  'mildly-dehydrated': 'Mildly Dehydrated',
  'well-hydrated': 'Well Hydrated',
};

const SENSITIVITY_NAMES: Record<Sensitivity, string> = {
  high: 'High Sensitivity',
  moderate: 'Moderate Sensitivity',
  low: 'Low Sensitivity',
};

const PIH_NAMES: Record<PIHTendency, string> = {
  high: 'High PIH Tendency',
  moderate: 'Moderate PIH',
  low: 'Low PIH',
  none: 'No PIH',
};

// ---------------------------------------------------------------------------
// Tips & recommendations
// ---------------------------------------------------------------------------

function getTips(
  skinType: SkinType,
  hydration: HydrationLevel,
  sensitivity: Sensitivity,
  pih: PIHTendency,
  concern: PrimaryConcern,
  spf: SPFHabit,
): string[] {
  const tips: string[] = [];

  // PIH-specific tips (melanin-rich skin focus)
  if (pih === 'high' || pih === 'moderate') {
    tips.push(
      'Your melanin-rich skin is prone to post-inflammatory hyperpigmentation. Always use SPF — yes, even on cloudy days — to prevent dark spots from getting darker.',
    );
    tips.push(
      'Look for brightening ingredients like niacinamide (vitamin B3), vitamin C, alpha arbutin, and liquorice root extract to help fade dark marks over time.',
    );
  }

  // SPF myth-buster
  if (spf === 'rarely') {
    tips.push(
      'Dark skin can still be damaged by UV. SPF prevents dark spots from getting darker, protects against premature ageing, and reduces your risk of skin cancer. Look for mineral sunscreens with tinted formulas to avoid white cast.',
    );
  }

  // SPF cast tip
  if (spf === 'want-to') {
    tips.push(
      'Look for tinted mineral sunscreens or chemical sunscreens with newer UV filters — they absorb without leaving a white or purple cast. Brands formulated for deeper skin tones are your best bet.',
    );
  }

  // Hydration tips
  if (hydration === 'severely-dehydrated' || hydration === 'dehydrated') {
    tips.push(
      'Layer hydration: apply a hyaluronic acid serum to damp skin, then seal with a moisturiser containing shea butter or squalane to lock moisture in and banish ashiness.',
    );
    tips.push(
      'Drink plenty of water and consider adding a hydrating toner or essence to your routine for an extra layer of moisture.',
    );
  }

  // Skin type tips
  if (skinType === 'oily') {
    tips.push(
      'Use a gentle, foaming cleanser with salicylic acid to control oil without stripping your skin. Avoid heavy creams — opt for gel or water-based moisturisers instead.',
    );
  } else if (skinType === 'dry') {
    tips.push(
      'Use a cream-based cleanser and follow with a rich moisturiser containing ceramides. Apply products to damp skin to maximise hydration.',
    );
  } else if (skinType === 'combination') {
    tips.push(
      'Multi-mask your routine: use a clay-based treatment on oily areas and a hydrating mask on dry patches. A lightweight gel moisturiser works well for your T-zone.',
    );
  } else {
    tips.push(
      'Your balanced skin does well with a gentle cleanser and a medium-weight moisturiser. Focus on maintaining your healthy barrier with antioxidants.',
    );
  }

  // Sensitivity tips
  if (sensitivity === 'high') {
    tips.push(
      'Introduce new products one at a time and wait 2 weeks between additions. Look for fragrance-free, minimal-ingredient formulas with centella asiatica or colloidal oatmeal.',
    );
  }

  // Concern-specific tips
  if (concern === 'anti-ageing') {
    tips.push(
      'Start with a retinol (vitamin A) product at low concentration, using it 2-3 times per week. Always follow with SPF the next morning — retinol makes skin more sun-sensitive.',
    );
  }

  if (concern === 'oil-breakouts' && skinType !== 'oily') {
    tips.push(
      'Use a BHA (salicylic acid) exfoliant 2-3 times weekly to unclog pores. A niacinamide serum can help regulate oil production and minimise pore appearance.',
    );
  }

  return tips.slice(0, 5);
}

interface IngredientRec {
  ingredient: string;
  reason: string;
}

function getIngredientRecommendations(
  skinType: SkinType,
  hydration: HydrationLevel,
  pih: PIHTendency,
  concern: PrimaryConcern,
  sensitivity: Sensitivity,
): IngredientRec[] {
  const recs: IngredientRec[] = [];

  if (pih === 'high' || pih === 'moderate' || concern === 'dark-spots') {
    recs.push({
      ingredient: 'Niacinamide (Vitamin B3)',
      reason: 'Fades dark spots, evens skin tone, regulates oil',
    });
    recs.push({
      ingredient: 'Vitamin C',
      reason: 'Brightens skin and protects against free radicals',
    });
    recs.push({
      ingredient: 'Alpha Arbutin',
      reason: 'Gentle skin lightener that targets hyperpigmentation',
    });
  }

  if (
    hydration === 'severely-dehydrated' ||
    hydration === 'dehydrated' ||
    concern === 'hydration'
  ) {
    recs.push({
      ingredient: 'Hyaluronic Acid',
      reason: 'Draws moisture into skin for deep hydration',
    });
    recs.push({
      ingredient: 'Shea Butter',
      reason: 'Rich emollient that locks in moisture and soothes',
    });
  }

  if (skinType === 'oily' || concern === 'oil-breakouts') {
    recs.push({
      ingredient: 'Salicylic Acid (BHA)',
      reason: 'Unclogs pores and reduces breakouts',
    });
    recs.push({
      ingredient: 'Niacinamide',
      reason: 'Regulates sebum production and minimises pores',
    });
  }

  if (skinType === 'dry') {
    recs.push({
      ingredient: 'Ceramides',
      reason: 'Restores and strengthens the skin barrier',
    });
    recs.push({
      ingredient: 'Squalane',
      reason: 'Lightweight oil that deeply moisturises without clogging pores',
    });
  }

  if (sensitivity === 'high' || concern === 'sensitivity') {
    recs.push({
      ingredient: 'Centella Asiatica (Cica)',
      reason: 'Calms irritation and promotes skin healing',
    });
    recs.push({
      ingredient: 'Colloidal Oatmeal',
      reason: 'Soothes sensitive, reactive skin naturally',
    });
  }

  if (concern === 'anti-ageing') {
    recs.push({
      ingredient: 'Retinol (Vitamin A)',
      reason: 'Boosts collagen production and reduces fine lines',
    });
    recs.push({
      ingredient: 'Peptides',
      reason: 'Firms skin and supports elasticity',
    });
  }

  // Deduplicate by ingredient name
  const seen = new Set<string>();
  return recs
    .filter((r) => {
      if (seen.has(r.ingredient)) return false;
      seen.add(r.ingredient);
      return true;
    })
    .slice(0, 5);
}

interface ProductRec {
  label: string;
  href: string;
}

function getProductRecommendations(
  skinType: SkinType,
  concern: PrimaryConcern,
): ProductRec[] {
  const recs: ProductRec[] = [];

  // Always recommend skincare
  recs.push({ label: 'Skincare', href: '/skin-care' });

  if (concern === 'dark-spots' || concern === 'anti-ageing') {
    recs.push({ label: 'Serums & Treatments', href: '/skin-care' });
  }

  if (skinType === 'oily' || concern === 'oil-breakouts') {
    recs.push({ label: 'Cleansers', href: '/skin-care' });
  }

  if (skinType === 'dry' || concern === 'hydration') {
    recs.push({ label: 'Moisturisers & Oils', href: '/skin-care' });
  }

  if (concern === 'sensitivity') {
    recs.push({ label: 'Gentle Skincare', href: '/skin-care' });
  }

  recs.push({ label: 'SPF & Sun Protection', href: '/skin-care' });
  recs.push({ label: 'Body Care', href: '/skin-care' });

  // Deduplicate and limit
  const seen = new Set<string>();
  return recs
    .filter((r) => {
      if (seen.has(r.label)) return false;
      seen.add(r.label);
      return true;
    })
    .slice(0, 4);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 6;

function ProgressBar({ step }: { step: number }) {
  const progress = Math.min((step / TOTAL_STEPS) * 100, 100);

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm font-inter text-cocoa/60 mb-2">
        <span>
          Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-cocoa/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-terracotta transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function OptionCard<T extends string>({
  value,
  title,
  description,
  selected,
  onSelect,
}: {
  value: T;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (v: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="w-full text-left"
    >
      <div
        className={`
          relative rounded-2xl border-2 p-5 sm:p-6 cursor-pointer
          transition-all duration-300 ease-out
          ${
            selected
              ? 'border-terracotta bg-terracotta/5 shadow-md shadow-terracotta/10'
              : 'border-cocoa/10 bg-white hover:border-terracotta/40 hover:shadow-sm'
          }
        `}
      >
        {selected && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-terracotta flex items-center justify-center">
            <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
          </div>
        )}
        <h3 className="text-lg font-playfair font-bold text-cocoa mb-1">
          {title}
        </h3>
        <p className="text-sm font-inter text-cocoa/60 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SkinTypeQuiz() {
  const { track } = useAnalytics();
  const [state, setState] = useState<QuizState>({
    step: 1,
    skinType: null,
    hydration: null,
    sensitivity: null,
    pih: null,
    concern: null,
    spf: null,
  });

  useEffect(() => {
    track(TRACKING_EVENTS.QUIZ_STARTED, { quiz_type: 'skin_type' });
  }, [track]);

  const goBack = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step - 1 }));
  }, []);

  const restart = useCallback(() => {
    setState({
      step: 1,
      skinType: null,
      hydration: null,
      sensitivity: null,
      pih: null,
      concern: null,
      spf: null,
    });
  }, []);

  const selectSkinType = useCallback(
    (value: SkinType) => {
      setState((prev) => ({ ...prev, skinType: value }));
      track(TRACKING_EVENTS.QUIZ_STEP_COMPLETED, {
        quiz_type: 'skin_type',
        step_number: 1,
        step_name: 'skin_type',
        selected_value: value,
      });
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: 2 }));
      }, 300);
    },
    [track],
  );

  const selectHydration = useCallback(
    (value: HydrationLevel) => {
      setState((prev) => ({ ...prev, hydration: value }));
      track(TRACKING_EVENTS.QUIZ_STEP_COMPLETED, {
        quiz_type: 'skin_type',
        step_number: 2,
        step_name: 'hydration',
        selected_value: value,
      });
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: 3 }));
      }, 300);
    },
    [track],
  );

  const selectSensitivity = useCallback(
    (value: Sensitivity) => {
      setState((prev) => ({ ...prev, sensitivity: value }));
      track(TRACKING_EVENTS.QUIZ_STEP_COMPLETED, {
        quiz_type: 'skin_type',
        step_number: 3,
        step_name: 'sensitivity',
        selected_value: value,
      });
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: 4 }));
      }, 300);
    },
    [track],
  );

  const selectPIH = useCallback(
    (value: PIHTendency) => {
      setState((prev) => ({ ...prev, pih: value }));
      track(TRACKING_EVENTS.QUIZ_STEP_COMPLETED, {
        quiz_type: 'skin_type',
        step_number: 4,
        step_name: 'pih_tendency',
        selected_value: value,
      });
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: 5 }));
      }, 300);
    },
    [track],
  );

  const selectConcern = useCallback(
    (value: PrimaryConcern) => {
      setState((prev) => ({ ...prev, concern: value }));
      track(TRACKING_EVENTS.QUIZ_STEP_COMPLETED, {
        quiz_type: 'skin_type',
        step_number: 5,
        step_name: 'primary_concern',
        selected_value: value,
      });
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: 6 }));
      }, 300);
    },
    [track],
  );

  const selectSPF = useCallback(
    (value: SPFHabit) => {
      setState((prev) => ({ ...prev, spf: value }));
      track(TRACKING_EVENTS.QUIZ_STEP_COMPLETED, {
        quiz_type: 'skin_type',
        step_number: 6,
        step_name: 'spf_habits',
        selected_value: value,
      });
      track(TRACKING_EVENTS.QUIZ_COMPLETED, {
        quiz_type: 'skin_type',
        results: {
          skin_type: state.skinType || '',
          hydration: state.hydration || '',
          sensitivity: state.sensitivity || '',
          pih: state.pih || '',
          concern: state.concern || '',
          spf: value,
        },
      });
      setTimeout(() => {
        setState((prev) => ({ ...prev, step: 7 }));
      }, 300);
    },
    [
      track,
      state.skinType,
      state.hydration,
      state.sensitivity,
      state.pih,
      state.concern,
    ],
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={faFaceSmile}
          className="text-terracotta"
          size="lg"
        />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Skin Feel After Cleansing
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        After washing your face, how does your skin feel within 30 minutes?
      </p>
      <div className="grid gap-4">
        {SKIN_TYPE_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.skinType === opt.value}
            onSelect={selectSkinType}
          />
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={faDroplet}
          className="text-terracotta"
          size="lg"
        />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Ashiness &amp; Hydration
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        Does your skin ever look grey, chalky, or &lsquo;ashy&rsquo; even after
        moisturising?
      </p>
      <div className="grid gap-4">
        {HYDRATION_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.hydration === opt.value}
            onSelect={selectHydration}
          />
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon icon={faFlask} className="text-terracotta" size="lg" />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Sensitivity
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        How does your skin react to new products?
      </p>
      <div className="grid gap-4">
        {SENSITIVITY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.sensitivity === opt.value}
            onSelect={selectSensitivity}
          />
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon icon={faSun} className="text-terracotta" size="lg" />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Dark Spots &amp; Hyperpigmentation
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        Do you experience dark spots, uneven skin tone, or marks after
        breakouts?
      </p>
      <div className="grid gap-4">
        {PIH_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.pih === opt.value}
            onSelect={selectPIH}
          />
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={faSparkles}
          className="text-terracotta"
          size="lg"
        />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Primary Skin Concern
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        What&rsquo;s your number one skin goal?
      </p>
      <div className="grid gap-4">
        {CONCERN_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.concern === opt.value}
            onSelect={selectConcern}
          />
        ))}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={faShieldHalved}
          className="text-terracotta"
          size="lg"
        />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          SPF Habits
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        How often do you wear sunscreen?
      </p>
      <div className="grid gap-4">
        {SPF_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.spf === opt.value}
            onSelect={selectSPF}
          />
        ))}
      </div>
    </div>
  );

  const renderResults = () => {
    if (
      !state.skinType ||
      !state.hydration ||
      !state.sensitivity ||
      !state.pih ||
      !state.concern ||
      !state.spf
    ) {
      return null;
    }

    const tips = getTips(
      state.skinType,
      state.hydration,
      state.sensitivity,
      state.pih,
      state.concern,
      state.spf,
    );
    const ingredients = getIngredientRecommendations(
      state.skinType,
      state.hydration,
      state.pih,
      state.concern,
      state.sensitivity,
    );
    const recommendations = getProductRecommendations(
      state.skinType,
      state.concern,
    );

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-sage-green/10 text-sage-green font-inter font-semibold text-sm px-4 py-2 rounded-full mb-4">
            <FontAwesomeIcon icon={faSparkles} />
            Your Results Are In
          </div>
          <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-cocoa">
            Your Skin Profile
          </h2>
        </div>

        {/* Skin Type Badge */}
        <div className="bg-white rounded-2xl shadow-md border border-sage-green/20 p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sage-green/10 mb-4">
            <FontAwesomeIcon
              icon={faFaceSmile}
              className="text-sage-green text-4xl"
            />
          </div>
          <h3 className="text-2xl font-playfair font-bold text-cocoa mb-2">
            {SKIN_TYPE_NAMES[state.skinType]} Skin
          </h3>
          <p className="text-cocoa/60 font-inter text-sm leading-relaxed max-w-md mx-auto">
            {SKIN_TYPE_DESCRIPTIONS[state.skinType]}
          </p>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-cocoa/10 p-5 text-center">
            <FontAwesomeIcon
              icon={faDroplet}
              className="text-terracotta mb-2"
              size="lg"
            />
            <p className="text-xs font-inter text-cocoa/50 uppercase tracking-wider mb-1">
              Hydration
            </p>
            <p className="font-playfair font-bold text-cocoa">
              {HYDRATION_NAMES[state.hydration]}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-cocoa/10 p-5 text-center">
            <FontAwesomeIcon
              icon={faFlask}
              className="text-terracotta mb-2"
              size="lg"
            />
            <p className="text-xs font-inter text-cocoa/50 uppercase tracking-wider mb-1">
              Sensitivity
            </p>
            <p className="font-playfair font-bold text-cocoa">
              {SENSITIVITY_NAMES[state.sensitivity]}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-cocoa/10 p-5 text-center">
            <FontAwesomeIcon
              icon={faSun}
              className="text-terracotta mb-2"
              size="lg"
            />
            <p className="text-xs font-inter text-cocoa/50 uppercase tracking-wider mb-1">
              PIH Tendency
            </p>
            <p className="font-playfair font-bold text-cocoa">
              {PIH_NAMES[state.pih]}
            </p>
          </div>
        </div>

        {/* Personalised Tips */}
        <div className="bg-white rounded-2xl shadow-md border border-cocoa/10 p-6 sm:p-8">
          <h3 className="text-xl font-playfair font-bold text-cocoa mb-4">
            Personalised Tips for Your Skin
          </h3>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-sage-green/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-sage-green text-xs"
                  />
                </span>
                <span className="text-cocoa/80 font-inter text-sm leading-relaxed">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ingredient Recommendations */}
        <div className="bg-white rounded-2xl shadow-md border border-cocoa/10 p-6 sm:p-8">
          <h3 className="text-xl font-playfair font-bold text-cocoa mb-4">
            Key Ingredients for You
          </h3>
          <div className="space-y-3">
            {ingredients.map((rec) => (
              <div
                key={rec.ingredient}
                className="flex items-start gap-3 rounded-xl border border-cocoa/10 p-4"
              >
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-terracotta/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faFlask}
                    className="text-terracotta text-xs"
                  />
                </span>
                <div>
                  <p className="font-inter font-semibold text-cocoa text-sm">
                    {rec.ingredient}
                  </p>
                  <p className="font-inter text-cocoa/60 text-xs leading-relaxed">
                    {rec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Recommendations */}
        <div className="bg-white rounded-2xl shadow-md border border-cocoa/10 p-6 sm:p-8">
          <h3 className="text-xl font-playfair font-bold text-cocoa mb-4">
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((rec) => (
              <Link
                key={rec.label}
                href={rec.href}
                className="flex items-center justify-between rounded-xl border border-cocoa/10 p-4 hover:border-terracotta/40 hover:bg-terracotta/5 transition-all duration-200 group"
              >
                <span className="font-inter font-medium text-cocoa text-sm">
                  {rec.label}
                </span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-cocoa/30 group-hover:text-terracotta transition-colors text-sm"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/skin-care"
            className="inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white font-bold font-inter text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Shop Skincare
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center justify-center gap-2 border-2 border-cocoa/20 text-cocoa hover:border-cocoa/40 font-bold font-inter text-base px-8 py-4 rounded-full transition-all duration-300"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  const isResults = state.step === 7;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 md:p-12">
      {/* Title — only show on quiz steps */}
      {!isResults && (
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-cocoa mb-2">
            Find Your Skin Type
          </h1>
          <p className="text-cocoa/50 font-inter text-sm sm:text-base">
            Answer a few questions designed for melanin-rich skin to discover
            your unique skin profile and get personalised recommendations.
          </p>
        </div>
      )}

      {/* Progress bar */}
      {!isResults && <ProgressBar step={state.step} />}

      {/* Back button */}
      {state.step > 1 && !isResults && (
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 text-cocoa/50 hover:text-cocoa font-inter text-sm mb-6 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>
      )}

      {/* Step content */}
      <div className="transition-opacity duration-300">
        {state.step === 1 && renderStep1()}
        {state.step === 2 && renderStep2()}
        {state.step === 3 && renderStep3()}
        {state.step === 4 && renderStep4()}
        {state.step === 5 && renderStep5()}
        {state.step === 6 && renderStep6()}
        {state.step === 7 && renderResults()}
      </div>
    </div>
  );
}
