'use client';

import { useState } from 'react';
import Link from 'next/link';
import { products } from '@/lib/constants';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import FilterSheet from './FilterSheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';

type SearchResultsProps = {
  query: string;
};

type Filters = {
  inStockOnly: boolean;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
};

const SearchResults = ({ query }: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState<Filters>({
    inStockOnly: false,
    categories: [],
    brands: [],
    priceRange: [0, 25],
  });

  // Filter products based on search query and filters
  let filteredProducts = query
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()),
      )
    : products;

  // Apply filters
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

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm font-inter text-gray-600">
            <Link href="/" className="hover:text-terracotta">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">
              Search results for {query ? `"${query}"` : 'all products'}
            </span>
          </nav>
        </div>
      </div>

      {/* Search Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm font-inter text-gray-600 mb-2">
              Your search results for:
            </p>
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-terracotta">
              {query ? `"${query}"` : 'All Products'}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <FilterSidebar onFilterChange={setFilters} />
          </aside>

          <div>
            {/* Filter & Sort Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex gap-3">
                {/* Mobile Filter */}
                <div className="lg:hidden">
                  <FilterSheet onFilterChange={setFilters} />
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
                        onClick={() => setSortBy(option.value)}
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
};

export default SearchResults;
