import { ImageResponse } from 'next/og';
import { getProductByHandle } from '@/app/actions';

export const alt = "Product from Auntie Marlene's";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  // Fetch product data
  let product;
  try {
    product = await getProductByHandle({ handle });
  } catch (error) {
    // Fallback to default if product not found
    return new ImageResponse(
      (
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
          }}
        >
          Product Not Found
        </div>
      ),
      { ...size },
    );
  }

  // Fetch custom fonts from Google Fonts
  const playfairBold = fetch(
    'https://fonts.gstatic.com/s/playfairdisplay/v36/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTXtPA.woff',
  ).then((res) => res.arrayBuffer());

  const interRegular = fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff',
  ).then((res) => res.arrayBuffer());

  const interSemiBold = fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff',
  ).then((res) => res.arrayBuffer());

  // Get product image (first image or fallback to main image)
  const productImage = product.images?.[0] || product.image;

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(product.price);

  // Check if on sale
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const formattedComparePrice = product.compareAtPrice
    ? new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(product.compareAtPrice)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4A2511 0%, #2C1810 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '60px',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
        }}
      >
        {/* Product Image Section */}
        <div
          style={{
            width: '420px',
            height: '420px',
            background: 'white',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <img
            src={productImage}
            alt={product.name}
            width="420"
            height="420"
            style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Product Details Section */}
        <div
          style={{
            flex: 1,
            marginLeft: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Brand */}
          {product.brand && (
            <div
              style={{
                fontSize: 24,
                color: '#8FBC8F',
                marginBottom: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {product.brand}
            </div>
          )}

          {/* Product Name */}
          <h1
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              fontFamily: 'Playfair Display, serif',
              color: '#FFFFFF',
              marginBottom: 24,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </h1>

          {/* Price Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 32,
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {formattedPrice}
            </div>
            {onSale && formattedComparePrice && (
              <>
                <div
                  style={{
                    fontSize: 36,
                    color: '#E0D4C3',
                    textDecoration: 'line-through',
                    opacity: 0.6,
                  }}
                >
                  {formattedComparePrice}
                </div>
                <div
                  style={{
                    background: '#DC2626',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}
                >
                  SALE
                </div>
              </>
            )}
          </div>

          {/* Stock Status */}
          {product.inStock && (
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
                  width: 12,
                  height: 12,
                  background: '#10B981',
                  borderRadius: '50%',
                }}
              />
              <span
                style={{
                  fontSize: 20,
                  color: '#10B981',
                  fontWeight: 600,
                }}
              >
                In Stock
              </span>
            </div>
          )}

          {/* Branding */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                fontFamily: 'Playfair Display, serif',
                color: '#F5E6D3',
              }}
            >
              Auntie Marlene's
            </div>
            <div
              style={{
                fontSize: 18,
                color: '#E0D4C3',
                marginTop: 4,
              }}
            >
              Black Beauty Supply Store
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
