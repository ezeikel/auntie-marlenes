import { Composition, Still } from 'remotion';
import { ProductPost, type ProductPostProps } from './compositions/ProductPost';
import { ProductReel, type ProductReelProps } from './compositions/ProductReel';

// Sample scene for Remotion Studio preview
const SAMPLE_IMAGE =
  'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=1080';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Feed post — 1080x1350 (4:5 IG ratio) */}
      <Still
        id="ProductPost"
        component={ProductPost}
        width={1080}
        height={1350}
        defaultProps={{
          sceneImageUrl: SAMPLE_IMAGE,
          headline: 'Wash day made easy',
          subheading: 'Shop Cantu and more',
        } satisfies ProductPostProps}
      />

      {/* Reel — 1080x1920 (9:16), 6 seconds @ 30fps */}
      <Composition
        id="ProductReel"
        component={ProductReel}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          sceneImageUrl: SAMPLE_IMAGE,
          headline: 'Salon results at home',
          subheading: 'For curls that last',
        } satisfies ProductReelProps}
      />
    </>
  );
};
