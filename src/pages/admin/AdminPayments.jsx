import { useState } from 'react';
import { useApi } from '../../hooks';
import { PageLoader, StatusBadge } from '../../components/ui';
import { date, money, usd } from '../../lib/format';

export default function AdminPayments() {
  const [status, setStatus] = useState('');
  const { data, loading } = useApi(`/admin/payments${status ? `?status=${status}` : ''}`);
  const total = (data || []).filter((p) => p.status === 'paid').reduce((n, p) => n + p.amount, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Payments</h1>
          <p className="text-sm text-slate-500">
            Every transaction processed on the platform (demo processor).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            Paid total: <b className="text-slate-900">{usd(total)}</b>
          </span>
          <select
            className="input w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      {loading ? (
        <PageLoader />
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Transaction</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((p) => (
                <tr key={p._id}>
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs">{p.transactionId}</p>
                    <p className="text-xs text-slate-500">
                      {p.cardBrand} •••• {p.cardLast4}
                    </p>
                  </td>
                  <td className="px-5 py-3">{p.user?.name || '—'}</td>
                  <td className="max-w-[220px] truncate px-5 py-3 text-slate-600">
                    {p.course?.title || '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{date(p.createdAt)}</td>
                  <td className="px-5 py-3 font-semibold">{money(p.amount)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.length && (
            <p className="p-8 text-center text-sm text-slate-500">No payments yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
