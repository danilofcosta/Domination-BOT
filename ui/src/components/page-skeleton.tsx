import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">{children}</div>
  );
}

export function PageHeaderSkeleton({ actions = 1 }: { actions?: number }) {
  return (
    <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-48 max-w-[60vw]" />
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.max(1, actions) }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      </div>
    </header>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2.5 h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({
  rows = 5,
  title = true,
}: {
  rows?: number;
  title?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
      {title && <Skeleton className="h-5 w-40" />}
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 w-full"
            style={{ width: `${100 - ((i * 13) % 35)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function GridCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function FiltersBarSkeleton() {
  const widths = [10, 28, 20, 16, 18, 22];
  return (
    <div className="flex flex-wrap items-end gap-3">
      {widths.map((w, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton
            className="h-9 rounded-lg"
            style={{ width: `${w * 4}px` }}
          />
        </div>
      ))}
      <Skeleton className="h-9 w-20 rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
      <Skeleton className="h-5 w-44" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-3.5 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-8 w-full"
            style={{ width: `${100 - ((i * 9) % 30)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function GallerySkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="mb-4 inline-block w-full rounded-xl"
          style={{ height: `${120 + ((i * 37) % 140)}px` }}
        />
      ))}
    </div>
  );
}

export function RankingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PanelSkeleton rows={5} />
      <PanelSkeleton rows={5} />
    </div>
  );
}
