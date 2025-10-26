'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faLanguage } from '@fortawesome/pro-regular-svg-icons';
import { languages, defaultLanguage, type Language } from '@/lib/languages';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(defaultLanguage);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    // In a real app, you would:
    // 1. Update next-intl locale
    // 2. Store preference in cookies/localStorage
    // 3. Potentially update URL path
    console.log('Language changed to:', language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-sm font-inter h-10 px-3 bg-transparent"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLanguage} className="text-gray-600" />
            <span className="truncate">{currentLanguage.name}</span>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="text-xs ml-2 flex-shrink-0"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-semibold">
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className="cursor-pointer flex items-center gap-3 py-2"
          >
            <span className="text-xl">{language.flag}</span>
            <div className="flex-1">
              <p className="font-medium">{language.name}</p>
              <p className="text-xs text-gray-500">{language.nativeName}</p>
            </div>
            {currentLanguage.code === language.code && (
              <span className="text-sage-green font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
