import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-24" />
      <div className="space-y-2 border-b border-border pb-3">
        <Skeleton className="h-5 w-64" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-72" />
    </div>
  );
}
