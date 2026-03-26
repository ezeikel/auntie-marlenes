'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faSparkles,
  faDroplet,
  faLayerGroup,
  faHeadSide,
  faRotateLeft,
} from '@fortawesome/pro-regular-svg-icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HairPattern = '1' | '2' | '3' | '4';
type SubType =
  | '1A'
  | '1B'
  | '1C'
  | '2A'
  | '2B'
  | '2C'
  | '3A'
  | '3B'
  | '3C'
  | '4A'
  | '4B'
  | '4C';
type Porosity = 'low' | 'normal' | 'high';
type Density = 'thin' | 'medium' | 'thick';
type ScalpType = 'oily' | 'normal' | 'dry';

interface QuizState {
  step: number;
  pattern: HairPattern | null;
  subType: SubType | null;
  porosity: Porosity | null;
  density: Density | null;
  scalpType: ScalpType | null;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PATTERN_OPTIONS: {
  value: HairPattern;
  title: string;
  description: string;
}[] = [
  { value: '1', title: 'Straight', description: 'Falls flat with no bend' },
  { value: '2', title: 'Wavy', description: 'Has S-shaped bends' },
  {
    value: '3',
    title: 'Curly',
    description: 'Has defined spirals or ringlets',
  },
  {
    value: '4',
    title: 'Coily',
    description: 'Has tight coils or Z-shaped patterns',
  },
];

const SUB_TYPE_OPTIONS: Record<
  HairPattern,
  { value: SubType; title: string; description: string }[]
> = {
  '1': [
    { value: '1A', title: '1A', description: 'Pin-straight, very fine' },
    { value: '1B', title: '1B', description: 'Straight with slight body' },
    { value: '1C', title: '1C', description: 'Straight with subtle bends' },
  ],
  '2': [
    { value: '2A', title: '2A', description: 'Gentle S-waves, fine texture' },
    {
      value: '2B',
      title: '2B',
      description: 'More defined S-waves with some frizz',
    },
    {
      value: '2C',
      title: '2C',
      description: 'Deep waves almost forming curls',
    },
  ],
  '3': [
    {
      value: '3A',
      title: '3A',
      description: 'Loose, large spirals like sidewalk chalk',
    },
    { value: '3B', title: '3B', description: 'Bouncy ringlets like a marker' },
    {
      value: '3C',
      title: '3C',
      description: 'Tight corkscrews like a pencil or straw',
    },
  ],
  '4': [
    {
      value: '4A',
      title: '4A',
      description:
        'Defined, springy S-shaped coils about the width of a crochet needle',
    },
    {
      value: '4B',
      title: '4B',
      description:
        'Z-shaped coils that bend at sharp angles, less defined pattern',
    },
    {
      value: '4C',
      title: '4C',
      description:
        'Very tight coils with minimal definition, most shrinkage (up to 75%)',
    },
  ],
};

const POROSITY_OPTIONS: {
  value: Porosity;
  title: string;
  description: string;
}[] = [
  {
    value: 'low',
    title: 'Low Porosity',
    description: 'Sits on top, takes a long time to absorb',
  },
  {
    value: 'normal',
    title: 'Normal Porosity',
    description: 'Absorbs within a few minutes',
  },
  {
    value: 'high',
    title: 'High Porosity',
    description: 'Absorbs almost immediately',
  },
];

const DENSITY_OPTIONS: {
  value: Density;
  title: string;
  description: string;
}[] = [
  { value: 'thin', title: 'Thin Density', description: 'Easily visible' },
  {
    value: 'medium',
    title: 'Medium Density',
    description: 'Partially visible',
  },
  { value: 'thick', title: 'Thick Density', description: 'Barely visible' },
];

const SCALP_OPTIONS: {
  value: ScalpType;
  title: string;
  description: string;
}[] = [
  {
    value: 'oily',
    title: 'Oily',
    description: 'Oily or greasy within 1-2 days',
  },
  { value: 'normal', title: 'Normal', description: 'Comfortable for 3-4 days' },
  { value: 'dry', title: 'Dry', description: 'Dry, tight, or flaky' },
];

const PATTERN_NAMES: Record<HairPattern, string> = {
  '1': 'Straight',
  '2': 'Wavy',
  '3': 'Curly',
  '4': 'Coily',
};

const SUB_TYPE_NAMES: Record<SubType, string> = {
  '1A': 'Pin-Straight',
  '1B': 'Straight with Body',
  '1C': 'Straight with Bends',
  '2A': 'Gentle Waves',
  '2B': 'Defined Waves',
  '2C': 'Deep Waves',
  '3A': 'Loose Spirals',
  '3B': 'Bouncy Ringlets',
  '3C': 'Tight Corkscrews',
  '4A': 'Defined Coils',
  '4B': 'Z-Shaped Coils',
  '4C': 'Very Tight Coils',
};

const POROSITY_NAMES: Record<Porosity, string> = {
  low: 'Low Porosity',
  normal: 'Normal Porosity',
  high: 'High Porosity',
};

const DENSITY_NAMES: Record<Density, string> = {
  thin: 'Thin',
  medium: 'Medium',
  thick: 'Thick',
};

const SCALP_NAMES: Record<ScalpType, string> = {
  oily: 'Oily',
  normal: 'Normal',
  dry: 'Dry',
};

// ---------------------------------------------------------------------------
// Tips & recommendations
// ---------------------------------------------------------------------------

function getTips(
  subType: SubType,
  porosity: Porosity,
  scalpType: ScalpType,
): string[] {
  const tips: string[] = [];
  const pattern = subType[0] as HairPattern;

  // Pattern-based tips
  if (pattern === '4') {
    tips.push(
      'Deep condition weekly to keep your coils moisturised and reduce breakage.',
    );
    tips.push(
      'Use the LOC (liquid-oil-cream) or LCO method to lock in moisture effectively.',
    );
    tips.push(
      'Sleep with a satin or silk bonnet to protect your curls and reduce friction.',
    );
    if (subType === '4C') {
      tips.push(
        'Embrace protective styles like twists, braids, or bantu knots to retain length.',
      );
    }
    if (subType === '4B') {
      tips.push(
        'Finger-detangle while wet with conditioner to minimise breakage on your Z-pattern coils.',
      );
    }
    if (subType === '4A') {
      tips.push(
        'Define your coils with a curl cream applied to soaking wet hair for maximum definition.',
      );
    }
  } else if (pattern === '3') {
    tips.push(
      'Apply products to soaking wet hair for the best curl definition.',
    );
    tips.push(
      'Use a microfibre towel or cotton T-shirt to scrunch out excess water without creating frizz.',
    );
    if (subType === '3C') {
      tips.push(
        'Layer a leave-in conditioner with a gel for hold and hydration on your tight curls.',
      );
    }
    if (subType === '3B') {
      tips.push(
        'Refresh second-day curls with a water and conditioner spritz.',
      );
    }
    if (subType === '3A') {
      tips.push('Avoid heavy products that can weigh down your loose spirals.');
    }
  } else if (pattern === '2') {
    tips.push(
      'Use lightweight mousses or gels to enhance your waves without weighing them down.',
    );
    tips.push(
      'Try scrunching your hair upward while it dries to encourage wave formation.',
    );
    if (subType === '2C') {
      tips.push(
        'Consider diffusing on low heat to boost volume and definition.',
      );
    }
  } else {
    tips.push('Use a volumising shampoo to add body and prevent limpness.');
    tips.push(
      'Avoid heavy oils and butters that can weigh straight hair down.',
    );
  }

  // Porosity-based tips
  if (porosity === 'low') {
    tips.push(
      'Use heat (warm water or a steamer) when deep conditioning to help open your cuticles and absorb moisture.',
    );
  } else if (porosity === 'high') {
    tips.push(
      'Seal your hair with heavier oils or butters to help retain the moisture your hair absorbs quickly.',
    );
  }

  // Scalp tips
  if (scalpType === 'dry') {
    tips.push(
      'Incorporate a scalp oil or serum into your routine to soothe dryness and flaking.',
    );
  } else if (scalpType === 'oily') {
    tips.push(
      'Use a gentle clarifying shampoo regularly to keep your scalp balanced without stripping.',
    );
  }

  return tips.slice(0, 4);
}

interface ProductRec {
  label: string;
  href: string;
}

function getProductRecommendations(subType: SubType): ProductRec[] {
  const pattern = subType[0] as HairPattern;

  if (pattern === '4') {
    return [
      { label: 'Deep Conditioners', href: '/hair-care' },
      { label: 'Hair Oils & Butters', href: '/hair-care' },
      { label: 'Protective Styling', href: '/wigs-extensions' },
      { label: 'Leave-In Conditioners', href: '/hair-care' },
    ];
  }
  if (pattern === '3') {
    return [
      { label: 'Curl Creams', href: '/hair-care' },
      { label: 'Styling Gels', href: '/hair-care' },
      { label: 'Leave-In Conditioners', href: '/hair-care' },
      { label: 'Curl Refreshers', href: '/hair-care' },
    ];
  }
  if (pattern === '2') {
    return [
      { label: 'Lightweight Mousses', href: '/hair-care' },
      { label: 'Wave Enhancers', href: '/hair-care' },
      { label: 'Anti-Frizz Serums', href: '/hair-care' },
    ];
  }
  return [
    { label: 'Volumising Shampoos', href: '/hair-care' },
    { label: 'Lightweight Conditioners', href: '/hair-care' },
    { label: 'Heat Protectants', href: '/hair-care' },
  ];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 5;

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

export default function HairTypeQuiz() {
  const [state, setState] = useState<QuizState>({
    step: 1,
    pattern: null,
    subType: null,
    porosity: null,
    density: null,
    scalpType: null,
  });

  const goBack = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step - 1 }));
  }, []);

  const restart = useCallback(() => {
    setState({
      step: 1,
      pattern: null,
      subType: null,
      porosity: null,
      density: null,
      scalpType: null,
    });
  }, []);

  const selectPattern = useCallback((value: HairPattern) => {
    setState((prev) => ({ ...prev, pattern: value, subType: null }));
    // Auto-advance after a short delay so user sees selection
    setTimeout(() => {
      setState((prev) => ({ ...prev, step: 2 }));
    }, 300);
  }, []);

  const selectSubType = useCallback((value: SubType) => {
    setState((prev) => ({ ...prev, subType: value }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, step: 3 }));
    }, 300);
  }, []);

  const selectPorosity = useCallback((value: Porosity) => {
    setState((prev) => ({ ...prev, porosity: value }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, step: 4 }));
    }, 300);
  }, []);

  const selectDensity = useCallback((value: Density) => {
    setState((prev) => ({ ...prev, density: value }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, step: 5 }));
    }, 300);
  }, []);

  const selectScalp = useCallback((value: ScalpType) => {
    setState((prev) => ({ ...prev, scalpType: value }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, step: 6 }));
    }, 300);
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa mb-2">
        Hair Pattern
      </h2>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        When your hair is freshly washed and air-dried without any product, what
        does it look like?
      </p>
      <div className="grid gap-4">
        {PATTERN_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.pattern === opt.value}
            onSelect={selectPattern}
          />
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (!state.pattern) return null;
    const options = SUB_TYPE_OPTIONS[state.pattern];

    return (
      <div>
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa mb-2">
          Your {PATTERN_NAMES[state.pattern]} Sub-Type
        </h2>
        <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
          Which description best matches your hair?
        </p>
        <div className="grid gap-4">
          {options.map((opt) => (
            <OptionCard
              key={opt.value}
              value={opt.value}
              title={opt.title}
              description={opt.description}
              selected={state.subType === opt.value}
              onSelect={selectSubType}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={faDroplet}
          className="text-terracotta"
          size="lg"
        />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Porosity
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        When you spray or apply water to a small section of hair, what happens?
      </p>
      <div className="grid gap-4">
        {POROSITY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.porosity === opt.value}
            onSelect={selectPorosity}
          />
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={faLayerGroup}
          className="text-terracotta"
          size="lg"
        />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Density
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        When you pull your hair to the side, can you see your scalp?
      </p>
      <div className="grid gap-4">
        {DENSITY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.density === opt.value}
            onSelect={selectDensity}
          />
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={faHeadSide}
          className="text-terracotta"
          size="lg"
        />
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cocoa">
          Scalp Type
        </h2>
      </div>
      <p className="text-cocoa/60 font-inter mb-6 leading-relaxed">
        How does your scalp typically feel between wash days?
      </p>
      <div className="grid gap-4">
        {SCALP_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            title={opt.title}
            description={opt.description}
            selected={state.scalpType === opt.value}
            onSelect={selectScalp}
          />
        ))}
      </div>
    </div>
  );

  const renderResults = () => {
    if (
      !state.subType ||
      !state.porosity ||
      !state.density ||
      !state.scalpType ||
      !state.pattern
    ) {
      return null;
    }

    const tips = getTips(state.subType, state.porosity, state.scalpType);
    const recommendations = getProductRecommendations(state.subType);

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-sage-green/10 text-sage-green font-inter font-semibold text-sm px-4 py-2 rounded-full mb-4">
            <FontAwesomeIcon icon={faSparkles} />
            Your Results Are In
          </div>
          <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-cocoa">
            Your Hair Profile
          </h2>
        </div>

        {/* Hair Type Badge */}
        <div className="bg-white rounded-2xl shadow-md border border-sage-green/20 p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sage-green/10 mb-4">
            <span className="text-4xl font-playfair font-bold text-sage-green">
              {state.subType}
            </span>
          </div>
          <h3 className="text-2xl font-playfair font-bold text-cocoa mb-1">
            {PATTERN_NAMES[state.pattern]} &mdash;{' '}
            {SUB_TYPE_NAMES[state.subType]}
          </h3>
          <p className="text-cocoa/50 font-inter text-sm">
            Type {state.subType} Hair
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
              Porosity
            </p>
            <p className="font-playfair font-bold text-cocoa">
              {POROSITY_NAMES[state.porosity]}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-cocoa/10 p-5 text-center">
            <FontAwesomeIcon
              icon={faLayerGroup}
              className="text-terracotta mb-2"
              size="lg"
            />
            <p className="text-xs font-inter text-cocoa/50 uppercase tracking-wider mb-1">
              Density
            </p>
            <p className="font-playfair font-bold text-cocoa">
              {DENSITY_NAMES[state.density]}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-cocoa/10 p-5 text-center">
            <FontAwesomeIcon
              icon={faHeadSide}
              className="text-terracotta mb-2"
              size="lg"
            />
            <p className="text-xs font-inter text-cocoa/50 uppercase tracking-wider mb-1">
              Scalp
            </p>
            <p className="font-playfair font-bold text-cocoa">
              {SCALP_NAMES[state.scalpType]}
            </p>
          </div>
        </div>

        {/* Personalised Tips */}
        <div className="bg-white rounded-2xl shadow-md border border-cocoa/10 p-6 sm:p-8">
          <h3 className="text-xl font-playfair font-bold text-cocoa mb-4">
            Personalised Tips for Your Hair
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
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white font-bold font-inter text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Shop Products for Your Hair Type
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

  const isResults = state.step === 6;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 md:p-12">
      {/* Title — only show on quiz steps */}
      {!isResults && (
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-cocoa mb-2">
            Find Your Hair Type
          </h1>
          <p className="text-cocoa/50 font-inter text-sm sm:text-base">
            Answer a few questions to discover your unique hair profile and get
            personalised recommendations.
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
        {state.step === 6 && renderResults()}
      </div>
    </div>
  );
}
