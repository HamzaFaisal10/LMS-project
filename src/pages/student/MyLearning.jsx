import { Link } from 'react-router-dom';
import { Award, BookOpen, Clock, PlayCircle, Trophy } from 'lucide-react';
import { useApi } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import CourseThumb from '../../components/CourseThumb';
import { EmptyState, PageLoader, ProgressBar, StatCard } from '../../components/ui';

export default function MyLearning() {
  const { user } = useAuth();
  const { data, loading } = useApi('/enrollments/me');
  if (loading) return <PageLoader />;

  const list = data || [];
  const inProgress = list.filter((e) => e.progress < 100);
  const completed = list.filter((e) => e.progress === 100);
  const resume = inProgress.find((e) => e.progress > 0) || inProgress[0];
  const lessonsDone = list.reduce((n, e) => n + e.completedLessons.length, 0);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">Welcome back, {user.name.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-slate-500">Pick up where you left off and keep your streak going.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Enrolled courses" value={list.length} />
        <StatCard icon={Clock} label="In progress" value={inProgress.length} tone="amber" />
        <StatCard icon={Trophy} label="Completed" value={completed.length} tone="green" />
        <StatCard icon={PlayCircle} label="Lessons finished" value={lessonsDone} tone="violet" />
      </div>

      {resume && (
        <div className="card mt-8 flex flex-col gap-6 overflow-hidden p-0 sm:flex-row">
          <CourseThumb course={resume.course} className="aspect-video sm:aspect-auto sm:w-72" />
          <div className="flex flex-1 flex-col justify-center p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Continue learning
            </p>
            <h2 className="mt-1 text-xl font-bold">{resume.course.title}</h2>
            <p className="text-sm text-slate-500">{resume.course.instructor?.name}</p>
            <div className="mt-4 flex items-center gap-3">
              <ProgressBar value={resume.progress} />
              <span className="text-sm font-semibold">{resume.progress}%</span>
            </div>
            <Link to={`/learn/${resume.course._id}`} className="btn-primary mt-5 self-start">
              <PlayCircle className="h-4 w-4" /> Resume course
            </Link>
          </div>
        </div>
      )}

      <h2 className="mt-12 text-xl font-bold">My courses</h2>
      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={BookOpen}
            title="You haven't enrolled yet"
            text="Browse the catalog and start your first course today."
            action={
              <Link to="/courses" className="btn-primary">
                Explore courses
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <Link
              key={e._id}
              to={`/learn/${e.course._id}`}
              className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <CourseThumb course={e.course} className="aspect-video" />
              <div className="p-4">
                <h3 className="line-clamp-2 font-bold group-hover:text-brand-700">
                  {e.course.title}
                </h3>
                <p className="text-xs text-slate-500">{e.course.instructor?.name}</p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={e.progress} />
                  <span className="text-xs font-semibold text-slate-600">{e.progress}%</span>
                </div>
                {e.progress === 100 ? (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Award className="h-4 w-4" /> Completed
                  </p>
                ) : (
                  <p className="mt-3 text-sm font-semibold text-brand-600">
                    {e.progress === 0 ? 'Start course' : 'Continue'} →
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
