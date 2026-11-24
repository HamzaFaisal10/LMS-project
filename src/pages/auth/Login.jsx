import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Presentation, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell';
import { useAuth, homeFor } from '../../context/AuthContext';
import { Spinner } from '../../components/ui';

const DEMOS = [
  { role: 'student', label: 'Student', icon: GraduationCap, tone: 'text-sky-600 bg-sky-50' },
  {
    role: 'instructor',
    label: 'Instructor',
    icon: Presentation,
    tone: 'text-violet-600 bg-violet-50',
  },
  { role: 'admin', label: 'Admin', icon: ShieldCheck, tone: 'text-ink bg-slate-100' },
];

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(null);

  const done = (user) => {
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    navigate(location.state?.from || homeFor(user), { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy('form');
    try {
      done(await login(form.email, form.password));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const demo = async (role) => {
    setBusy(role);
    try {
      done(await demoLogin(role));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue learning.">
      <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Explore the demo — one click login
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMOS.map(({ role, label, icon: Icon, tone }) => (
            <button
              key={role}
              onClick={() => demo(role)}
              disabled={!!busy}
              className="flex flex-col items-center gap-2 rounded-xl border border-line bg-white p-3 text-sm font-semibold text-ink-soft transition hover:border-brand-300 hover:shadow-card disabled:opacity-60"
            >
              <span className={`rounded-lg p-2 ${tone}`}>
                {busy === role ? <Spinner className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" /> or log in with email{' '}
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            required
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <button className="btn-primary w-full py-3" disabled={!!busy}>
          {busy === 'form' && <Spinner className="h-4 w-4 text-white" />} Log in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        New to LearnHub?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
