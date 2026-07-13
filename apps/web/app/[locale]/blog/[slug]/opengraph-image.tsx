import { ImageResponse } from 'next/og';
import { getSanityImageUrl } from '@/lib/sanity-blog';
import { client } from '@/sanity/lib/client';
import { postBySlugQuery } from '@/sanity/lib/queries';

export const runtime = 'nodejs';

export const alt = "Blog post from Auntie Marlene's";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await client.fetch(postBySlugQuery, { slug });
  } catch {
    // Fallback
  }

  const playfairBold = fetch(
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap',
  ).then(async (res) => {
    const css = await res.text();
    const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
    if (!fontUrl) throw new Error('Could not extract Playfair font URL');
    return fetch(fontUrl).then((fontRes) => fontRes.arrayBuffer());
  });

  const interSemiBold = fetch(
    'https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap',
  ).then(async (res) => {
    const css = await res.text();
    const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
    if (!fontUrl) throw new Error('Could not extract Inter SemiBold font URL');
    return fetch(fontUrl).then((fontRes) => fontRes.arrayBuffer());
  });

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          background: 'linear-gradient(135deg, #4A2511 0%, #2C1810 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 48,
          fontWeight: 'bold',
          fontFamily: 'Playfair Display, serif',
        }}
      >
        Auntie Marlene&apos;s Blog
      </div>,
      {
        ...size,
        fonts: [
          {
            name: 'Playfair Display',
            data: await playfairBold,
            style: 'normal',
            weight: 700,
          },
        ],
      },
    );
  }

  const title = post.title || 'Blog Post';
  const author = post.author?.name || "Auntie Marlene's Team";
  const category = post.category?.title;
  const featuredImage = getSanityImageUrl(post.featuredImage);

  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #4A2511 0%, #2C1810 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
      }}
    >
      {/* Featured image (left half, faded) */}
      {featuredImage && !featuredImage.includes('placeholder') && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            height: '100%',
            display: 'flex',
          }}
        >
          <img
            src={featuredImage}
            alt=""
            width="600"
            height="630"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right, transparent 0%, #2C1810 100%)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width:
            featuredImage && !featuredImage.includes('placeholder')
              ? '65%'
              : '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Category badge */}
        {category && (
          <div
            style={{
              display: 'flex',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: 'rgba(107, 143, 113, 0.3)',
                color: '#8FBC8F',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: 16,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {category}
            </div>
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: title.length > 60 ? 36 : 44,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display, serif',
            color: '#FFFFFF',
            marginBottom: 24,
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h1>

        {/* Author */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: '#E0D4C3',
            }}
          >
            By {author}
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              fontFamily: 'Playfair Display, serif',
              color: '#F5E6D3',
            }}
          >
            Auntie Marlene&apos;s
          </div>
          <div
            style={{
              fontSize: 16,
              color: '#E0D4C3',
              marginTop: 4,
            }}
          >
            Black-Owned Hair &amp; Beauty Blog
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Playfair Display',
          data: await playfairBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter',
          data: await interSemiBold,
          style: 'normal',
          weight: 600,
        },
      ],
    },
  );
}
