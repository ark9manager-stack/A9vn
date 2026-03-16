import { cn } from "@/lib/utils";

export default function SkeletonCard({ className }) {
  return (
    <div className={cn("ark-card p-4 space-y-3", className)}>
      <div className="skeleton-shimmer h-32 w-full" />
      <div className="skeleton-shimmer h-4 w-3/4" />
      <div className="skeleton-shimmer h-3 w-1/2" />
    </div>
  );
}
