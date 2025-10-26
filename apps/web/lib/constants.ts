export type Product = {
  id: string;
  handle: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  colors?: { name: string; value: string; image: string }[];
  sizes?: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  saveCount?: number;
};

export const products: Product[] = [
  {
    id: '1',
    handle: 'moisturizing-leave-in-conditioner',
    name: 'Moisturizing Leave-In Conditioner',
    brand: 'Cantu',
    category: 'Hair Care',
    description: 'Hydrating formula for dry, curly, or textured hair',
    price: 12.99,
    image: '/placeholder.svg?height=400&width=400&text=Leave-In+Conditioner',
    images: [
      '/placeholder.svg?height=600&width=600&text=Leave-In+1',
      '/placeholder.svg?height=600&width=600&text=Leave-In+2',
      '/placeholder.svg?height=600&width=600&text=Leave-In+3',
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 248,
  },
  {
    id: '2',
    handle: 'edge-control-gel',
    name: 'Edge Control Gel',
    brand: 'Creme of Nature',
    category: 'Styling',
    description: 'Sleek hold for baby hairs and edges',
    price: 8.99,
    image: '/placeholder.svg?height=400&width=400&text=Edge+Control',
    inStock: true,
    rating: 4.8,
    reviewCount: 312,
  },
  {
    id: '3',
    handle: 'curl-defining-cream',
    name: 'Curl Defining Cream',
    brand: 'SheaMoisture',
    category: 'Hair Care',
    description: 'Enhances and defines natural curls',
    price: 14.99,
    image: '/placeholder.svg?height=400&width=400&text=Curl+Cream',
    colors: [
      {
        name: 'Original',
        value: '#F5E6D3',
        image: '/placeholder.svg?height=400&width=400&text=Original',
      },
      {
        name: 'Coconut',
        value: '#FFFACD',
        image: '/placeholder.svg?height=400&width=400&text=Coconut',
      },
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 189,
  },
  {
    id: '4',
    handle: 'satin-bonnet',
    name: 'Satin Bonnet',
    brand: 'Generic',
    category: 'Accessories',
    description: 'Protects hair during sleep',
    price: 6.99,
    image: '/placeholder.svg?height=400&width=400&text=Satin+Bonnet',
    colors: [
      {
        name: 'Black',
        value: '#000000',
        image: '/placeholder.svg?height=400&width=400&text=Black+Bonnet',
      },
      {
        name: 'Pink',
        value: '#FFB6C1',
        image: '/placeholder.svg?height=400&width=400&text=Pink+Bonnet',
      },
      {
        name: 'Gold',
        value: '#FFD700',
        image: '/placeholder.svg?height=400&width=400&text=Gold+Bonnet',
      },
    ],
    sizes: ['Standard', 'Large', 'XL'],
    inStock: true,
    rating: 4.3,
    reviewCount: 156,
  },
  {
    id: '5',
    handle: 'hair-growth-oil',
    name: 'Hair Growth Oil',
    brand: 'Mielle Organics',
    category: 'Hair Care',
    description: 'Natural oils for scalp and hair growth',
    price: 16.99,
    image: '/placeholder.svg?height=400&width=400&text=Growth+Oil',
    inStock: true,
    rating: 4.7,
    reviewCount: 421,
  },
  {
    id: '6',
    handle: 'twist-and-lock-gel',
    name: 'Twist & Lock Gel',
    brand: 'ORS',
    category: 'Styling',
    description: 'Locks in moisture for twist and loc styles',
    price: 9.99,
    image: '/placeholder.svg?height=400&width=400&text=Twist+Gel',
    inStock: true,
    rating: 4.4,
    reviewCount: 98,
  },
  {
    id: '7',
    handle: 'jamaican-black-castor-oil',
    name: 'Jamaican Black Castor Oil',
    brand: 'Sunny Isle',
    category: 'Hair Care',
    description: 'Promotes growth and nourishment',
    price: 18.99,
    image: '/placeholder.svg?height=400&width=400&text=Castor+Oil',
    inStock: true,
    rating: 4.9,
    reviewCount: 567,
  },
  {
    id: '8',
    handle: 'deep-conditioning-mask',
    name: 'Deep Conditioning Mask',
    brand: 'Cantu',
    category: 'Hair Care',
    description: 'Intensive moisture treatment',
    price: 11.99,
    image: '/placeholder.svg?height=400&width=400&text=Deep+Mask',
    inStock: false,
    rating: 4.6,
    reviewCount: 234,
  },
];

export type NavLink = {
  name: string;
  href: string;
  isHighlight?: boolean;
};

export const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Hair Care', href: '/hair-care' },
  { name: 'Skincare', href: '/skincare' },
  { name: 'Wigs & Extensions', href: '/wigs-extensions' },
  { name: 'Kids', href: '/kids' },
  { name: "Men's", href: '/mens' },
  { name: 'Blog', href: '/blog' },
  { name: 'SALE', href: '/sale', isHighlight: true },
];
