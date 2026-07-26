/**
 * @param {{ variant: 'chat' | 'calendar' | 'tasks' | 'kanban' }} props
 */
export default function SkeletonLoader({ variant }) {
  if (variant === 'chat') {
    return (
      <div className="mx-auto w-full max-w-none space-y-4 px-4 py-4 sm:px-6 lg:max-w-[800px]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`flex items-start gap-3 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
            <div className="h-7 w-7 rounded-xl bg-surface-1 animate-pulse" />
            <div className="h-16 flex-1 rounded-2xl bg-surface-1 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-border-soft bg-surface-1 p-2 animate-pulse">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={`head-${index}`} className="h-6 rounded-lg bg-surface-2" />
        ))}
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={`cell-${index}`} className="min-h-[78px] rounded-xl bg-surface-2" />
        ))}
      </div>
    );
  }

  if (variant === 'tasks') {
    return (
      <div className="space-y-3 px-4 py-4 sm:px-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex min-h-11 items-center gap-3 rounded-2xl border border-border-soft bg-surface-1 px-4 py-3 animate-pulse">
            <div className="h-11 w-11 rounded-md bg-surface-2" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-surface-2" />
              <div className="h-2.5 w-1/2 rounded bg-surface-2" />
            </div>
            <div className="h-6 w-20 rounded-full bg-surface-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 gap-3 overflow-hidden bg-surface-0 p-4 animate-pulse sm:p-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="min-w-[260px] flex-1 rounded-2xl border border-border-soft bg-surface-1 p-3">
          <div className="mb-3 h-4 w-28 rounded bg-surface-2" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((__, cardIndex) => (
              <div key={cardIndex} className="rounded-2xl bg-surface-2 p-4">
                <div className="h-3 w-4/5 rounded bg-surface-1" />
                <div className="mt-3 h-5 w-20 rounded-full bg-surface-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}