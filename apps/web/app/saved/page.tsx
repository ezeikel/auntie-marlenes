import SavedItemsList from '@/components/SavedItemsList';

export default function SavedPage() {
  return (
    <div className="bg-warm-beige min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-2">
            Saved Items
          </h1>
          <p className="text-gray-600 font-inter">
            Your wishlist of favourite products
          </p>
        </div>

        <SavedItemsList />
      </div>
    </div>
  );
}
