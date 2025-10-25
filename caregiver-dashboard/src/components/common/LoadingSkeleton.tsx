// Loading Skeleton Component

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  count?: number;
}

export function PatientCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          {/* Avatar skeleton */}
          <Skeleton className="h-16 w-16 rounded-full" />

          {/* Patient info skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
}

export function PatientListSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PatientCardSkeleton key={index} />
      ))}
    </div>
  );
}
