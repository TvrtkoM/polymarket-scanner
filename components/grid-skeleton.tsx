export function GridSkeleton({ length }: { length: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className="h-64 rounded-2xl border border-border bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}
