import { AbsoluteFill, Sequence } from 'remotion';
import { Background } from '../components/Background';
import { Brand } from '../components/Brand';
import { Headline } from '../components/Headline';

export type ProductReelProps = {
  sceneImageUrl: string;
  headline: string;
  subheading: string;
};

/**
 * ProductReel — animated 1080x1920 reel (6 seconds @ 30fps).
 *
 * Timeline:
 * - 0-30 (0-1s):     Scene fades in with Ken Burns zoom
 * - 30-60 (1-2s):    Brand fades in from top
 * - 60-110 (2-3.7s): Headline animates in
 * - 110-180 (3.7-6s): Hold with all elements visible
 */
export const ProductReel: React.FC<ProductReelProps> = ({
  sceneImageUrl,
  headline,
  subheading,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#2C1810' }}>
      {/* Background with Ken Burns — full duration */}
      <Sequence from={0} durationInFrames={180}>
        <Background
          imageUrl={sceneImageUrl}
          animated
          durationInFrames={180}
        />
      </Sequence>

      {/* Gradient overlay */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(74,43,37,0.28) 0%, rgba(74,43,37,0) 40%, rgba(74,43,37,0.5) 100%)',
        }}
      />

      {/* Brand — appears at 1s */}
      <Sequence from={30} durationInFrames={150}>
        <Brand animated />
      </Sequence>

      {/* Headline — appears at 2s */}
      <Sequence from={60} durationInFrames={120}>
        <Headline headline={headline} subheading={subheading} animated />
      </Sequence>
    </AbsoluteFill>
  );
};
