import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApi } from '../hooks';
import CourseCard from '../components/CourseCard';
import { ICONS } from '../components/CourseThumb';
import { Spinner } from '../components/ui';

const TESTIMONIALS = [
  {
    name: 'Emma W.',
    role: 'Junior Developer',
    text: 'The MERN bootcamp took me from tutorials to shipping my own app. The quizzes kept me honest.',
  },
  {
    name: 'Omar S.',
    role: 'Product Designer',
    text: 'Clear, practical lessons. Being able to track my progress lesson by lesson kept me motivated.',
  },
  {
    name: 'Fatima K.',
    role: 'Freelancer',
    text: 'I landed my first two clients a month after finishing the freelancing course. Worth every minute.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const { data: popular, loading } = useApi('/courses?sort=popular&limit=8');
  const { data: categories } = useApi('/categories');

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="badge bg-white text-brand-700 shadow-sm ring-1 ring-brand-100">
              <Sparkles className="h-3.5 w-3.5" /> New courses every week
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Learn skills that{' '}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                get you hired.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              Expert-led video courses in development, data, design and business. Learn at your
              pace, test yourself with quizzes and track every step.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/courses?q=${encodeURIComponent(q)}`);
              }}
              className="mt-8 flex max-w-lg gap-2 rounded-2xl bg-white p-2 shadow-card ring-1 ring-slate-200"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What do you want to learn?"
                  className="h-full w-full rounded-xl pl-9 text-sm outline-none"
                />
              </div>
              <button className="btn-primary">Search</button>
            </form>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Lifetime access
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Learn on any device
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Quizzes & progress tracking
              </span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="card rotate-1 overflow-hidden p-0">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-600 to-violet-700">
                <PlayCircle className="h-20 w-20 text-white/90" strokeWidth={1.2} />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Now learning
                </p>
                <p className="mt-1 font-display text-lg font-bold">
                  The Complete MERN Stack Bootcamp
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
                </div>
                <p className="mt-2 text-xs text-slate-500">8 of 12 lessons complete</p>
              </div>
            </div>
            <div className="card absolute -bottom-6 -left-8 flex items-center gap-3 px-4 py-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Quiz passed!</p>
                <p className="text-xs text-slate-500">Score 100%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-8 text-center md:grid-cols-4">
          {[
            [BookOpen, '8+', 'Expert courses'],
            [Users, '12k+', 'Active learners'],
            [Award, '4.7', 'Average rating'],
            [Sparkles, '100%', 'Self-paced'],
          ].map(([Icon, n, l]) => (
            <div key={l}>
              <Icon className="mx-auto mb-2 h-5 w-5 text-brand-600" />
              <p className="font-display text-2xl font-extrabold">{n}</p>
              <p className="text-sm text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Top categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(categories || []).map((c) => {
            const Icon = ICONS[c.icon] || BookOpen;
            return (
              <Link
                key={c._id}
                to={`/courses?category=${c.slug}`}
                className="card group p-5 transition hover:-translate-y-1 hover:border-brand-200"
              >
                <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold leading-snug">{c.name}</p>
                <p className="text-xs text-slate-500">{c.courseCount} courses</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Most popular courses</h2>
            <p className="mt-1 text-slate-500">Hand-picked courses learners love right now.</p>
          </div>
          <Link
            to="/courses"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popular?.items.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">What our learners say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-6">
                <p className="text-slate-600">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 font-semibold">{t.name}</p>
                <p className="text-sm text-slate-500">{t.role}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Sample testimonials for demonstration.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-brand-900 px-8 py-14 text-center text-white sm:px-16">
          <h2 className="text-3xl font-extrabold text-white">
            Share your knowledge. Teach on LearnHub.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Create courses with video lessons, resources and quizzes, then track your students and
            earnings from one dashboard.
          </p>
          <Link
            to="/register?role=instructor"
            className="btn mt-8 bg-white px-6 py-3 text-slate-900 hover:bg-slate-100"
          >
            Become an instructor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
