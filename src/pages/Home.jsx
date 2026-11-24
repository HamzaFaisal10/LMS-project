import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CircleCheck,
  GraduationCap,
  ListChecks,
  PlayCircle,
  Route,
  Users,
} from 'lucide-react';
import { useApi } from '../hooks';
import CourseCard from '../components/CourseCard';
import { ICONS } from '../components/CourseThumb';
import VideoPlayer from '../components/VideoPlayer';
import { Modal, Spinner } from '../components/ui';

const AVATARS = [
  ['EW', 'bg-[#F6C9B9] text-[#7A2E1A]'],
  ['OS', 'bg-[#BFE3D8] text-[#0B4F44]'],
  ['FK', 'bg-[#F3E3A6] text-[#5C4A0B]'],
  ['LB', 'bg-[#C7D2FE] text-[#312E81]'],
];

const FEATURES = [
  ['Video lessons', 'Learn at your own pace'],
  ['Progress tracking', 'Pick up where you left off'],
  ['Quizzes', 'Test what you learn'],
  ['Expert instructors', 'Taught by working pros'],
];

const MOCK_LESSONS = [
  ['done', 'Your first Express server'],
  ['done', 'Routing and middleware'],
  ['done', 'Connecting MongoDB'],
  ['done', 'React Router'],
  ['active', 'JWT authentication'],
  ['todo', 'Deploying to the cloud'],
  ['todo', 'Final quiz'],
];

const PATHS = [
  {
    icon: Route,
    title: 'Full-stack developer',
    text: 'Modern JavaScript → React & Tailwind → the complete MERN stack.',
    to: '/courses?category=web-development',
  },
  {
    icon: BarChart3,
    title: 'Data & machine learning',
    text: 'Python for data analysis, then hands-on machine learning.',
    to: '/courses?category=data-science',
  },
  {
    icon: GraduationCap,
    title: 'Product design',
    text: 'UX research, Figma and interactive prototypes from scratch.',
    to: '/courses?category=design',
  },
];

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

