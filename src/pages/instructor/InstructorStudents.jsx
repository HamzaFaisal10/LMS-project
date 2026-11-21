import { useState } from 'react';
import { Users } from 'lucide-react';
import { useApi } from '../../hooks';
import { Avatar, EmptyState, PageLoader, ProgressBar } from '../../components/ui';
import { date } from '../../lib/format';

export default function InstructorStudents() {
  const [course, setCourse] = useState('');
  const { data: courses } = useApi('/instructor/courses');
  const { data, loading } = useApi(`/instructor/students${course ? `?course=${course}` : ''}`);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Students</h1>
          <p className="text-sm text-slate-500">
            Everyone learning from your courses and how far they&apos;ve got.
          </p>
        </div>
        <select className="input w-auto" value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">All courses</option>
          {(courses || []).map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <PageLoader />
      ) : !data.length ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="No students yet"
            text="Once learners enroll they will appear here."
          />
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Enrolled</th>
                <th className="w-48 px-5 py-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((e) => (
                <tr key={e._id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.user.name} size="h-8 w-8 text-xs" />
                      <div>
                        <p className="font-medium">{e.user.name}</p>
                        <p className="text-xs text-slate-500">{e.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{e.course.title}</td>
                  <td className="px-5 py-3 text-slate-500">{date(e.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={e.progress} />
                      <span className="w-9 text-xs font-semibold">{e.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
