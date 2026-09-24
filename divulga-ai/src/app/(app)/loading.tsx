import { ProfessionalCardSkeleton } from "@/components/professional/professional-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-52 w-full rounded-[1.75rem]" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="size-16 shrink-0 rounded-2xl" />
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
