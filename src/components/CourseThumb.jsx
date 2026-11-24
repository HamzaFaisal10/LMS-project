import { BarChart3, BookOpen, Brain, Briefcase, Code2, Megaphone, Palette } from 'lucide-react';

export const ICONS = { Code2, BarChart3, Brain, Palette, Briefcase, Megaphone, BookOpen };

// Cohesive, professional artwork tones that match the ink + indigo brand.
export const THEMES = [
  'from-[#4F46E5] to-[#312E81]',
  'from-[#0B1220] to-[#1E293B]',
  'from-[#1E40AF] to-[#172554]',
  'from-[#0F766E] to-[#134E4A]',
  'from-[#3730A3] to-[#0B1220]',
  'from-[#334155] to-[#0F172A]',
  'from-[#4338CA] to-[#1E1B4B]',
  'from-[#1F2937] to-[#0B1220]',
];

// Generated course artwork: a gradient with the category icon and course title.
export default function CourseThumb({ course, className = '', big }) {
  const Icon = ICONS[course?.category?.icon] || BookOpen;
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${THEMES[(course?.theme || 0) % THEMES.length]} ${className}`}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.06]" />
      <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-[#A3E635]" />
      <Icon
        className={`absolute right-4 top-4 text-white/15 ${big ? 'h-24 w-24' : 'h-14 w-14'}`}
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
