/**
 * Navigation constants for mobile app
 */

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Hair Care', href: '/hair-care' },
  { name: 'Skincare', href: '/skincare' },
  { name: 'Wigs & Extensions', href: '/wigs-extensions' },
  { name: 'Kids', href: '/kids' },
  { name: "Men's", href: '/mens' },
  { name: 'Blog', href: '/blog' },
  { name: 'SALE', href: '/sale', isHighlight: true },
] as const;

export const CATEGORIES = [
  {
    id: 'hair-care',
    name: 'Hair Care',
    handle: 'hair-care',
    image: '/images/categories/hair-care.jpg',
  },
  {
    id: 'skincare',
    name: 'Skincare',
    handle: 'skincare',
    image: '/images/categories/skincare.jpg',
  },
  {
    id: 'wigs-extensions',
    name: 'Wigs & Extensions',
    handle: 'wigs-extensions',
    image: '/images/categories/wigs.jpg',
  },
  {
    id: 'kids',
    name: 'Kids',
    handle: 'kids',
    image: '/images/categories/kids.jpg',
  },
  {
    id: 'mens',
    name: "Men's",
    handle: 'mens',
    image: '/images/categories/mens.jpg',
  },
] as const;
