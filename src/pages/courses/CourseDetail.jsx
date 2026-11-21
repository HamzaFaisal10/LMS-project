import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BarChart,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Globe,
  Lock,
  PlayCircle,
  Users,
} from 'lucide-react';
import { useApi } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import CourseThumb from '../../components/CourseThumb';
import Stars from '../../components/Stars';
import VideoPlayer from '../../components/VideoPlayer';
import { Avatar, EmptyState, Modal, PageLoader, Spinner } from '../../components/ui';
import { minutes, money } from '../../lib/format';

export default function CourseDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: course, loading, error } = useApi(`/courses/${slug}`);
  const [open, setOpen] = useState({ 0: true });
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Course not found"
          text="It may have been removed or is not published yet."
        />
      </div>
    );

  const firstLessonPath = `/learn/${course._id}`;
  const enroll = async () => {
    if (!user) return navigate('/login', { state: { from: `/courses/${slug}` } });
    if (course.isEnrolled) return navigate(firstLessonPath);
    if (course.price > 0) return navigate(`/checkout/${slug}`);
    setBusy(true);
    try {
      await api(`/enrollments/${course._id}`, { method: 'POST' });
      toast.success('You are enrolled — happy learning!');
      navigate(firstLessonPath);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isOwner = user && (user._id === course.instructor._id || user.role === 'admin');
  const ctaLabel = course.isEnrolled
    ? 'Go to course'
    : course.price > 0
      ? 'Buy now'
      : 'Enroll for free';

  const Card = (
    <div className="card overflow-hidden">
      <CourseThumb course={course} className="aspect-video" big />
      <div className="p-6">
        <p
          className={`font-display text-3xl font-extrabold ${course.price === 0 ? 'text-emerald-600' : ''}`}
        >
          {money(course.price)}
        </p>
        {user && user.role !== 'student' && !course.isEnrolled ? (
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            {isOwner
              ? 'You are viewing your own course.'
              : 'Log in as a student to enroll in courses.'}
          </p>
        ) : (
          <button
            onClick={enroll}
            disabled={busy}
            className="btn-primary mt-4 w-full py-3 text-base"
          >
            {busy && <Spinner className="h-4 w-4 text-white" />} {ctaLabel}
          </button>
        )}
        {course.price > 0 && !course.isEnrolled && (
          <p className="mt-2 text-center text-xs text-slate-500">30-day money-back guarantee</p>
        )}
        <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" /> {course.lessonCount} video lessons
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> {minutes(course.totalMinutes)} of content
          </li>
          <li className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Quizzes & downloadable resources
          </li>
          <li className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Full lifetime access
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <section className="bg-slate-950 text-white">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex gap-2 text-sm text-brand-300">
              <Link to="/courses" className="hover:underline">
                Courses
              </Link>{' '}
              /
              <Link to={`/courses?category=${course.category?.slug}`} className="hover:underline">
                {course.category?.name}
              </Link>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{course.title}</h1>
            <p className="mt-3 text-lg text-slate-300">{course.subtitle}</p>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
              <Stars rating={course.rating} count={course.ratingCount} />
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="h-4 w-4" /> {course.studentsCount.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <BarChart className="h-4 w-4" /> {course.level}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Created by{' '}
              <span className="font-semibold text-brand-300">{course.instructor.name}</span> ·{' '}
              {course.language}
            </p>
            {course.status !== 'published' && (
              <p className="mt-4 inline-block rounded-lg bg-amber-500/20 px-3 py-1.5 text-sm text-amber-200">
                Preview — this course is {course.status}
              </p>
            )}
          </div>
          <div className="lg:hidden">{Card}</div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {course.outcomes?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold">What you&apos;ll learn</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold">Course content</h2>
            <p className="mt-1 text-sm text-slate-500">
              {course.sections.length} sections · {course.lessonCount} lessons ·{' '}
              {minutes(course.totalMinutes)} total
            </p>
            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {course.sections.map((s, i) => (
                <div key={s._id}>
                  <button
                    onClick={() => setOpen({ ...open, [i]: !open[i] })}
                    className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <ChevronDown
                        className={`h-4 w-4 transition ${open[i] ? '' : '-rotate-90'}`}
                      />{' '}
                      {s.title}
                    </span>
                    <span className="text-xs text-slate-500">{s.lessons.length} lessons</span>
                  </button>
                  {open[i] && (
                    <ul>
                      {s.lessons.map((l) => (
                        <li
                          key={l._id}
                          className="flex items-center justify-between px-5 py-3 text-sm"
                        >
                          <span className="flex items-center gap-3 text-slate-700">
                            {l.isPreview ? (
                              <PlayCircle className="h-4 w-4 text-brand-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-slate-300" />
                            )}
                            {l.isPreview ? (
                              <button
                                onClick={() => setPreview(l)}
                                className="text-brand-700 hover:underline"
                              >
                                {l.title}
                              </button>
                            ) : (
                              l.title
                            )}
                            {l.isPreview && (
                              <span className="badge bg-brand-50 text-brand-700">Preview</span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500">{minutes(l.duration)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {course.requirements?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold">Requirements</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {course.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold">Description</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
              {course.description}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold">Your instructor</h2>
            <div className="mt-4 flex items-center gap-4">
              <Avatar name={course.instructor.name} size="h-16 w-16 text-xl" />
              <div>
                <p className="text-lg font-bold text-brand-700">{course.instructor.name}</p>
                <p className="text-sm text-slate-500">{course.instructor.headline}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-6 text-sm text-slate-600">
              <span>⭐ {course.instructorStats.rating} rating</span>
              <span>{course.instructorStats.students.toLocaleString()} students</span>
              <span>{course.instructorStats.courses} courses</span>
            </div>
            {course.instructor.bio && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{course.instructor.bio}</p>
            )}
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24 -mt-64">{Card}</div>
        </aside>
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title} wide>
        <VideoPlayer url={preview?.videoUrl} title={preview?.title} />
      </Modal>
    </>
  );
}
