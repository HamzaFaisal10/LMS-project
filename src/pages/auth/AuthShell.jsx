import { CheckCircle2 } from 'lucide-react';
import Logo from '../../components/Logo';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-12 text-white lg:flex lg:flex-col">
        <Logo light />
        <div className="my-auto max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Learn the skills that move your career forward.
          </h2>
          <ul className="mt-8 space-y-3 text-brand-50">
            {[
              'Expert-led video courses',
              'Track progress lesson by lesson',
              'Quizzes to test what you learn',
              'Teach and earn as an instructor',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -right-10 top-24 h-40 w-40 rounded-full bg-white/5" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
