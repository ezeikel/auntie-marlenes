'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { filterSections } from '@/lib/filters';
import { formatCurrency } from '@/lib/currency';

type Filters = {
  inStockOnly: boolean;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
};

type FilterSidebarProps = {
  onFilterChange?: (filters: Filters) => void;
};

const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  const [filters, setFilters] = useState<Filters>({
    inStockOnly: false,
    categories: [],
    brands: [],
    priceRange: [0, 25],
  });

  const handleToggleChange = (checked: boolean) => {
    const newFilters = { ...filters, inStockOnly: checked };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleCheckboxChange = (
    sectionId: string,
    optionId: string,
    checked: boolean,
  ) => {
    const key = sectionId === 'category' ? 'categories' : 'brands';
    const newValues = checked
      ? [...filters[key], optionId]
      : filters[key].filter((id: string) => id !== optionId);

    const newFilters = { ...filters, [key]: newValues };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePriceChange = (values: number[]) => {
    const newFilters = { ...filters, priceRange: values as [number, number] };
    setFilters(newFilters);
  };

  const handlePriceCommit = () => {
    onFilterChange?.(filters);
  };

  const handleClearAll = () => {
    const newFilters = {
      inStockOnly: false,
      categories: [],
      brands: [],
      priceRange: [0, 25] as [number, number],
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const activeFilterCount =
    (filters.inStockOnly ? 1 : 0) +
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 25 ? 1 : 0);

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-playfair font-bold text-cocoa">Filters</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-sm text-terracotta hover:text-terracotta/80"
          >
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={['availability', 'category', 'brand', 'price']}
        className="space-y-2"
      >
        {filterSections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-b border-gray-200"
          >
            <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline py-4">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {section.type === 'toggle' && (
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="in-stock"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    In stock only ({filters.inStockOnly ? 'On' : 'Off'})
                  </Label>
                  <Switch
                    id="in-stock"
                    checked={filters.inStockOnly}
                    onCheckedChange={handleToggleChange}
                  />
                </div>
              )}

              {section.type === 'checkbox' && section.options && (
                <div className="space-y-3">
                  {section.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`${section.id}-${option.id}`}
                        checked={
                          section.id === 'category'
                            ? filters.categories.includes(option.id)
                            : filters.brands.includes(option.id)
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            section.id,
                            option.id,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`${section.id}-${option.id}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                      >
                        {option.label}
                        {option.count !== undefined && (
                          <span className="text-gray-500 ml-1">
                            ({option.count})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'price' &&
                section.min !== undefined &&
                section.max !== undefined && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label
                          htmlFor="price-min"
                          className="text-xs text-gray-600 mb-1 block"
                        >
                          Min
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            £
                          </span>
                          <Input
                            id="price-min"
                            type="number"
                            min={section.min}
                            max={filters.priceRange[1]}
                            value={filters.priceRange[0]}
                            onChange={(e) => {
                              const value = Math.max(
                                section.min!,
                                Math.min(
                                  Number(e.target.value),
                                  filters.priceRange[1],
                                ),
                              );
                              handlePriceChange([value, filters.priceRange[1]]);
                            }}
                            onBlur={handlePriceCommit}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <span className="text-gray-400 pt-5">to</span>
                      <div className="flex-1">
                        <Label
                          htmlFor="price-max"
                          className="text-xs text-gray-600 mb-1 block"
                        >
                          Max
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            £
                          </span>
                          <Input
                            id="price-max"
                            type="number"
                            min={filters.priceRange[0]}
                            max={section.max}
                            value={filters.priceRange[1]}
                            onChange={(e) => {
                              const value = Math.min(
                                section.max!,
                                Math.max(
                                  Number(e.target.value),
                                  filters.priceRange[0],
                                ),
                              );
                              handlePriceChange([filters.priceRange[0], value]);
                            }}
                            onBlur={handlePriceCommit}
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </div>

                    <Slider
                      min={section.min}
                      max={section.max}
                      step={1}
                      value={filters.priceRange}
                      onValueChange={handlePriceChange}
                      onValueCommit={handlePriceCommit}
                      className="mt-4"
                    />

                    <p className="text-xs text-gray-500 text-center">
                      The highest price is {formatCurrency(section.max, 'GBP')}
                    </p>
                  </div>
                )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FilterSidebar;
