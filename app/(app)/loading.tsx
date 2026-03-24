export default function Loading() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-[hsl(var(--muted))] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] animate-pulse" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
