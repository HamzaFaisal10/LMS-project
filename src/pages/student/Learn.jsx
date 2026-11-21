import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  ListChecks,
  Menu,
  PlayCircle,
  X,
} from 'lucide-react';
import { useApi } from '../../hooks';
import { api, tokenStore } from '../../lib/api';
import VideoPlayer from '../../components/VideoPlayer';
import { EmptyState, PageLoader, ProgressBar } from '../../components/ui';
import { minutes } from '../../lib/format';
import QuizRunner from './QuizRunner';

export default function Learn() {
  const { courseId } = useParams();
  const [params, setParams] = useSearchParams();
  const { data, loading, error, setData, reload } = useApi(`/learn/${courseId}`);
  const [sidebar, setSidebar] = useState(true);

  const lessons = useMemo(
    () =>
      data
        ? data.course.sections.flatMap((s) => s.lessons.map((l) => ({ ...l, section: s.title })))
        : [],
    [data],
  );
  const quizId = params.get('quiz');
  const lessonId = params.get('lesson') || data?.enrollment?.lastLesson || lessons[0]?._id;
  const index = lessons.findIndex((l) => l._id === lessonId);
  const lesson = lessons[index] || lessons[0];
  const completed = new Set(data?.enrollment?.completedLessons || []);

  useEffect(() => {
    if (lesson && data?.enrollment && !quizId)
      api(`/learn/${courseId}/lessons/${lesson._id}/open`, { method: 'POST' }).catch(() => {});
  }, [lesson?._id, courseId, quizId, data?.enrollment]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PlayCircle}
          title="You don't have access to this course"
          text={error.message}
          action={
            <Link to="/courses" className="btn-primary">
              Browse courses
            </Link>
          }
        />
      </div>
    );

  const { course, enrollment, quizzes } = data;
  const go = (id) => setParams({ lesson: id });

  const toggle = async (id, value) => {
    try {
      const updated = await api(`/learn/${courseId}/lessons/${id}/complete`, {
        method: 'POST',
        body: value === undefined ? {} : { completed: value },
      });
      if (updated.preview)
        return toast('Preview mode — progress is only tracked for students', { icon: 'ℹ️' });
      const before = enrollment.progress;
      setData({ ...data, enrollment: updated });
      if (updated.progress === 100 && before < 100)
        toast.success('🎉 Course complete! Amazing work.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const completeAndNext = async () => {
    if (!completed.has(lesson._id)) await toggle(lesson._id, true);
    if (lessons[index + 1]) go(lessons[index + 1]._id);
  };

  const download = async (r) => {
    try {
      const res = await fetch(`/api/files/${r.file}`, {
        headers: { Authorization: `Bearer ${tokenStore.get()}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement('a'), { href: url, download: r.name });
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="flex h-14 items-center gap-4 border-b border-white/10 px-4 text-white">
        <Link
          to={enrollment ? '/my-learning' : '/instructor/courses'}
          className="flex items-center gap-1 text-sm text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="h-5 w-px bg-white/15" />
        <p className="truncate font-semibold">{course.title}</p>
        {enrollment && (
          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <div className="w-40">
              <ProgressBar value={enrollment.progress} className="bg-white/10" />
            </div>
            <span className="text-sm text-slate-300">{enrollment.progress}% complete</span>
          </div>
        )}
        <button
          onClick={() => setSidebar((s) => !s)}
          className="ml-auto rounded-lg p-2 hover:bg-white/10 sm:ml-0"
        >
          {sidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">
          {quizId ? (
            <QuizRunner
              quizId={quizId}
              onBack={() => setParams({ lesson: lesson._id })}
              onFinished={reload}
            />
          ) : (
            <>
              <VideoPlayer
                url={lesson?.videoUrl}
                title={lesson?.title}
                onEnded={() => enrollment && !completed.has(lesson._id) && toggle(lesson._id, true)}
              />
              <div className="mx-auto max-w-4xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {lesson?.section}
                </p>
                <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
                  <h1 className="text-2xl font-extrabold">{lesson?.title}</h1>
                  {enrollment && (
                    <button
                      onClick={() => toggle(lesson._id)}
                      className={
                        completed.has(lesson._id)
                          ? 'btn bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'btn-secondary'
                      }
                    >
                      {completed.has(lesson._id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4" /> Mark as complete
                        </>
                      )}
                    </button>
                  )}
                </div>
                {lesson?.description && (
                  <p className="mt-4 leading-relaxed text-slate-600">{lesson.description}</p>
                )}

                {lesson?.resources?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold">Resources</h3>
                    <ul className="mt-2 space-y-2">
                      {lesson.resources.map((r) => (
                        <li key={r._id}>
                          <button
                            onClick={() => download(r)}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm hover:bg-slate-50"
                          >
                            <span className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-brand-600" /> {r.name}
                            </span>
                            <Download className="h-4 w-4 text-slate-400" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
                  <button
                    disabled={index <= 0}
                    onClick={() => go(lessons[index - 1]._id)}
                    className="btn-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </button>
                  {lessons[index + 1] ? (
                    <button onClick={completeAndNext} className="btn-primary">
                      {enrollment ? 'Complete & continue' : 'Next lesson'}{' '}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : quizzes[0] ? (
                    <button
                      onClick={async () => {
                        if (enrollment && !completed.has(lesson._id))
                          await toggle(lesson._id, true);
                        setParams({ quiz: quizzes[0]._id });
                      }}
                      className="btn-primary"
                    >
                      Take the final quiz <ListChecks className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </main>

        {sidebar && (
          <aside className="fixed inset-y-14 right-0 z-30 w-80 overflow-y-auto border-l border-slate-200 bg-white sm:static">
            <div className="border-b border-slate-100 p-4">
              <h2 className="font-bold">Course content</h2>
              {enrollment && (
                <p className="text-xs text-slate-500">
                  {completed.size} of {lessons.length} lessons complete
                </p>
              )}
            </div>
            {course.sections.map((s, si) => (
              <div key={s._id}>
                <p className="bg-slate-50 px-4 py-2.5 text-sm font-semibold">
                  Section {si + 1}: {s.title}
                </p>
                {s.lessons.map((l) => {
                  const active = !quizId && l._id === lesson?._id;
                  return (
                    <div
                      key={l._id}
                      className={`flex items-start gap-3 px-4 py-3 text-sm ${active ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                    >
                      <button
                        onClick={() => enrollment && toggle(l._id)}
                        className="mt-0.5"
                        aria-label="Toggle complete"
                      >
                        {completed.has(l._id) ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" />
                        )}
                      </button>
                      <button onClick={() => go(l._id)} className="flex-1 text-left">
                        <span
                          className={active ? 'font-semibold text-brand-700' : 'text-slate-700'}
                        >
                          {l.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <PlayCircle className="h-3 w-3" /> {minutes(l.duration)}
                          {l.resources?.length ? ` · ${l.resources.length} file` : ''}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
            {quizzes.length > 0 && (
              <div>
                <p className="bg-slate-50 px-4 py-2.5 text-sm font-semibold">Assessment</p>
                {quizzes.map((q) => (
                  <button
                    key={q._id}
                    onClick={() => setParams({ quiz: q._id })}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm ${quizId === q._id ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                  >
                    {q.passed ? (
                      <Award className="mt-0.5 h-4 w-4 text-emerald-600" />
                    ) : (
                      <ListChecks className="mt-0.5 h-4 w-4 text-brand-600" />
                    )}
                    <span>
                      <span className="font-medium text-slate-700">{q.title}</span>
                      <span className="block text-xs text-slate-400">
                        {q.questionCount} questions ·{' '}
                        {q.bestScore !== null
                          ? `Best: ${q.bestScore}%`
                          : `Pass mark ${q.passingScore}%`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
