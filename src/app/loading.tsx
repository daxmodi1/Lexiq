export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Sidebar placeholder */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-surface-low" />
      <div className="lg:pl-64">
        {/* TopBar placeholder */}
        <div className="h-16 glass-strong border-b border-ghost" />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
            <div className="bg-surface-low rounded-2xl p-8 lg:p-12">
              <div className="skeleton h-10 w-64 mb-4" />
              <div className="skeleton h-5 w-96" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-surface-low rounded-2xl p-5">
                  <div className="skeleton h-5 w-20 mb-3" />
                  <div className="skeleton h-8 w-12" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-surface-low rounded-2xl p-6 h-64" />
              <div className="bg-surface-low rounded-2xl p-6 h-64" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
