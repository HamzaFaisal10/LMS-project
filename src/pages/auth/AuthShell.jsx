import { CheckCircle2 } from 'lucide-react';
import Logo from '../../components/Logo';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col">
        <Logo light />
        <div className="my-auto max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Learn the skills that <span className="text-brand-300">move your career</span> forward.
          </h2>
          <ul className="mt-8 space-y-3 text-slate-300">
            {[
              'Expert-led video courses',
              'Track progress lesson by lesson',
              'Quizzes to test what you learn',
              'Teach and earn as an instructor',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#A3E635]" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.35),rgba(79,70,229,0)_65%)]" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
