import ProductListingClient from './ProductListingClient';
import type { Product } from '@/lib/constants';

type ProductListingProps = {
  products: Product[];
  title: string;
  breadcrumb: { label: string; href: string }[];
};

export default function ProductListing({
  products,
  title,
  breadcrumb,
}: ProductListingProps) {
  return (
    <ProductListingClient
      products={products}
      title={title}
      breadcrumb={breadcrumb}
    />
  );
}
