import { AbsoluteFill, Sequence, Video, useCurrentFrame, interpolate } from 'remotion';
import { Background } from '../components/Background';
import { Brand } from '../components/Brand';
import { Headline } from '../components/Headline';

export type ProductReelProps = {
  sceneVideoUrl?: string;
  sceneImageUrl?: string;
  headline: string;
  subheading: string;
  durationInFrames?: number;
};

/**
 * ProductReel — animated reel with Veo-generated video background.
 *
 * If sceneVideoUrl is provided, uses the animated video.
 * Falls back to sceneImageUrl with Ken Burns effect.
 *
 * Timeline (8 seconds @ 30fps = 240 frames):
 * - 0-30 (0-1s):     Background fades in
 * - 30-60 (1-2s):    Brand fades in from top
 * - 60-120 (2-4s):   Headline animates in
 * - 120-240 (4-8s):  Hold with all elements visible
 */
export const ProductReel: React.FC<ProductReelProps> = ({
  sceneVideoUrl,
  sceneImageUrl,
  headline,
  subheading,
  durationInFrames = 240,
}) => {
  const frame = useCurrentFrame();

  // Subtle slow zoom on video (1.0 → 1.05 over duration)
  const videoScale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Fade in over first 30 frames
  const fadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#2C1810' }}>
      {/* Background — Veo video or fallback to image */}
      {sceneVideoUrl ? (
        <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden' }}>
          <Video
            src={sceneVideoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${videoScale})`,
            }}
          />
        </AbsoluteFill>
      ) : sceneImageUrl ? (
        <Sequence from={0} durationInFrames={durationInFrames}>
          <Background
            imageUrl={sceneImageUrl}
            animated
            durationInFrames={durationInFrames}
          />
        </Sequence>
      ) : null}

      {/* Gradient overlay */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(74,43,37,0.35) 0%, rgba(74,43,37,0) 35%, rgba(74,43,37,0.55) 100%)',
        }}
      />

      {/* Brand — appears at 1s */}
      <Sequence from={30} durationInFrames={durationInFrames - 30}>
        <Brand animated />
      </Sequence>

      {/* Headline — appears at 2s */}
      <Sequence from={60} durationInFrames={durationInFrames - 60}>
        <Headline headline={headline} subheading={subheading} animated />
      </Sequence>
    </AbsoluteFill>
  );
};
