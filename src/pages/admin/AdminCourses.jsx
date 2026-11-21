import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Eye, X } from 'lucide-react';
import { useApi } from '../../hooks';
import { api } from '../../lib/api';
import CourseThumb from '../../components/CourseThumb';
import { EmptyState, Modal, PageLoader, StatusBadge } from '../../components/ui';
import { date, money } from '../../lib/format';

const FILTERS = [
  ['', 'All'],
  ['pending', 'Pending'],
  ['published', 'Published'],
  ['draft', 'Drafts'],
  ['rejected', 'Rejected'],
];

export default function AdminCourses() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const { data, loading, reload } = useApi(`/admin/courses${status ? `?status=${status}` : ''}`);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const approve = async (c) => {
    try {
      await api(`/admin/courses/${c._id}/approve`, { method: 'POST' });
      toast.success(`“${c.title}” is now live`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const reject = async (e) => {
    e.preventDefault();
    try {
      await api(`/admin/courses/${rejecting._id}/reject`, { method: 'POST', body: { reason } });
      toast.success('Feedback sent to the instructor');
      setRejecting(null);
      setReason('');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold">Courses</h1>
      <p className="text-sm text-slate-500">Review submissions and moderate the catalog.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map(([v, label]) => (
          <button
            key={v}
            onClick={() => setParams(v ? { status: v } : {})}
            className={status === v ? 'btn-primary py-2' : 'btn-secondary py-2'}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <PageLoader />
      ) : !data.length ? (
        <div className="mt-6">
          <EmptyState title="No courses here" text="Nothing matches this filter right now." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {data.map((c) => (
            <div key={c._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <CourseThumb course={c} className="aspect-video w-full shrink-0 rounded-xl sm:w-40" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-slate-500">{c.category?.name}</span>
                </div>
                <h3 className="mt-1 truncate font-bold">{c.title}</h3>
                <p className="text-sm text-slate-500">
                  by {c.instructor?.name} · {c.lessonCount} lessons · {money(c.price)} · updated{' '}
                  {date(c.updatedAt)}
                </p>
                {c.status === 'rejected' && (
                  <p className="mt-1 text-xs text-rose-600">Reason: {c.rejectionReason}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link to={`/courses/${c.slug}`} className="btn-secondary px-3" title="Preview">
                  <Eye className="h-4 w-4" />
                </Link>
                {c.status !== 'published' && (
                  <button
                    onClick={() => approve(c)}
                    className="btn bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                )}
                {c.status !== 'rejected' && (
                  <button onClick={() => setRejecting(c)} className="btn-secondary text-rose-600">
                    <X className="h-4 w-4" /> {c.status === 'published' ? 'Take down' : 'Reject'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={`Reject “${rejecting?.title}”`}
      >
        <form onSubmit={reject} className="space-y-4">
          <div>
            <label className="label">Feedback for the instructor</label>
            <textarea
              required
              minLength={3}
              rows={4}
              className="input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Please add a free preview lesson and a more detailed description."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRejecting(null)} className="btn-secondary">
              Cancel
            </button>
            <button className="btn-danger">Send feedback & reject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
