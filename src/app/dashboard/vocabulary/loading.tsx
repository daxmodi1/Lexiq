import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 animate-pulse">
        <div className="skeleton h-10 w-48 mb-3" />
        <div className="skeleton h-5 w-72" />
      </div>
      <LoadingSkeleton type="list" />
    </div>
  );
}
