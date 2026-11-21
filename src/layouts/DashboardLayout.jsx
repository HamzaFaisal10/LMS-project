import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ExternalLink, Menu } from 'lucide-react';
import Logo from '../components/Logo';
import Navbar from '../components/Navbar';

// Sidebar layout shared by the instructor and admin areas.
export default function DashboardLayout({ title, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:hidden">
        <Navbar />
      </div>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo />
        </div>
        <p className="px-5 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <nav className="space-y-1 px-3">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" /> View website
          </Link>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="lg:pl-64">
        <div className="hidden lg:block">
          <Navbar />
        </div>
        <button onClick={() => setOpen(true)} className="btn-secondary m-4 lg:hidden">
          <Menu className="h-4 w-4" /> {title} menu
        </button>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
