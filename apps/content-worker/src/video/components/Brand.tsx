import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import {
  loadFont,
  fontFamily,
} from '@remotion/google-fonts/PlayfairDisplay';

const { waitUntilDone } = loadFont('normal', { weights: ['700'] });
waitUntilDone();

/**
 * Brand component — "Auntie Marlene's" + "Afro Hair & Beauty"
 * Matches the Figma ad template (top-left positioning).
 */
export const Brand: React.FC<{ animated?: boolean }> = ({
  animated = false,
}) => {
  const frame = useCurrentFrame();

  const opacity = animated
    ? interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  const translateY = animated
    ? interpolate(frame, [0, 20], [-20, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 64,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            fontFamily,
            color: 'white',
            lineHeight: 1,
          }}
        >
          Auntie Marlene's
        </span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily,
            color: '#f5e6d3',
            marginTop: 8,
          }}
        >
          Afro Hair & Beauty
        </span>
      </div>
    </AbsoluteFill>
  );
};
