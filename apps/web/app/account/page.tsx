import { Suspense } from 'react';
import Account from '@/components/Account/Account';

const AccountPage = async () => {
  return (
    <Suspense
      fallback={
        <div className="bg-warm-beige min-h-screen py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-2">
                My Account
              </h1>
              <p className="text-gray-600 font-inter">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <Account />
    </Suspense>
  );
};

export default AccountPage;
