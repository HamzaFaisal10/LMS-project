import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  GripVertical,
  Paperclip,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useApi } from '../../hooks';
import { api } from '../../lib/api';
import CourseThumb, { THEMES } from '../../components/CourseThumb';
import { PageLoader, Spinner, StatusBadge } from '../../components/ui';

const TABS = [
  ['details', 'Details'],
  ['curriculum', 'Curriculum'],
  ['quiz', 'Quiz'],
  ['publish', 'Publish'],
];

export default function CourseEditor() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'details';
  const { data, loading, setData } = useApi(`/instructor/courses/${id}`);

  if (loading) return <PageLoader />;
  const { course } = data;
  const update = (patch) => setData({ ...data, ...patch });

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/instructor/courses" className="btn-ghost -ml-3">
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={course.status} />
          </div>
          <h1 className="mt-1 text-2xl font-extrabold">{course.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/courses/${course.slug}`} className="btn-secondary">
            <Eye className="h-4 w-4" /> Preview page
          </Link>
          <Link to={`/learn/${course._id}`} className="btn-secondary">
            Open player
          </Link>
        </div>
      </div>
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setParams({ tab: key })}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'details' && (
          <DetailsTab course={course} onSaved={(c) => update({ course: { ...course, ...c } })} />
        )}
        {tab === 'curriculum' && (
          <CurriculumTab course={course} onSaved={(c) => update({ course: c })} />
        )}
        {tab === 'quiz' && (
          <QuizTab course={course} quiz={data.quiz} onSaved={(q) => update({ quiz: q })} />
        )}
        {tab === 'publish' && (
          <PublishTab
            course={course}
            quiz={data.quiz}
            onSaved={(c) => update({ course: { ...course, ...c } })}
          />
        )}
      </div>
    </div>
  );
}

function ListInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input"
              value={v}
              placeholder={placeholder}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="btn-secondary px-3"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...value, ''])}
          className="btn-ghost -ml-2 text-brand-600"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>
    </div>
  );
}

function DetailsTab({ course, onSaved }) {
  const { data: categories } = useApi('/categories');
  const [form, setForm] = useState({
    title: course.title,
    subtitle: course.subtitle || '',
    description: course.description || '',
    category: course.category?._id || course.category || '',
    level: course.level,
    language: course.language || 'English',
    price: course.price,
    theme: course.theme || 0,
    outcomes: course.outcomes || [],
    requirements: course.requirements || [],
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const selectedCategory = categories?.find((c) => c._id === form.category);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...form,
        outcomes: form.outcomes.filter(Boolean),
        requirements: form.requirements.filter(Boolean),
      };
      onSaved(await api(`/instructor/courses/${course._id}`, { method: 'PUT', body }));
      toast.success('Course details saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="card space-y-5 p-6">
        <div>
          <label className="label">Title</label>
          <input required className="input" value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label">Subtitle</label>
          <input
            className="input"
            value={form.subtitle}
            onChange={set('subtitle')}
            placeholder="One line that sells the course"
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            rows={6}
            className="input"
            value={form.description}
            onChange={set('description')}
            placeholder="What is this course about? Who is it for?"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {(categories || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Level</label>
            <select className="input" value={form.level} onChange={set('level')}>
              {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Language</label>
            <input className="input" value={form.language} onChange={set('language')} />
          </div>
          <div>
            <label className="label">Price (USD — 0 makes it free)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input"
              value={form.price}
              onChange={set('price')}
            />
          </div>
        </div>
        <ListInput
          label="What students will learn"
          value={form.outcomes}
          onChange={(v) => setForm({ ...form, outcomes: v })}
          placeholder="e.g. Build a REST API"
        />
        <ListInput
          label="Requirements"
          value={form.requirements}
          onChange={(v) => setForm({ ...form, requirements: v })}
          placeholder="e.g. Basic JavaScript"
        />
        <button disabled={busy} className="btn-primary">
          {busy && <Spinner className="h-4 w-4 text-white" />} Save details
        </button>
      </div>
      <div className="space-y-3">
        <p className="label">Course artwork</p>
        <CourseThumb
          course={{ ...form, category: selectedCategory }}
          className="aspect-video rounded-2xl"
        />
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t, i) => (
            <button
              type="button"
              key={t}
              onClick={() => setForm({ ...form, theme: i })}
              className={`aspect-square rounded-lg bg-gradient-to-br ${t} ${form.theme === i ? 'ring-4 ring-brand-300' : ''}`}
              aria-label={`Theme ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </form>
  );
}

