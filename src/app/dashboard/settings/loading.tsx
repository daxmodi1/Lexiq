import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import AppShell from '@/components/layout/AppShell';

export default function Loading() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="skeleton h-10 w-48 mb-3" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
        <LoadingSkeleton type="card" />
      </div>
    </AppShell>
  );
}
