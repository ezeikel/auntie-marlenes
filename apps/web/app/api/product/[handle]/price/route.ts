import { NextRequest, NextResponse } from 'next/server';
import { getProductByHandle } from '@/app/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country') || 'GB';

  try {
    const product = await getProductByHandle({
      handle,
      countryCode,
    });

    return NextResponse.json({
      price: product.price,
      currencyCode: product.currencyCode,
      compareAtPrice: product.compareAtPrice,
    });
  } catch (error) {
    console.error('Failed to fetch product price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product price' },
      { status: 500 },
    );
  }
}
