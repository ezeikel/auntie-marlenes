import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/app/actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const countryCode = searchParams.get('country') || 'GB';
  const category = searchParams.get('category');
  const query = searchParams.get('query');
  const onSale = searchParams.get('onSale') === 'true';
  const sortKey = (searchParams.get('sortKey') ||
    'BEST_SELLING') as SearchProductsParams['sortKey'];
  const reverse = searchParams.get('reverse') === 'true';
  const first = parseInt(searchParams.get('first') || '50', 10);

  try {
    const products = await searchProducts({
      ...(query && { query }),
      ...(category && { productType: category }),
      sortKey,
      reverse,
      first,
      onSale,
      countryCode,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to search products:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}

type SearchProductsParams = {
  query?: string;
  productType?: string;
  sortKey?:
    | 'TITLE'
    | 'PRICE'
    | 'CREATED_AT'
    | 'BEST_SELLING'
    | 'RELEVANCE'
    | undefined;
  reverse?: boolean;
  first?: number;
  onSale?: boolean;
  countryCode: string;
};
