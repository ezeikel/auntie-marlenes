import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ProductReelProps } from './compositions/ProductReel';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENTRY_POINT = path.join(__dirname, 'index.ts');

/**
 * Render a ProductReel video with text overlays on Veo video or image background.
 */
export async function renderProductReel(
  props: ProductReelProps,
  outputPath: string,
): Promise<string> {
  console.log('[Remotion] Bundling for ProductReel...');

  const bundleLocation = await bundle({
    entryPoint: ENTRY_POINT,
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'ProductReel',
    inputProps: props,
  });

  console.log('[Remotion] Rendering ProductReel video...');

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: props.durationInFrames || 240,
    },
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: props,
    imageFormat: 'jpeg',
    jpegQuality: 90,
    timeoutInMilliseconds: 300_000,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 25 === 0) {
        console.log(`[Remotion] Reel progress: ${Math.round(progress * 100)}%`);
      }
    },
  });

  console.log(`[Remotion] ProductReel rendered to: ${outputPath}`);
  return outputPath;
}

/**
 * Generate a temp output path.
 */
export function generateOutputPath(type: 'post' | 'reel' | 'video'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = type === 'post' ? 'jpg' : 'mp4';
  return `/tmp/product-${type}-${timestamp}-${random}.${ext}`;
}
