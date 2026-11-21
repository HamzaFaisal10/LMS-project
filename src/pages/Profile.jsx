import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Avatar } from '../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    headline: user.headline || '',
    bio: user.bio || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const save = async (e) => {
    e.preventDefault();
    try {
      const d = await api('/auth/profile', { method: 'PUT', body: form });
      setUser(d.user);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    try {
      await api('/auth/password', { method: 'PUT', body: pw });
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-8 flex items-center gap-4">
        <Avatar name={user.name} size="h-16 w-16 text-xl" />
        <div>
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-sm capitalize text-slate-500">
            {user.role} · {user.email}
          </p>
        </div>
      </div>
      <form onSubmit={save} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Public profile</h2>
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Headline</label>
          <input
            className="input"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. Frontend developer"
          />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea
            rows={4}
            className="input"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <button className="btn-primary">Save changes</button>
      </form>
      <form onSubmit={changePw} className="card mt-6 space-y-4 p-6">
        <h2 className="text-lg font-bold">Change password</h2>
        {user.isDemo && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Demo account passwords can&apos;t be changed.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="password"
            className="input"
            placeholder="Current password"
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
          />
          <input
            type="password"
            className="input"
            placeholder="New password"
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
          />
        </div>
        <button className="btn-secondary" disabled={user.isDemo}>
          Update password
        </button>
      </form>
    </div>
  );
}
