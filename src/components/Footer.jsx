import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-ink text-slate-400">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            LearnHub helps learners build in-demand skills with hands-on courses taught by industry
            experts.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Learn</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/courses" className="hover:text-white">
                Browse courses
              </Link>
            </li>
            <li>
              <Link to="/courses?price=free" className="hover:text-white">
                Free courses
              </Link>
            </li>
            <li>
              <Link to="/my-learning" className="hover:text-white">
                My learning
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Teach</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/register?role=instructor" className="hover:text-white">
                Become an instructor
              </Link>
            </li>
            <li>
              <Link to="/instructor" className="hover:text-white">
                Instructor dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} LearnHub. All rights reserved.</p>
          <p>Portfolio demo · Payments run in demo mode — no real charges.</p>
        </div>
      </div>
    </footer>
  );
}
