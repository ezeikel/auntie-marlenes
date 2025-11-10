import { ImageResponse } from 'next/og';

// Force Node.js runtime to avoid Edge Runtime limitations
export const runtime = 'nodejs';

// Image metadata
export const alt = "Auntie Marlene's - Black Beauty Supply Store Online";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Load fonts from Google Fonts (fetch CSS first, then extract font URL)
const getPlayfairBoldFont = fetch(
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap',
).then(async (res) => {
  const css = await res.text();
  const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
  if (!fontUrl) throw new Error('Could not extract Playfair font URL');
  return fetch(fontUrl).then((fontRes) => fontRes.arrayBuffer());
});

const getInterRegularFont = fetch(
  'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap',
).then(async (res) => {
  const css = await res.text();
  const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
  if (!fontUrl) throw new Error('Could not extract Inter font URL');
  return fetch(fontUrl).then((fontRes) => fontRes.arrayBuffer());
});

// Image generation
export default async function Image() {
  // Load fonts
  const [playfairBoldData, interRegularData] = await Promise.all([
    getPlayfairBoldFont,
    getInterRegularFont,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4A2511 0%, #2C1810 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          padding: '80px',
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Brand Name */}
          <h1
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              fontFamily: 'Playfair Display, serif',
              color: '#FFFFFF',
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            Auntie Marlene's
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: 40,
              color: '#F5E6D3',
              marginBottom: 40,
              fontWeight: 400,
            }}
          >
            Where Beautiful Skin Meets Gorgeous Hair
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: 32,
              color: '#E0D4C3',
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Your modern afro hair & beauty store
          </p>

          {/* Trust Badges */}
          <div
            style={{
              display: 'flex',
              gap: 60,
              marginTop: 50,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 28, color: '#8FBC8F' }}>★★★★★</span>
              <span style={{ fontSize: 20, color: '#E0D4C3' }}>
                5-Star Rated
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 28, color: '#F5E6D3' }}>50,000+</span>
              <span style={{ fontSize: 20, color: '#E0D4C3' }}>
                Happy Families
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 28, color: '#8FBC8F' }}>✓</span>
              <span style={{ fontSize: 20, color: '#E0D4C3' }}>
                Worldwide Ship
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair Display',
          data: playfairBoldData,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter',
          data: interRegularData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
