import { Suspense } from 'react';
import Bag from '@/components/Bag/Bag';

const BagPage = async () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Bag />
  </Suspense>
);

export default BagPage;
