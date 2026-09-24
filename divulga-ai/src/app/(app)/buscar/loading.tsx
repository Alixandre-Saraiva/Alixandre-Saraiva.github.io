import { ProfessionalCardSkeleton } from "@/components/professional/professional-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProfessionalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
