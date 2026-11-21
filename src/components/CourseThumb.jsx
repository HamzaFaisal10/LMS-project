import { BarChart3, BookOpen, Brain, Briefcase, Code2, Megaphone, Palette } from 'lucide-react';

export const ICONS = { Code2, BarChart3, Brain, Palette, Briefcase, Megaphone, BookOpen };

export const THEMES = [
  'from-indigo-500 via-brand-600 to-violet-700',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-sky-400 via-cyan-500 to-blue-600',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-fuchsia-500 via-purple-600 to-indigo-700',
  'from-pink-400 via-rose-500 to-red-500',
  'from-lime-400 via-green-500 to-emerald-600',
  'from-slate-700 via-slate-800 to-slate-900',
];

// Generated course artwork: a gradient with the category icon and course title.
export default function CourseThumb({ course, className = '', big }) {
  const Icon = ICONS[course?.category?.icon] || BookOpen;
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${THEMES[(course?.theme || 0) % THEMES.length]} ${className}`}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-4 h-32 w-32 rounded-full bg-black/10" />
      <Icon
        className={`absolute right-4 top-4 text-white/25 ${big ? 'h-24 w-24' : 'h-14 w-14'}`}
        strokeWidth={1.5}
      />
      <div className="relative flex h-full flex-col justify-end p-4">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">
          {course?.category?.name}
        </span>
        <p
          className={`line-clamp-2 font-display font-bold leading-snug text-white ${big ? 'text-2xl' : 'text-base'}`}
        >
          {course?.title}
        </p>
      </div>
    </div>
  );
}
