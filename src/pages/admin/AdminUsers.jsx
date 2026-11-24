import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { useApi } from '../../hooks';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, PageLoader } from '../../components/ui';
import { date } from '../../lib/format';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, setData } = useApi(
    `/admin/users?role=${role}&q=${encodeURIComponent(query)}`,
  );

  const patch = async (u, body) => {
    try {
      const updated = await api(`/admin/users/${u._id}`, { method: 'PATCH', body });
      setData(data.map((x) => (x._id === u._id ? updated : x)));
      toast.success('User updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className="text-sm text-ink-muted">Manage roles and account access.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(q);
          }}
          className="relative min-w-[240px] flex-1"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or email, press Enter"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
        <select className="input w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {loading ? (
        <PageLoader />
      ) : (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((u) => (
                <tr key={u._id} className={u.isBlocked ? 'bg-rose-50/40' : ''}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="h-8 w-8 text-xs" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-ink-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{date(u.createdAt)}</td>
                  <td className="px-5 py-3">
                    <select
                      disabled={u._id === me._id}
                      className="input w-auto py-1.5"
                      value={u.role}
                      onChange={(e) => patch(u, { role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    {u.isBlocked ? (
                      <span className="badge bg-rose-100 text-rose-700">Blocked</span>
                    ) : (
                      <span className="badge bg-emerald-50 text-emerald-700">Active</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u._id !== me._id && (
                      <button
                        onClick={() => patch(u, { isBlocked: !u.isBlocked })}
                        className={
                          u.isBlocked
                            ? 'btn-secondary py-1.5'
                            : 'btn-secondary py-1.5 text-rose-600'
                        }
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.length && (
            <p className="p-8 text-center text-sm text-ink-muted">No users match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
