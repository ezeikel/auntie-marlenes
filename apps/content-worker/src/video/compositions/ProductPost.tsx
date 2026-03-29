import { AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { Brand } from '../components/Brand';
import { Headline } from '../components/Headline';

export type ProductPostProps = {
  sceneImageUrl: string;
  headline: string;
  subheading: string;
};

/**
 * ProductPost — static 1080x1350 feed post.
 * Matches the Figma IG/FB Feed Ad template exactly.
 */
export const ProductPost: React.FC<ProductPostProps> = ({
  sceneImageUrl,
  headline,
  subheading,
}) => {
  return (
    <AbsoluteFill>
      {/* Scene image (full bleed) */}
      <Background imageUrl={sceneImageUrl} />

      {/* Gradient overlay */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(74,43,37,0.28) 0%, rgba(74,43,37,0) 50%, rgba(74,43,37,0.3) 100%)',
        }}
      />

      {/* Brand (top-left) */}
      <Brand />

      {/* Headline + CTA (bottom) */}
      <Headline headline={headline} subheading={subheading} />
    </AbsoluteFill>
  );
};
