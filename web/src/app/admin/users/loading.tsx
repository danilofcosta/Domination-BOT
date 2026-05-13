export default function UsersLoading() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-amber-900/20 to-background animate-pulse">
      <div className="flex flex-col mb-8 px-4 lg:px-6 pt-4">
        <div className="h-8 w-48 rounded-xl bg-muted" />
        <div className="h-1 w-12 bg-muted rounded-full mt-1" />
        <div className="h-4 w-64 rounded-lg bg-muted mt-2" />
      </div>
      <div className="px-4 lg:px-6 space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
