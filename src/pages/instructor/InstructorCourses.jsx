import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpen, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks';
import { api } from '../../lib/api';
import CourseThumb from '../../components/CourseThumb';
import { EmptyState, Modal, PageLoader, StatusBadge } from '../../components/ui';
import { money, usd } from '../../lib/format';

export default function InstructorCourses() {
  const { data, loading, reload } = useApi('/instructor/courses');
  const { data: categories } = useApi('/categories');
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(params.get('new') === '1');
  const [form, setForm] = useState({ title: '', category: '', price: 0, level: 'Beginner' });
  const navigate = useNavigate();

  useEffect(() => {
    if (params.get('new') === '1') setParams({}, { replace: true });
  }, [params, setParams]);

  const create = async (e) => {
    e.preventDefault();
    try {
      const course = await api('/instructor/courses', {
        method: 'POST',
        body: { ...form, category: form.category || categories?.[0]?._id },
      });
      toast.success('Draft created — now add your lessons');
      navigate(`/instructor/courses/${course._id}?tab=curriculum`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete “${c.title}”? This cannot be undone.`)) return;
    try {
      await api(`/instructor/courses/${c._id}`, { method: 'DELETE' });
      toast.success('Course deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">My courses</h1>
          <p className="text-sm text-ink-muted">Create, edit and publish your courses.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New course
        </button>
      </div>

      {!data.length ? (
        <div className="mt-6">
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            text="Create your first course in a few minutes."
            action={
              <button onClick={() => setOpen(true)} className="btn-primary">
                Create course
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((c) => (
            <div key={c._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <CourseThumb course={c} className="aspect-video w-full shrink-0 rounded-xl sm:w-44" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-ink-muted">{c.category?.name}</span>
                </div>
                <h3 className="mt-1 truncate font-bold">{c.title}</h3>
                <p className="text-sm text-ink-muted">
                  {c.lessonCount} lessons · {money(c.price)}
                </p>
                {c.status === 'rejected' && c.rejectionReason && (
                  <p className="mt-1 text-xs text-rose-600">Admin feedback: {c.rejectionReason}</p>
                )}
              </div>
              <div className="flex gap-6 text-center text-sm">
                <div>
                  <p className="font-bold">{c.enrollments}</p>
                  <p className="text-xs text-ink-muted">Students</p>
                </div>
                <div>
                  <p className="font-bold">{usd(c.revenue)}</p>
                  <p className="text-xs text-ink-muted">Revenue</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Link
                  to={`/instructor/courses/${c._id}`}
                  className="btn-secondary px-3"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <Link to={`/courses/${c.slug}`} className="btn-secondary px-3" title="Preview">
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => remove(c)}
                  className="btn-secondary px-3 text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create a new course">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Course title</label>
            <input
              required
              minLength={5}
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Node.js for Beginners"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {(categories || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Level</label>
              <select
                className="input"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Price (USD, 0 = free)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button className="btn-primary">Create draft</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
