import { UmamiTracker } from '@/components/umami-tracker';
import { readUmamiConfig } from '@/lib/umami';

/** Optional Umami snippet. Renders nothing unless both NEXT_PUBLIC_UMAMI_* values are set and valid. */
export function UmamiScript() {
  const config = readUmamiConfig();
  return config ? (
    <UmamiTracker scriptUrl={config.scriptUrl} websiteId={config.websiteId} />
  ) : null;
}
