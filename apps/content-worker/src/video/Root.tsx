import { Composition } from 'remotion';
import { ProductReel, type ProductReelProps } from './compositions/ProductReel';

const SAMPLE_IMAGE =
  'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=1080';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reel with image fallback — 1080x1920 (9:16), 8 seconds @ 30fps */}
      <Composition
        id="ProductReel"
        component={ProductReel}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          sceneImageUrl: SAMPLE_IMAGE,
          headline: 'Salon results at home',
          subheading: 'For curls that last',
          durationInFrames: 240,
        } satisfies ProductReelProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames || 240,
        })}
      />
    </>
  );
};
