'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import FilterSheet from '@/components/FilterSheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';
import type { Product } from '@/lib/constants';

type Filters = {
  inStockOnly: boolean;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
};

type ProductListingClientProps = {
  products: Product[];
  title: string;
  breadcrumb: { label: string; href: string }[];
};

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export default function ProductListingClient({
  products,
  title,
  breadcrumb,
}: ProductListingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState(
    searchParams.get('sort') || 'recommended',
  );
  const [filters, setFilters] = useState<Filters>({
    inStockOnly: searchParams.get('inStockOnly') === 'true',
    categories:
      searchParams.get('categories')?.split(',').filter(Boolean) || [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    priceRange: [
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 25,
    ],
  });

  // Update URL when filters or sort change
  const updateURL = (newFilters: Filters, newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update filter params
    if (newFilters.inStockOnly) {
      params.set('inStockOnly', 'true');
    } else {
      params.delete('inStockOnly');
    }

    if (newFilters.categories.length > 0) {
      params.set('categories', newFilters.categories.join(','));
    } else {
      params.delete('categories');
    }

    if (newFilters.brands.length > 0) {
      params.set('brands', newFilters.brands.join(','));
    } else {
      params.delete('brands');
    }

    if (newFilters.priceRange[0] > 0) {
      params.set('minPrice', String(newFilters.priceRange[0]));
    } else {
      params.delete('minPrice');
    }

    if (newFilters.priceRange[1] < 25) {
      params.set('maxPrice', String(newFilters.priceRange[1]));
    } else {
      params.delete('maxPrice');
    }

    if (newSort !== 'recommended') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateURL(newFilters, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateURL(filters, newSort);
  };

  // Client-side filtering for display
  let filteredProducts = [...products];

  if (filters.inStockOnly) {
    filteredProducts = filteredProducts.filter((p) => p.inStock);
  }

  if (filters.categories.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      filters.categories.some(
        (cat) => p.category.toLowerCase().replace(/\s+/g, '-') === cat,
      ),
    );
  }

  if (filters.brands.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      filters.brands.some(
        (brand) => p.brand.toLowerCase().replace(/\s+/g, '-') === brand,
      ),
    );
  }

  filteredProducts = filteredProducts.filter(
    (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
  );

  // Client-side sorting
  switch (sortBy) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      // For now, keep original order - would need createdAt field
      break;
    case 'recommended':
    default:
      // Keep original order
      break;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm font-inter text-gray-600">
            {breadcrumb.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-gray-900">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-terracotta">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-terracotta">
              {title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </aside>

          <div>
            {/* Filter & Sort Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex gap-3">
                {/* Mobile Filter */}
                <div className="lg:hidden">
                  <FilterSheet onFilterChange={handleFilterChange} />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <span className="hidden sm:inline">Sort:</span>
                      <span>
                        {sortOptions.find((opt) => opt.value === sortBy)?.label}
                      </span>
                      <FontAwesomeIcon icon={faChevronDown} size="sm" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm font-inter text-gray-600">
                <span className="font-semibold">{filteredProducts.length}</span>{' '}
                styles found
              </p>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-playfair text-gray-600">
                  No products found
                </p>
                <p className="text-sm font-inter text-gray-500 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Load More */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-sm font-inter text-gray-600 mb-4">
                  You've viewed {filteredProducts.length} of{' '}
                  {filteredProducts.length} products
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto bg-transparent"
                >
                  LOAD MORE
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
