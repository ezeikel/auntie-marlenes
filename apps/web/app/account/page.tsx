import { auth } from '@/auth';
import { db } from '@auntie-marlenes/db';
import { redirect } from 'next/navigation';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faUser,
  faEnvelope,
  faCalendar,
} from '@fortawesome/pro-regular-svg-icons';

const AccountPage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Fetch user data with saved items count
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      savedItems: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const savedItemsCount = user.savedItems.length;
  const memberSince = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(user.createdAt);

  return (
    <div className="bg-warm-beige min-h-screen">
      <AnnouncementBanner />
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-2">
              My Account
            </h1>
            <p className="text-gray-600 font-inter">
              Manage your profile and preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-sage-green/10 flex items-center justify-center">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-sage-green text-4xl"
                  />
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-playfair font-bold text-cocoa mb-2">
                  {user.name || 'User'}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-sage-green"
                    />
                    <span className="font-inter">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="text-sage-green"
                    />
                    <span className="font-inter text-sm">
                      Member since {memberSince}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Saved Items */}
            <Link
              href="/saved"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-sage-green/10 flex items-center justify-center group-hover:bg-sage-green/20 transition-colors">
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="text-sage-green text-xl"
                  />
                </div>
                <span className="text-3xl font-playfair font-bold text-cocoa">
                  {savedItemsCount}
                </span>
              </div>
              <h3 className="text-lg font-inter font-semibold text-cocoa mb-1">
                Saved Items
              </h3>
              <p className="text-sm text-gray-600">
                Your wishlist of favourite products
              </p>
            </Link>

            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-terracotta text-xl"
                  />
                </div>
                <span className="px-3 py-1 bg-sage-green text-white text-sm font-semibold rounded-full">
                  Active
                </span>
              </div>
              <h3 className="text-lg font-inter font-semibold text-cocoa mb-1">
                Account Status
              </h3>
              <p className="text-sm text-gray-600">
                Your account is in good standing
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-playfair font-bold text-cocoa mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-sage-green text-sage-green hover:bg-sage-green hover:text-white"
              >
                <Link href="/saved">View Saved Items</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-sage-green text-sage-green hover:bg-sage-green hover:text-white"
              >
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountPage;
