export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-[90vh] sm:min-h-[85vh] w-full overflow-hidden flex flex-col">
        <div className="absolute inset-0 z-0 bg-muted animate-pulse" />
        <div className="absolute inset-0 z-0 bg-linear-to-b from-transparent via-background/60 to-background" />

        <div className="relative z-10 max-w-7xl w-full mx-auto flex-1 flex flex-col justify-end pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20 items-center lg:items-end">
            <div className="w-64 sm:w-72 md:w-80 lg:w-[380px] shrink-0 aspect-[2/3] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] bg-muted animate-pulse" />

            <div className="flex-1 space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
              <div className="space-y-3 sm:space-y-4 w-full">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4">
                  <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                  <div className="h-6 w-32 rounded-full bg-muted animate-pulse" />
                </div>
                <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-3/4 rounded-xl bg-muted animate-pulse" />
                <div className="h-6 w-1/4 rounded-lg bg-muted animate-pulse" />
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="h-10 w-28 rounded-xl bg-muted animate-pulse" />
                <div className="h-10 w-28 rounded-xl bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
        <div className="lg:col-span-2 space-y-20">
          <section className="space-y-6 sm:space-y-8">
            <div className="h-10 w-48 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-5/6 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-4/6 rounded-lg bg-muted animate-pulse" />
            </div>
          </section>

          <section className="space-y-6 sm:space-y-10">
            <div className="h-10 w-40 rounded-xl bg-muted animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl sm:rounded-[2.5rem] bg-muted animate-pulse" />
              ))}
            </div>
          </section>

          <section className="space-y-6 sm:space-y-10">
            <div className="h-10 w-52 rounded-xl bg-muted animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] space-y-6 lg:space-y-8 bg-card/20 border border-primary/10">
            <div className="h-4 w-32 mx-auto rounded-lg bg-muted animate-pulse" />
            <div className="space-y-4 sm:space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl lg:rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
