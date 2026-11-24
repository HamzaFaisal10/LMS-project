import { useState } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks';
import { api } from '../../lib/api';
import { ICONS } from '../../components/CourseThumb';
import { PageLoader } from '../../components/ui';

export default function AdminCategories() {
  const { data, loading, reload } = useApi('/categories');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('BookOpen');

  const add = async (e) => {
    e.preventDefault();
    try {
      await api('/categories', { method: 'POST', body: { name, icon } });
      setName('');
      toast.success('Category added');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (c) => {
    try {
      await api(`/categories/${c._id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <PageLoader />;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold">Categories</h1>
      <p className="text-sm text-ink-muted">Organise the catalog.</p>
      <form onSubmit={add} className="card mt-6 flex flex-wrap gap-3 p-4">
        <input
          required
          minLength={2}
          className="input min-w-[200px] flex-1"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select className="input w-auto" value={icon} onChange={(e) => setIcon(e.target.value)}>
          {Object.keys(ICONS).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button className="btn-primary">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      <ul className="card mt-4 divide-y divide-line">
        {data.map((c) => {
          const Icon = ICONS[c.icon] || BookOpen;
          return (
            <li key={c._id} className="flex items-center gap-3 px-5 py-3">
              <span className="rounded-lg bg-brand-50 p-2 text-brand-600">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 font-medium">{c.name}</span>
              <span className="text-sm text-ink-muted">{c.courseCount} courses</span>
              <button
                onClick={() => remove(c)}
                className="btn-ghost px-2 text-rose-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
