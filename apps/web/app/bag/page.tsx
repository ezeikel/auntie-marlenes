import { Suspense } from 'react';
import Bag from '@/components/Bag/Bag';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'Shopping Bag',
  description: 'View and manage items in your shopping bag.',
  path: '/bag',
  noIndex: true, // Transactional pages should not be indexed
});

const BagPage = async () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Bag />
  </Suspense>
);

export default BagPage;
