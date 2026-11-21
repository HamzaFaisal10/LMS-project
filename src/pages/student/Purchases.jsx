import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { useApi } from '../../hooks';
import { EmptyState, PageLoader, StatusBadge } from '../../components/ui';
import { date, money } from '../../lib/format';

export default function Purchases() {
  const { data, loading } = useApi('/checkout/history');
  if (loading) return <PageLoader />;
  return (
    <div className="container-page max-w-4xl py-10">
      <h1 className="text-3xl font-extrabold">Purchase history</h1>
      <p className="mt-1 text-slate-500">All your course payments in one place.</p>
      <div className="mt-8">
        {!data?.length ? (
          <EmptyState
            icon={Receipt}
            title="No purchases yet"
            text="Paid courses you buy will show up here."
            action={
              <Link to="/courses" className="btn-primary">
                Browse courses
              </Link>
            }
          />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Card</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((p) => (
                  <tr key={p._id}>
                    <td className="px-5 py-3 font-medium">
                      {p.course ? (
                        <Link to={`/courses/${p.course.slug}`} className="hover:text-brand-700">
                          {p.course.title}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{date(p.createdAt)}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {p.cardBrand} •••• {p.cardLast4}
                    </td>
                    <td className="px-5 py-3 font-semibold">{money(p.amount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
