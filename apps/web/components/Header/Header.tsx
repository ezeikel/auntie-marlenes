import Link from 'next/link';
import { Heart, ShoppingBag, User, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getCart } from '@/app/actions';
import { auth } from '@/auth';
import { cn } from '@/lib/utils';

type HeaderProps = {
  className?: string;
};

const Header = async ({ className }: HeaderProps) => {
  const session = await auth();
  const cart = await getCart();
  const cartItemsCount =
    cart?.lines?.edges?.reduce(
      (total: number, edge: any) => total + edge.node.quantity,
      0,
    ) || 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-playfair text-2xl font-bold text-cocoa">
            Auntie Marlene&apos;s
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/shop"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Shop
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Categories
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Blog
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Account */}
          <Link href={session ? '/account' : '/sign-in'}>
            <Button variant="ghost" size="icon" className="relative">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>

          {/* Saved / Wishlist */}
          <Link href="/saved">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Saved items</span>
            </Button>
          </Link>

          {/* Shopping Bag */}
          <Link href="/bag">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <span className="sr-only">Shopping bag</span>
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/shop"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Shop
                </Link>
                <Link
                  href="/categories"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  About
                </Link>
                <Link
                  href="/blog"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Blog
                </Link>
                <div className="pt-4 border-t">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full"
                  />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
