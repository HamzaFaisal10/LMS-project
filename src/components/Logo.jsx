import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-sm">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span
        className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}
      >
        Learn<span className={light ? 'text-brand-200' : 'text-brand-600'}>Hub</span>
      </span>
    </Link>
  );
}
