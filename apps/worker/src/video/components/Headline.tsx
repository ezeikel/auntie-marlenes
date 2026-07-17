import { fontFamily } from '@remotion/google-fonts/PlayfairDisplay';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

type HeadlineProps = {
  headline: string;
  subheading: string;
  animated?: boolean;
  position?: 'bottom-left' | 'bottom-right';
};

/**
 * Headline + subheading + "Shop at Auntie Marlene's"
 * Matches the Figma ad template (bottom area).
 * Last word of headline is highlighted in #f5e6d3.
 */
export const Headline: React.FC<HeadlineProps> = ({
  headline,
  subheading,
  animated = false,
  position = 'bottom-right',
}) => {
  const frame = useCurrentFrame();

  const headlineOpacity = animated
    ? interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  const subOpacity = animated
    ? interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  const ctaOpacity = animated
    ? interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  // Split headline to highlight last word
  const words = headline.split(' ');
  const mainWords = words.slice(0, -1).join(' ');
  const lastWord = words[words.length - 1];

  const isRight = position === 'bottom-right';

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        padding: 64,
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: isRight ? 'right' : 'left',
          maxWidth: '80%',
        }}
      >
        {/* Headline */}
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily,
            color: 'white',
            lineHeight: 1.2,
            opacity: headlineOpacity,
          }}
        >
          {mainWords} <span style={{ color: '#f5e6d3' }}>{lastWord}</span>
        </span>

        {/* Subheading */}
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily,
            color: 'white',
            lineHeight: 1.1,
            marginTop: 16,
            opacity: subOpacity,
          }}
        >
          {subheading}
        </span>

        {/* CTA */}
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            fontFamily,
            lineHeight: 1.1,
            marginTop: 16,
            opacity: ctaOpacity,
          }}
        >
          <span style={{ color: 'white' }}>Shop at </span>
          <span style={{ color: '#f5e6d3' }}>Auntie Marlene's</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
