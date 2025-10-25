import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PatientDetailLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Back Button */}
      <div className="border-b bg-white px-6 py-3">
        <Button variant="ghost" size="sm" className="gap-2" disabled>
          <ArrowLeft className="h-4 w-4" />
          Back to Care Circle
        </Button>
      </div>

      {/* Header Skeleton */}
      <div className="border-b bg-white">
        <div className="px-6 py-6">
          <div className="flex items-start justify-between">
            {/* Left side: Avatar + Info */}
            <div className="flex items-start gap-4">
              {/* Large Avatar Skeleton */}
              <Skeleton className="h-20 w-20 rounded-full" />

              {/* Name, Age, Status */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-9 w-12" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>

            {/* Right side: Quick Actions */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="border-b bg-white px-6">
          <div className="flex h-12 gap-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-28" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6">
          <div className="rounded-lg border bg-white p-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
