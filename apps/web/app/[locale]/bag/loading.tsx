import { Skeleton } from '@/components/ui/skeleton';

export default function BagLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-10 w-32 mb-8" />

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border rounded-lg">
            <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 space-y-3">
        <Skeleton className="h-5 w-40 ml-auto" />
        <Skeleton className="h-12 w-full max-w-xs ml-auto rounded-md" />
      </div>
    </div>
  );
}
