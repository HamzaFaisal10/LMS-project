import { Link } from 'react-router-dom';
import { BookOpen, Clock, DollarSign, Users } from 'lucide-react';
import { useApi } from '../../hooks';
import RevenueChart from '../../components/RevenueChart';
import { Avatar, PageLoader, StatCard, StatusBadge } from '../../components/ui';
import { date, usd } from '../../lib/format';

export default function AdminDashboard() {
  const { data, loading } = useApi('/admin/stats');
  if (loading) return <PageLoader />;
  const { totals, monthly, recentUsers, pending } = data;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold">Platform overview</h1>
      <p className="text-sm text-slate-500">Everything happening on LearnHub at a glance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={usd(totals.revenue)}
          hint={`${totals.orders} paid orders`}
          tone="green"
        />
        <StatCard
          icon={Users}
          label="Users"
          value={totals.users}
          hint={`${totals.students} students · ${totals.instructors} instructors`}
        />
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={totals.courses}
          hint={`${totals.published} published · ${totals.enrollments} enrollments`}
          tone="violet"
        />
        <StatCard
          icon={Clock}
          label="Awaiting review"
          value={totals.pending}
          hint="Courses pending approval"
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-bold">Platform revenue — last 6 months</h2>
          <RevenueChart data={monthly} />
        </div>
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Pending approval</h2>
            <Link
              to="/admin/courses?status=pending"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Review
            </Link>
          </div>
          {pending.length ? (
            <ul className="space-y-3">
              {pending.map((c) => (
                <li key={c._id} className="rounded-xl bg-amber-50/60 p-3">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-xs text-slate-500">
                    by {c.instructor?.name} · {date(c.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Nothing to review — all caught up. ✅</p>
          )}
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Newest members</h2>
          <Link to="/admin/users" className="text-sm font-semibold text-brand-600 hover:underline">
            All users
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentUsers.map((u) => (
            <li key={u._id} className="flex items-center gap-3 py-3">
              <Avatar name={u.name} size="h-9 w-9 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{u.name}</p>
                <p className="truncate text-xs text-slate-500">{u.email}</p>
              </div>
              <StatusBadge status={u.role} />
              <span className="hidden text-xs text-slate-500 sm:block">{date(u.createdAt)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
