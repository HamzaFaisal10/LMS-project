import { Link } from 'react-router-dom';
import { BookOpen, DollarSign, GraduationCap, Plus, Star, TrendingUp } from 'lucide-react';
import { useApi } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import RevenueChart from '../../components/RevenueChart';
import { PageLoader, StatCard, StatusBadge } from '../../components/ui';
import { usd } from '../../lib/format';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { data, loading } = useApi('/instructor/stats');
  if (loading) return <PageLoader />;
  const { totals, monthly, courses } = data;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            Hi {user.name.split(' ')[0]}, here&apos;s how your courses are doing
          </h1>
          <p className="text-sm text-ink-muted">Overview of students, revenue and performance.</p>
        </div>
        <Link to="/instructor/courses?new=1" className="btn-primary">
          <Plus className="h-4 w-4" /> New course
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={usd(totals.revenue)}
          hint={`${usd(totals.revenue30d)} in the last 30 days`}
          tone="green"
        />
        <StatCard
          icon={GraduationCap}
          label="Students"
          value={totals.students}
          hint={`${totals.enrollments} total enrollments`}
        />
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={totals.courses}
          hint={`${totals.published} published`}
          tone="violet"
        />
        <StatCard
          icon={Star}
          label="Average rating"
          value={totals.rating || '—'}
          hint={`${totals.completionRate}% completion rate`}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Revenue — last 6 months</h2>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> {monthly.reduce((n, m) => n + m.sales, 0)}{' '}
              sales
            </span>
          </div>
          <RevenueChart data={monthly} />
        </div>
        <div className="card p-6">
          <h2 className="mb-4 font-bold">Top courses</h2>
          <ul className="space-y-4">
            {courses.slice(0, 5).map((c) => (
              <li key={c._id}>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/instructor/courses/${c._id}`}
                    className="line-clamp-2 text-sm font-semibold hover:text-brand-700"
                  >
                    {c.title}
                  </Link>
                  <span className="text-sm font-bold">{usd(c.revenue)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                  <StatusBadge status={c.status} /> {c.students} students
                </div>
              </li>
            ))}
            {!courses.length && (
              <p className="text-sm text-ink-muted">Create your first course to see stats here.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