function HeroMockup() {
  return (
    <div className="relative mx-auto h-[470px] w-full max-w-[600px]">
      <div className="absolute inset-[10px_0_0_20px] flex flex-col overflow-hidden rounded-[18px] bg-[#0F172A] shadow-float">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]" />
          <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 text-xs text-slate-400">
            learnhub.app/learn/mern-bootcamp
          </span>
        </div>
        <div className="grid flex-1 grid-cols-3">
          <div className="col-span-3 flex flex-col gap-3 p-4 sm:col-span-2">
            <div className="relative flex flex-1 items-center justify-center rounded-xl bg-[#1E293B]">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                <PlayCircle className="h-6 w-6 text-[#0F172A]" />
              </span>
              <span className="absolute bottom-2.5 left-3 text-xs text-slate-300">
                12:48 / 24:00
              </span>
            </div>
            <p className="text-xs text-indigo-300">Section 4 · Authentication</p>
            <p className="text-[17px] font-semibold text-slate-50">JWT authentication end to end</p>
            <div className="flex gap-2">
              <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-slate-200">
                Resources (2)
              </span>
              <span className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs text-white">
                Complete and continue
              </span>
            </div>
          </div>
          <div className="hidden flex-col gap-2.5 border-l border-white/10 px-3.5 py-4 sm:flex">
            <p className="text-[13px] font-semibold text-slate-50">Course content</p>
            <div className="h-1.5 rounded-full bg-white/10">
              <div className="h-1.5 w-[72%] rounded-full bg-[#A3E635]" />
            </div>
            <p className="text-xs text-slate-400">8 of 11 lessons · 72%</p>
            <div className="mt-1 flex flex-col gap-2">
              {MOCK_LESSONS.map(([state, title]) => (
                <span
                  key={title}
                  className={`text-xs ${
                    state === 'active'
                      ? 'rounded-md bg-indigo-500/35 px-2 py-1.5 text-white'
                      : state === 'done'
                        ? 'text-slate-300'
                        : 'text-slate-400'
                  }`}
                >
                  {state === 'done' ? '✓' : state === 'active' ? '▶' : '○'} {title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-0 flex items-center gap-3 rounded-[14px] border border-[#E8EAF1] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:-left-6">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-lime-100 font-bold text-lime-800">
          ✓
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Quiz passed · 100%</p>
          <p className="text-xs text-slate-600">Modern JavaScript</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: popular, loading } = useApi('/courses?sort=popular&limit=8');
  const { data: categories } = useApi('/categories');
  const { data: previewCourse } = useApi('/courses/the-complete-mern-stack-bootcamp');
  const [preview, setPreview] = useState(false);
  const previewLesson = previewCourse?.sections.flatMap((s) => s.lessons).find((l) => l.isPreview);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="bg-grid absolute inset-0 opacity-70" />
        <div className="absolute -right-52 -top-32 h-[600px] w-[900px] rounded-full bg-[radial-gradient(ellipse,rgba(79,70,229,0.10),rgba(79,70,229,0)_65%)]" />
        <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col gap-[26px]">
            <a
              href="#paths"
              className="flex items-center gap-2.5 self-start rounded-full border border-[#E2E5EE] bg-white py-1.5 pl-1.5 pr-3.5 text-[13px] text-ink-soft transition hover:border-brand-200"
            >
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-semibold text-brand-600">
                New
              </span>
              Learning paths for full-stack developers →
            </a>
            <h1 className="text-[42px] font-extrabold leading-[1.06] tracking-[-1.8px] text-ink sm:text-[52px] lg:text-[60px]">
              Learn the skills that <span className="text-brand-600">move your career</span>{' '}
              forward.
            </h1>
            <p className="max-w-[500px] text-lg leading-[1.65] text-[#4B5468]">
              Expert-led courses in development, data and design. Watch, practise with quizzes and
              track every lesson, all in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-brand-600 px-[26px] py-[15px] text-base font-semibold text-white transition hover:bg-brand-700"
              >
                Start learning for free
              </Link>
              <button
                onClick={() => setPreview(true)}
                className="flex items-center gap-2 rounded-xl border border-[#D7DBE7] bg-white px-[22px] py-[14px] text-base font-medium text-ink transition hover:bg-slate-50"
              >
                <PlayCircle className="h-4 w-4" /> Watch a preview
              </button>
            </div>
            <div className="flex items-center gap-3.5 pt-1.5">
              <div className="flex">
                {AVATARS.map(([initials, tone], i) => (
                  <span
                    key={initials}
                    className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white text-xs font-semibold ${tone} ${i ? '-ml-2.5' : ''}`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  <span className="text-amber-500">★★★★★</span> 4.7 average rating
                </p>
                <p className="text-[13px] text-ink-muted">Across all LearnHub courses</p>
              </div>
            </div>
          </div>
          <HeroMockup />
        </div>
        <div className="relative border-t border-[#E8EAF1] bg-[#FAFBFD]">
          <div className="container-page grid grid-cols-2 gap-6 py-7 lg:grid-cols-4">
            {FEATURES.map(([title, text]) => (
              <div key={title}>
                <p className="text-[15px] font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Explore</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Top categories</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(categories || []).map((c) => {
            const Icon = ICONS[c.icon] || BookOpen;
            return (
              <Link
                key={c._id}
                to={`/courses?category=${c.slug}`}
                className="group rounded-2xl border border-[#E8EAF1] bg-white p-5 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
              >
                <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold leading-snug text-ink">{c.name}</p>
                <p className="text-xs text-ink-muted">
                  {c.courseCount} {c.courseCount === 1 ? 'course' : 'courses'}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular courses */}
      <section className="bg-[#FAFBFD] py-20">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                Popular
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Most popular courses
              </h2>
              <p className="mt-2 text-ink-muted">Hand-picked courses learners love right now.</p>
            </div>
            <Link
              to="/courses"
              className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex"
            >
              View all courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popular?.items.map((c) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Learning paths */}
      <section id="paths" className="container-page scroll-mt-24 py-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          Learning paths
        </p>
        <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          A clear path from your first lesson to job-ready.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PATHS.map(({ icon: Icon, title, text, to }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-2xl border border-[#E8EAF1] bg-white p-7 transition hover:border-brand-200 hover:shadow-card"
            >
              <div className="inline-flex rounded-xl bg-ink p-3 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-ink-muted">{text}</p>
              <p className="mt-5 flex items-center gap-1 text-sm font-semibold text-brand-600">
                Explore path <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink py-20 text-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#A3E635]">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to actually finish a course.
            </h2>
            <p className="mt-4 text-slate-300">
              Short video lessons, downloadable resources, quizzes after each course and a dashboard
              that shows exactly how far you&apos;ve come.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [PlayCircle, 'Watch', 'Bite-sized video lessons you can pause and resume anytime.'],
              [ListChecks, 'Practise', 'Quizzes with instant feedback and explanations.'],
              [CircleCheck, 'Track', 'Progress for every lesson, course and learning path.'],
            ].map(([Icon, title, text], i) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="text-xs font-semibold text-slate-400">0{i + 1}</span>
                <Icon className="mt-3 h-6 w-6 text-[#A3E635]" />
                <p className="mt-3 font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-20">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">
          Testimonials
        </p>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          What our learners say
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-[#E8EAF1] bg-white p-7">
              <p className="text-amber-500">★★★★★</p>
              <blockquote className="mt-3 leading-relaxed text-ink-soft">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <p className="font-semibold text-ink">{t.name}</p>
                <p className="text-sm text-ink-muted">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Sample testimonials for demonstration.
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 bg-[#FAFBFD] py-20">
        <div className="container-page">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">
            Pricing
          </p>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-muted">
            Start free. Pay once for the courses you want — no subscription required.
          </p>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E8EAF1] bg-white p-8">
              <p className="font-semibold text-ink">Free</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-ink">$0</p>
              <p className="mt-1 text-sm text-ink-muted">Forever</p>
              <ul className="mt-6 space-y-3 text-sm text-ink-soft">
                {[
                  'All free courses',
                  'Free preview lessons of every course',
                  'Progress tracking and quizzes',
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-secondary mt-8 w-full py-3">
                Create free account
              </Link>
            </div>
            <div className="relative rounded-2xl border-2 border-brand-600 bg-white p-8">
              <span className="absolute -top-3 left-8 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
              <p className="font-semibold text-ink">Per course</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-ink">From $29.99</p>
              <p className="mt-1 text-sm text-ink-muted">One-time payment, lifetime access</p>
              <ul className="mt-6 space-y-3 text-sm text-ink-soft">
                {[
                  'Every lesson and resource',
                  'Final quiz and completion tracking',
                  '30-day money-back guarantee',
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/courses?price=paid" className="btn-primary mt-8 w-full py-3">
                Browse paid courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Teams + teach */}
      <section id="teams" className="container-page scroll-mt-24 py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-ink p-10 text-white">
            <Users className="h-7 w-7 text-[#A3E635]" />
            <h2 className="mt-5 text-3xl font-extrabold text-white">LearnHub for teams</h2>
            <p className="mt-3 text-slate-300">
              Upskill your whole team with shared learning paths and one place to see
              everyone&apos;s progress.
            </p>
            <Link to="/courses" className="btn mt-8 bg-white px-5 py-3 text-ink hover:bg-slate-100">
              Explore team courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-3xl border border-[#E8EAF1] bg-brand-50 p-10">
            <GraduationCap className="h-7 w-7 text-brand-600" />
            <h2 className="mt-5 text-3xl font-extrabold">Teach on LearnHub</h2>
            <p className="mt-3 text-ink-soft">
              Create courses with video lessons, resources and quizzes, then track your students and
              earnings from one dashboard.
            </p>
            <Link to="/register?role=instructor" className="btn-primary mt-8 px-5 py-3">
              Become an instructor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={previewLesson?.title || 'Course preview'}
        wide
      >
        {previewLesson ? (
          <VideoPlayer url={previewLesson.videoUrl} title={previewLesson.title} />
        ) : (
          <Spinner />
        )}
        <Link to="/courses/the-complete-mern-stack-bootcamp" className="btn-primary mt-4 w-full">
          View the full course
        </Link>
      </Modal>
    </>
  );
}
