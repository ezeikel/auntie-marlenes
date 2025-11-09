import { ImageResponse } from 'next/og';

// Image metadata
export const alt = "Auntie Marlene's - Black Beauty Supply Store Online";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  // Fetch custom fonts from Google Fonts
  const playfairBold = fetch(
    'https://fonts.gstatic.com/s/playfairdisplay/v36/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTXtPA.woff',
  ).then((res) => res.arrayBuffer());

  const interRegular = fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff',
  ).then((res) => res.arrayBuffer());

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
            Your modern Black beauty supply store
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
              <span style={{ fontSize: 28, color: '#8FBC8F' }}>🌍</span>
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
          data: await playfairBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter',
          data: await interRegular,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
