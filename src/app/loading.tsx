export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
      <div className="animate-pulse border-b border-border-subtle pb-10 pt-14 sm:pt-20">
        <div className="h-3 w-24 rounded bg-surface" />
        <div className="mt-5 h-9 w-56 rounded bg-surface" />
        <div className="mt-4 h-4 w-72 rounded bg-surface" />
      </div>

      <div className="mt-6 space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-4 border-b border-border-subtle py-5 sm:gap-8"
          >
            <div className="h-8 w-10 shrink-0 rounded bg-surface" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 rounded bg-surface" />
              <div className="h-4 w-2/3 rounded bg-surface" />
              <div className="h-3 w-full rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