const toEditable = (sections) =>
  sections.map((s) => ({
    ...s,
    lessons: s.lessons.map((l) => ({
      ...l,
      resources: (l.resources || []).map((r) => ({
        name: r.name,
        size: r.size,
        file: r.file?._id || r.file,
      })),
    })),
  }));

function CurriculumTab({ course, onSaved }) {
  const [sections, setSections] = useState(() => toEditable(course.sections));
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const warn = (e) => dirty && (e.preventDefault(), (e.returnValue = ''));
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (next) => {
    setSections(next);
    setDirty(true);
  };
  const updSection = (si, patch) =>
    change(sections.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const updLesson = (si, li, patch) =>
    updSection(si, {
      lessons: sections[si].lessons.map((l, i) => (i === li ? { ...l, ...patch } : l)),
    });
  const move = (arr, i, d) => {
    const a = [...arr];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    return a;
  };

  const addLesson = (si) => {
    updSection(si, {
      lessons: [
        ...sections[si].lessons,
        {
          title: 'New lesson',
          description: '',
          videoUrl: '',
          duration: 5,
          isPreview: false,
          resources: [],
        },
      ],
    });
    setOpen(`${si}-${sections[si].lessons.length}`);
  };

  const upload = async (si, li, file) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const t = toast.loading('Uploading…');
    try {
      const f = await api(`/instructor/courses/${course._id}/files`, { method: 'POST', form });
      const l = sections[si].lessons[li];
      updLesson(si, li, {
        resources: [...l.resources, { name: f.name, size: f.size, file: f._id }],
      });
      toast.success('File attached — remember to save', { id: t });
    } catch (err) {
      toast.error(err.message, { id: t });
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const saved = await api(`/instructor/courses/${course._id}/curriculum`, {
        method: 'PUT',
        body: { sections },
      });
      onSaved(saved);
      setSections(toEditable(saved.sections));
      setDirty(false);
      toast.success('Curriculum saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
        <span>
          Paste any YouTube, Vimeo or direct .mp4 link as the lesson video. Attach PDFs or other
          resources up to 2 MB.
        </span>
        <button onClick={save} disabled={busy || !dirty} className="btn-primary">
          {busy && <Spinner className="h-4 w-4 text-white" />} {dirty ? 'Save curriculum' : 'Saved'}
        </button>
      </div>
      <div className="space-y-4">
        {sections.map((s, si) => (
          <div key={s._id || si} className="card p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Section {si + 1}
              </span>
              <input
                className="input flex-1 font-semibold"
                value={s.title}
                onChange={(e) => updSection(si, { title: e.target.value })}
              />
              <button
                disabled={si === 0}
                onClick={() => change(move(sections, si, -1))}
                className="btn-ghost px-2"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                disabled={si === sections.length - 1}
                onClick={() => change(move(sections, si, 1))}
                className="btn-ghost px-2"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  window.confirm('Delete this section and its lessons?') &&
                  change(sections.filter((_, i) => i !== si))
                }
                className="btn-ghost px-2 text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {s.lessons.map((l, li) => {
                const key = `${si}-${li}`;
                const isOpen = open === key;
                return (
                  <li key={l._id || key} className="rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <GripVertical className="h-4 w-4 text-slate-300" />
                      <button
                        onClick={() => setOpen(isOpen ? null : key)}
                        className="flex flex-1 items-center gap-2 text-left text-sm font-medium"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition ${isOpen ? '' : '-rotate-90'}`}
                        />{' '}
                        {l.title || 'Untitled lesson'}
                        {l.isPreview && (
                          <span className="badge bg-brand-50 text-brand-700">Preview</span>
                        )}
                        {!l.videoUrl && (
                          <span className="badge bg-amber-50 text-amber-700">No video</span>
                        )}
                        {l.resources.length > 0 && (
                          <span className="badge bg-slate-100 text-slate-600">
                            <Paperclip className="h-3 w-3" /> {l.resources.length}
                          </span>
                        )}
                      </button>
                      <button
                        disabled={li === 0}
                        onClick={() => updSection(si, { lessons: move(s.lessons, li, -1) })}
                        className="btn-ghost px-2"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={li === s.lessons.length - 1}
                        onClick={() => updSection(si, { lessons: move(s.lessons, li, 1) })}
                        className="btn-ghost px-2"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updSection(si, { lessons: s.lessons.filter((_, i) => i !== li) })
                        }
                        className="btn-ghost px-2 text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="label">Lesson title</label>
                          <input
                            className="input"
                            value={l.title}
                            onChange={(e) => updLesson(si, li, { title: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Video URL</label>
                          <input
                            className="input"
                            value={l.videoUrl}
                            onChange={(e) => updLesson(si, li, { videoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=…"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Description</label>
                          <textarea
                            rows={3}
                            className="input"
                            value={l.description}
                            onChange={(e) => updLesson(si, li, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">Duration (minutes)</label>
                          <input
                            type="number"
                            min={0}
                            className="input"
                            value={l.duration}
                            onChange={(e) =>
                              updLesson(si, li, { duration: Number(e.target.value) })
                            }
                          />
                        </div>
                        <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-brand-600"
                            checked={l.isPreview}
                            onChange={(e) => updLesson(si, li, { isPreview: e.target.checked })}
                          />{' '}
                          Free preview lesson
                        </label>
                        <div className="sm:col-span-2">
                          <label className="label">Resources</label>
                          <ul className="space-y-2">
                            {l.resources.map((r, ri) => (
                              <li
                                key={ri}
                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-brand-600" /> {r.name}
                                </span>
                                <button
                                  onClick={() =>
                                    updLesson(si, li, {
                                      resources: l.resources.filter((_, j) => j !== ri),
                                    })
                                  }
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                          <label className="btn-secondary mt-2 cursor-pointer">
                            <Paperclip className="h-4 w-4" /> Attach file
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg"
                              onChange={(e) => {
                                upload(si, li, e.target.files[0]);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <button onClick={() => addLesson(si)} className="btn-ghost mt-2 text-brand-600">
              <Plus className="h-4 w-4" /> Add lesson
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          change([...sections, { title: `Section ${sections.length + 1}`, lessons: [] }])
        }
        className="btn-secondary mt-4 w-full border-dashed py-3"
      >
        <Plus className="h-4 w-4" /> Add section
      </button>
    </div>
  );
}

const blankQuestion = () => ({ question: '', options: ['', ''], correctIndex: 0, explanation: '' });

function QuizTab({ course, quiz, onSaved }) {
  const [form, setForm] = useState(() =>
    quiz
      ? {
          title: quiz.title,
          passingScore: quiz.passingScore,
          questions: quiz.questions.map(({ question, options, correctIndex, explanation }) => ({
            question,
            options,
            correctIndex,
            explanation,
          })),
        }
      : { title: `${course.title} — Final Quiz`, passingScore: 70, questions: [blankQuestion()] },
  );
  const [busy, setBusy] = useState(false);
  const updQ = (qi, patch) =>
    setForm({
      ...form,
      questions: form.questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)),
    });

  const save = async () => {
    setBusy(true);
    try {
      onSaved(await api(`/instructor/courses/${course._id}/quiz`, { method: 'PUT', body: form }));
      toast.success('Quiz saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card grid gap-4 p-5 sm:grid-cols-[1fr_160px]">
        <div>
          <label className="label">Quiz title</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Pass mark (%)</label>
          <input
            type="number"
            min={1}
            max={100}
            className="input"
            value={form.passingScore}
            onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })}
          />
        </div>
      </div>
      {form.questions.map((q, qi) => (
        <div key={qi} className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Question {qi + 1}</span>
            <button
              onClick={() =>
                setForm({ ...form, questions: form.questions.filter((_, i) => i !== qi) })
              }
              className="btn-ghost px-2 text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            className="input mt-2"
            placeholder="Type your question"
            value={q.question}
            onChange={(e) => updQ(qi, { question: e.target.value })}
          />
          <p className="mt-4 text-xs font-semibold uppercase text-slate-400">
            Options — select the correct answer
          </p>
          <div className="mt-2 space-y-2">
            {q.options.map((o, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updQ(qi, { correctIndex: oi })}
                  className={`rounded-full ${q.correctIndex === oi ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
                  title="Mark as correct"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <input
                  className={`input ${q.correctIndex === oi ? 'border-emerald-300 bg-emerald-50/50' : ''}`}
                  placeholder={`Option ${oi + 1}`}
                  value={o}
                  onChange={(e) =>
                    updQ(qi, { options: q.options.map((x, j) => (j === oi ? e.target.value : x)) })
                  }
                />
                {q.options.length > 2 && (
                  <button
                    onClick={() =>
                      updQ(qi, {
                        options: q.options.filter((_, j) => j !== oi),
                        correctIndex:
                          q.correctIndex >= oi && q.correctIndex > 0
                            ? q.correctIndex - 1
                            : q.correctIndex,
                      })
                    }
                    className="btn-ghost px-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {q.options.length < 6 && (
            <button
              onClick={() => updQ(qi, { options: [...q.options, ''] })}
              className="btn-ghost mt-1 text-brand-600"
            >
              <Plus className="h-4 w-4" /> Add option
            </button>
          )}
          <input
            className="input mt-3"
            placeholder="Explanation shown after answering (optional)"
            value={q.explanation}
            onChange={(e) => updQ(qi, { explanation: e.target.value })}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setForm({ ...form, questions: [...form.questions, blankQuestion()] })}
          className="btn-secondary"
        >
          <Plus className="h-4 w-4" /> Add question
        </button>
        <button onClick={save} disabled={busy} className="btn-primary">
          {busy && <Spinner className="h-4 w-4 text-white" />} Save quiz
        </button>
      </div>
    </div>
  );
}

function PublishTab({ course, quiz, onSaved }) {
  const [busy, setBusy] = useState(false);
  const checks = [
    [course.title?.length >= 5, 'Course has a clear title'],
    [Boolean(course.subtitle), 'Subtitle added'],
    [Boolean(course.description), 'Description written'],
    [course.lessonCount > 0, 'At least one lesson'],
    [course.sections.some((s) => s.lessons.some((l) => l.isPreview)), 'A free preview lesson'],
    [Boolean(quiz), 'A quiz to test learners'],
  ];

  const act = async (path, msg) => {
    setBusy(true);
    try {
      onSaved(await api(`/instructor/courses/${course._id}/${path}`, { method: 'POST' }));
      toast.success(msg);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-bold">Course checklist</h2>
        <ul className="mt-4 space-y-3">
          {checks.map(([ok, label]) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`h-5 w-5 ${ok ? 'text-emerald-500' : 'text-slate-300'}`} />{' '}
              <span className={ok ? '' : 'text-slate-500'}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6">
        <h2 className="font-bold">
          Status: <StatusBadge status={course.status} />
        </h2>
        {course.status === 'draft' && (
          <p className="mt-3 text-sm text-slate-600">
            When you&apos;re ready, submit the course for review. An admin will approve it before it
            appears in the catalog.
          </p>
        )}
        {course.status === 'pending' && (
          <p className="mt-3 text-sm text-slate-600">
            Your course is waiting for admin review. You can keep editing in the meantime.
          </p>
        )}
        {course.status === 'published' && (
          <p className="mt-3 text-sm text-slate-600">
            Your course is live in the catalog. 🎉 Edits you save are visible immediately.
          </p>
        )}
        {course.status === 'rejected' && (
          <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            Feedback from the review team:{' '}
            {course.rejectionReason || 'Please improve the course and resubmit.'}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {['draft', 'rejected'].includes(course.status) && (
            <button
              disabled={busy}
              onClick={() => act('submit', 'Submitted for review')}
              className="btn-primary"
            >
              <Send className="h-4 w-4" /> Submit for review
            </button>
          )}
          {course.status === 'published' && (
            <button
              disabled={busy}
              onClick={() => act('unpublish', 'Course moved back to draft')}
              className="btn-secondary"
            >
              Unpublish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
