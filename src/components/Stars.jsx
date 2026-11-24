import { Star } from 'lucide-react';

export default function Stars({ rating = 0, count, size = 'h-3.5 w-3.5' }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="font-bold text-amber-700">{Number(rating).toFixed(1)}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${size} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-ink-muted">({Number(count).toLocaleString()})</span>
      )}
    </div>
  );
}
