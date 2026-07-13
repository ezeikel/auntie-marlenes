/**
 * Static image compositor using Satori.
 * Renders branded text overlays onto scene images — no browser needed.
 */

import React from 'react';
import satori from 'satori';
import sharp from 'sharp';

// Cache font data
let playfairBoldData: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (playfairBoldData) return playfairBoldData;

  // Fetch Playfair Display Bold from Google Fonts CSS → extract woff2 URL → fetch font
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap',
  ).then((r) => r.text());

  const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
  if (!fontUrl) throw new Error('Could not extract Playfair Display font URL');

  playfairBoldData = await fetch(fontUrl).then((r) => r.arrayBuffer());
  return playfairBoldData!;
}

export interface PostCompositeOptions {
  sceneImage: Buffer;
  headline: string;
  subheading: string;
  width?: number;
  height?: number;
}

/**
 * Composite branded text overlay onto a scene image.
 * Matches the Figma IG/FB Feed Ad template.
 */
export async function compositePost({
  sceneImage,
  headline,
  subheading,
  width = 1080,
  height = 1350,
}: PostCompositeOptions): Promise<Buffer> {
  const fontData = await loadFont();

  // Split headline to highlight last word in accent colour
  const words = headline.split(' ');
  const mainWords = words.slice(0, -1).join(' ');
  const lastWord = words[words.length - 1];

  // Generate the text overlay as SVG via Satori
  const svg = await satori(
    React.createElement(
      'div',
      {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'Playfair Display',
          // Gradient overlay matching Figma template
          background:
            'linear-gradient(180deg, rgba(74,43,37,0.35) 0%, rgba(74,43,37,0) 40%, rgba(74,43,37,0.55) 100%)',
        },
      },
      // Brand (top-left)
      React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        React.createElement(
          'span',
          {
            style: {
              fontSize: '64px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1,
            },
          },
          "Auntie Marlene's",
        ),
        React.createElement(
          'span',
          {
            style: {
              fontSize: '32px',
              fontWeight: 700,
              color: '#f5e6d3',
              marginTop: '8px',
            },
          },
          'Afro Hair & Beauty',
        ),
      ),
      // Spacer
      React.createElement('div', { style: { display: 'flex', flex: 1 } }),
      // Bottom text
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            textAlign: 'right',
          },
        },
        // Headline
        React.createElement(
          'span',
          {
            style: {
              fontSize: '48px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              maxWidth: '80%',
            },
          },
          mainWords + '\u00A0',
          React.createElement(
            'span',
            { style: { color: '#f5e6d3' } },
            lastWord,
          ),
        ),
        // Subheading
        React.createElement(
          'span',
          {
            style: {
              fontSize: '32px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              marginTop: '16px',
            },
          },
          subheading,
        ),
        // CTA
        React.createElement(
          'span',
          {
            style: {
              fontSize: '20px',
              fontWeight: 700,
              marginTop: '16px',
              lineHeight: 1.1,
            },
          },
          React.createElement(
            'span',
            { style: { color: 'white' } },
            'Shop at\u00A0',
          ),
          React.createElement(
            'span',
            { style: { color: '#f5e6d3' } },
            "Auntie Marlene's",
          ),
        ),
      ),
    ),
    {
      width,
      height,
      fonts: [
        {
          name: 'Playfair Display',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );

  // Composite: scene image (base) + text overlay (SVG on top)
  const overlay = Buffer.from(svg);

  const result = await sharp(sceneImage)
    .resize(width, height, { fit: 'cover' })
    .composite([
      {
        input: overlay,
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  console.log(`[Compositor] Post composited (${result.length} bytes)`);

  return result;
}
