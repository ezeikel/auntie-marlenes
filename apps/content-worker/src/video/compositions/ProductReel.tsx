import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import { Background } from '../components/Background';
import { Brand } from '../components/Brand';
import { Headline } from '../components/Headline';

export type ProductReelProps = {
  sceneVideoUrl?: string;
  sceneImageUrl?: string;
  audioUrl?: string;
  headline: string;
  subheading: string;
  durationInFrames?: number;
};

/**
 * ProductReel — animated reel with video background.
 *
 * If sceneVideoUrl is provided, uses the AI-generated video as-is
 * (no additional zoom — the video model handles camera motion).
 * Falls back to sceneImageUrl with Ken Burns effect.
 *
 * Timeline (5 seconds @ 24fps = 120 frames):
 * - 0-24 (0-1s):     Background fades in
 * - 24-48 (1-2s):    Brand fades in from top
 * - 48-96 (2-4s):    Headline animates in
 * - 96-120 (4-5s):   Hold with all elements visible
 */
export const ProductReel: React.FC<ProductReelProps> = ({
  sceneVideoUrl,
  sceneImageUrl,
  audioUrl,
  headline,
  subheading,
  durationInFrames = 120,
}) => {
  const frame = useCurrentFrame();

  // Fade in over first 24 frames (1 second at 24fps)
  const fadeIn = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#2C1810' }}>
      {/* Lofi background music — skip intro, start from 5s into the track */}
      {audioUrl && <Audio src={audioUrl} volume={0.25} startFrom={5 * 24} />}

      {/* Background — AI video (no zoom overlay) or fallback to image */}
      {sceneVideoUrl ? (
        <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden' }}>
          <OffthreadVideo
            src={sceneVideoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
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
      <Sequence from={24} durationInFrames={durationInFrames - 24}>
        <Brand animated />
      </Sequence>

      {/* Headline — appears at 2s */}
      <Sequence from={48} durationInFrames={durationInFrames - 48}>
        <Headline headline={headline} subheading={subheading} animated />
      </Sequence>
    </AbsoluteFill>
  );
};
