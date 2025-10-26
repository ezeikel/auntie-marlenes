'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHeart,
  faBars,
  faTimes,
  faSearch,
} from '@fortawesome/pro-regular-svg-icons';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';
import AccountPopover from './AccountPopover';
import { navLinks } from '@/lib/constants';
import { useSession } from '@/hooks/useSession';
import { signOut as nextAuthSignOut } from 'next-auth/react';

type HeaderProps = {
  bagSlot?: React.ReactNode;
};

const Header = ({ bagSlot }: HeaderProps) => {
  const router = useRouter();
  const { isAuthenticated, user } = useSession();
  const userName = user?.firstName || 'Guest';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top Row: Logo, Search, and Actions */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 min-w-0">
              <Link
                href="/"
                className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-cocoa truncate"
              >
                Auntie Marlene's
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8"
            >
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search for hair care, skincare, wigs & more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pr-12 bg-gray-50 border-gray-300 focus:bg-white focus:ring-sage-green"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  <FontAwesomeIcon icon={faSearch} className="text-gray-600" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </form>

            {/* User Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Language Switcher - Desktop */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Currency Switcher - Desktop */}
              <div className="hidden lg:block">
                <CurrencySwitcher />
              </div>

              {/* User Account with Hover */}
              <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10"
                    onMouseEnter={() => setAccountOpen(true)}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      size="lg"
                      className="text-gray-600"
                    />
                    <span className="sr-only">User Account</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 border-0 shadow-none"
                  align="end"
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <AccountPopover
                    isAuthenticated={isAuthenticated}
                    userName={userName}
                    onClose={() => setAccountOpen(false)}
                    onSignOut={handleSignOut}
                  />
                </PopoverContent>
              </Popover>

              {/* Saved Items / Wishlist */}
              <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                <Link href="/saved">
                  <FontAwesomeIcon
                    icon={faHeart}
                    size="lg"
                    className="text-gray-600"
                  />
                  <span className="sr-only">Saved Items</span>
                </Link>
              </Button>

              {/* Shopping Bag - Dynamic slot with PPR */}
              {bagSlot}

              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? (
                    <FontAwesomeIcon icon={faTimes} />
                  ) : (
                    <FontAwesomeIcon icon={faBars} />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pr-12 bg-gray-50 border-gray-300 focus:bg-white focus:ring-sage-green text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-600"
                    size="sm"
                  />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation - Desktop Only */}
      <div className="hidden md:block bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-8 h-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'font-inter text-sm font-medium transition-colors whitespace-nowrap',
                  link.isHighlight
                    ? 'text-red-600 hover:text-red-700 font-bold'
                    : 'text-gray-600 hover:text-cocoa',
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 ease-in-out overflow-hidden border-t border-gray-200 bg-white',
          isMenuOpen
            ? 'max-h-[calc(100vh-140px)] overflow-y-auto py-4'
            : 'max-h-0',
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Language and Currency Switchers - Mobile */}
          <div className="pb-4 mb-4 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Preferences
            </div>
            <div className="grid gap-2">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'font-inter text-base font-medium transition-colors flex items-center justify-between py-2',
                  link.isHighlight
                    ? 'text-red-600 hover:text-red-700 font-bold'
                    : 'text-gray-600 hover:text-cocoa',
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
