import { Link } from 'react-router-dom';
import { Clock, PlayCircle } from 'lucide-react';
import CourseThumb from './CourseThumb';
import Stars from './Stars';
import { minutes, money } from '../lib/format';

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      <CourseThumb course={course} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug group-hover:text-brand-700">
          {course.title}
        </h3>
        <p className="mt-1 text-xs text-ink-muted">{course.instructor?.name}</p>
        <div className="mt-2">
          <Stars rating={course.rating} count={course.ratingCount} />
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" /> {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {minutes(course.totalMinutes || 0)}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span
            className={`text-lg font-extrabold ${course.price === 0 ? 'text-emerald-600' : 'text-ink'}`}
          >
            {money(course.price)}
          </span>
          <span className="badge bg-slate-100 text-ink-soft">{course.level}</span>
        </div>
      </div>
    </Link>
  );
}
