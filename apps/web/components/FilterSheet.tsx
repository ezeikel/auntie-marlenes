'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/pro-regular-svg-icons';
import { filterSections } from '@/lib/filters';
import { formatCurrency } from '@/lib/currency';

type Filters = {
  inStockOnly: boolean;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
};

type FilterSheetProps = {
  onFilterChange?: (filters: Filters) => void;
};

const FilterSheet = ({ onFilterChange }: FilterSheetProps) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    inStockOnly: false,
    categories: [],
    brands: [],
    priceRange: [0, 25],
  });

  const handleToggleChange = (checked: boolean) => {
    setFilters({ ...filters, inStockOnly: checked });
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

    setFilters({ ...filters, [key]: newValues });
  };

  const handlePriceChange = (values: number[]) => {
    setFilters({ ...filters, priceRange: values as [number, number] });
  };

  const handleClearAll = () => {
    setFilters({
      inStockOnly: false,
      categories: [],
      brands: [],
      priceRange: [0, 25],
    });
  };

  const handleApply = () => {
    onFilterChange?.(filters);
    setOpen(false);
  };

  const activeFilterCount =
    (filters.inStockOnly ? 1 : 0) +
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 25 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent relative">
          <FontAwesomeIcon icon={faSliders} size="sm" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-terracotta text-white text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b border-gray-200 pb-4 mb-4">
          <SheetTitle className="text-2xl font-playfair font-bold text-cocoa">
            Filters
          </SheetTitle>
        </SheetHeader>

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
                      htmlFor="in-stock-mobile"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      In stock only ({filters.inStockOnly ? 'On' : 'Off'})
                    </Label>
                    <Switch
                      id="in-stock-mobile"
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
                          id={`${section.id}-${option.id}-mobile`}
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
                          htmlFor={`${section.id}-${option.id}-mobile`}
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
                            htmlFor="price-min-mobile"
                            className="text-xs text-gray-600 mb-1 block"
                          >
                            Min
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              £
                            </span>
                            <Input
                              id="price-min-mobile"
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
                                handlePriceChange([
                                  value,
                                  filters.priceRange[1],
                                ]);
                              }}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        <span className="text-gray-400 pt-5">to</span>
                        <div className="flex-1">
                          <Label
                            htmlFor="price-max-mobile"
                            className="text-xs text-gray-600 mb-1 block"
                          >
                            Max
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              £
                            </span>
                            <Input
                              id="price-max-mobile"
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
                                handlePriceChange([
                                  filters.priceRange[0],
                                  value,
                                ]);
                              }}
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
                        className="mt-4"
                      />

                      <p className="text-xs text-gray-500 text-center">
                        The highest price is{' '}
                        {formatCurrency(section.max, 'GBP')}
                      </p>
                    </div>
                  )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex-1 bg-transparent"
          >
            CLEAR ALL
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-sage-green hover:bg-sage-green/90 text-white font-bold"
          >
            VIEW ITEMS
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
