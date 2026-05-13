export default function AdminLoading() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 pb-24">
      <div className="space-y-8 lg:space-y-12 animate-pulse">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-10 w-64 rounded-xl bg-muted" />
          <div className="h-4 w-48 rounded-lg bg-muted" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-64 rounded-2xl bg-muted" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="h-80 rounded-2xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
