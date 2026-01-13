'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

// Prevent static generation - Studio is client-side only
export const dynamic = 'force-dynamic';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
