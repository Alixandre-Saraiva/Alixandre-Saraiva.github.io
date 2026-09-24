import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="-mx-4 -mt-4 md:mx-0 md:mt-0">
      <div className="rounded-b-[2.5rem] bg-primary/80 px-5 pb-8 pt-16 md:rounded-[1.75rem]">
        <Skeleton className="mx-auto size-28 rounded-full opacity-60" />
        <Skeleton className="mx-auto mt-4 h-5 w-40 opacity-60" />
        <Skeleton className="mx-auto mt-2 h-4 w-56 opacity-60" />
      </div>
      <div className="space-y-3 p-5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
