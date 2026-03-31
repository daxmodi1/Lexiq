'use client';

export default function LoadingSkeleton({ type = 'page' }: { type?: 'page' | 'card' | 'list' }) {
  if (type === 'card') {
    return (
      <div className="bg-surface-low rounded-2xl p-6 animate-pulse">
        <div className="skeleton h-6 w-32 mb-4" />
        <div className="skeleton h-4 w-full mb-3" />
        <div className="skeleton h-4 w-3/4" />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-surface-low rounded-xl p-4 flex items-center gap-4 animate-pulse">
            <div className="skeleton w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <div className="skeleton h-5 w-32 mb-2" />
              <div className="skeleton h-4 w-48" />
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Full page skeleton
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-surface-low rounded-2xl p-8 lg:p-12">
        <div className="skeleton h-10 w-64 mb-4" />
        <div className="skeleton h-5 w-96 mb-2" />
        <div className="skeleton h-5 w-80" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-low rounded-2xl p-5">
            <div className="skeleton h-5 w-20 mb-3" />
            <div className="skeleton h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-low rounded-2xl p-6 h-64">
          <div className="skeleton h-6 w-40 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-4 flex-1 rounded-full" />
                <div className="skeleton h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface-low rounded-2xl p-6 h-64 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-surface-container rounded-xl">
              <div className="skeleton w-11 h-11 rounded-xl" />
              <div className="flex-1">
                <div className="skeleton h-5 w-28 mb-1" />
                <div className="skeleton h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
