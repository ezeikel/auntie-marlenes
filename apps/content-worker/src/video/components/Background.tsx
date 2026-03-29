import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';

type BackgroundProps = {
  imageUrl: string;
  animated?: boolean;
  durationInFrames?: number;
};

/**
 * Background with optional Ken Burns zoom effect.
 */
export const Background: React.FC<BackgroundProps> = ({
  imageUrl,
  animated = false,
  durationInFrames = 180,
}) => {
  const frame = useCurrentFrame();

  const scale = animated
    ? interpolate(frame, [0, durationInFrames], [1, 1.12], {
        extrapolateRight: 'clamp',
      })
    : 1;

  const opacity = animated
    ? interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  return (
    <AbsoluteFill style={{ opacity, overflow: 'hidden' }}>
      <Img
        src={imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
