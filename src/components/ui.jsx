import { Loader2 } from 'lucide-react';
import { initials } from '../lib/format';

export function Spinner({ className = '' }) {
  return <Loader2 className={`h-5 w-5 animate-spin text-brand-600 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-brand-50 p-4 text-brand-600">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const AVATAR_TONES = [
  'bg-brand-100 text-brand-700',
  'bg-[#DDEFEA] text-[#0B4F44]',
  'bg-[#F3E3A6] text-[#5C4A0B]',
  'bg-[#F6C9B9] text-[#7A2E1A]',
  'bg-ink text-white',
];

export function Avatar({ name, size = 'h-9 w-9 text-sm', className = '' }) {
  const tone =
    AVATAR_TONES[[...(name || 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${tone} ${size} ${className}`}
    >
      {initials(name)}
    </div>
  );
}

export function ProgressBar({ value, className = '' }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full rounded-full bg-brand-600 transition-all"
        style={{ width: `${Math.min(100, value || 0)}%` }}
      />
    </div>
  );
}

const STATUS = {
  published: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  draft: 'bg-slate-100 text-ink-soft',
  rejected: 'bg-rose-50 text-rose-700',
  paid: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-rose-50 text-rose-700',
  student: 'bg-sky-50 text-sky-700',
  instructor: 'bg-violet-50 text-violet-700',
  admin: 'bg-slate-900 text-white',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge capitalize ${STATUS[status] || 'bg-slate-100 text-ink-soft'}`}>
      {status}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        {Icon && (
          <div className={`rounded-lg p-2 ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={onClose}
    >
      <div
        className={`card max-h-[90vh] w-full overflow-y-auto p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
