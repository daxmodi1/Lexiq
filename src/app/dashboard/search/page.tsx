import { Suspense } from 'react';
import SearchContent from '@/components/search/SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
