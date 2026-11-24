import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, Menu, Receipt, User, X } from 'lucide-react';
import Logo from './Logo';
import { Avatar } from './ui';
import { useAuth, homeFor } from '../context/AuthContext';

export default function Navbar({ compact }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/courses${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setMobile(false);
  };

  const link = ({ isActive }) =>
    `text-[15px] font-medium transition ${isActive ? 'text-brand-600' : 'text-ink-soft hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8EAF1] bg-white/85 backdrop-blur">
      <div className="container-page flex h-[72px] items-center gap-6">
        {!compact && <Logo />}
        <nav className="mx-auto hidden items-center gap-8 lg:flex">
          <NavLink to="/courses" className={link}>
            Courses
          </NavLink>
          <a href="/#paths" className={link({})}>
            Learning paths
          </a>
          <a href="/#teams" className={link({})}>
            For teams
          </a>
          <NavLink to="/register?role=instructor" className={link}>
            Teach
          </NavLink>
          <a href="/#pricing" className={link({})}>
            Pricing
          </a>
          {user?.role === 'student' && (
            <NavLink to="/my-learning" className={link}>
              My Learning
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {user ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-full p-0.5 hover:ring-4 hover:ring-brand-100"
              >
                <Avatar name={user.name} />
              </button>
              {menu && (
                <div className="card absolute right-0 mt-2 w-60 overflow-hidden p-1.5">
                  <div className="border-b border-slate-100 px-3 pb-3 pt-2">
                    <p className="truncate font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <span className="badge mt-2 bg-brand-50 capitalize text-brand-700">
                      {user.role}
                    </span>
                  </div>
                  <MenuItem
                    to={homeFor(user)}
                    icon={LayoutDashboard}
                    onClick={() => setMenu(false)}
                  >
                    Dashboard
                  </MenuItem>
                  {user.role === 'student' && (
                    <MenuItem to="/my-learning" icon={BookOpen} onClick={() => setMenu(false)}>
                      My Learning
                    </MenuItem>
                  )}
                  <MenuItem to="/profile" icon={User} onClick={() => setMenu(false)}>
                    Profile & settings
                  </MenuItem>
                  <button
                    onClick={() => {
                      logout();
                      setMenu(false);
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link
                to="/register"
                className="btn rounded-[10px] bg-ink px-[18px] text-[15px] text-white hover:bg-ink-soft"
              >
                Get started
              </Link>
            </div>
          )}
          <button
            className="btn-ghost px-2 lg:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-label="Menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobile && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-3 py-4">
            <form onSubmit={search}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search courses"
                className="input"
              />
            </form>
            <Link to="/courses" onClick={() => setMobile(false)} className="py-1 font-medium">
              Courses
            </Link>
            <a href="/#paths" onClick={() => setMobile(false)} className="py-1 font-medium">
              Learning paths
            </a>
            <a href="/#teams" onClick={() => setMobile(false)} className="py-1 font-medium">
              For teams
            </a>
            <Link
              to="/register?role=instructor"
              onClick={() => setMobile(false)}
              className="py-1 font-medium"
            >
              Teach
            </Link>
            <a href="/#pricing" onClick={() => setMobile(false)} className="py-1 font-medium">
              Pricing
            </a>
            {user ? (
              <Link
                to={homeFor(user)}
                onClick={() => setMobile(false)}
                className="py-1 font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobile(false)} className="btn-secondary flex-1">
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobile(false)}
                  className="btn flex-1 bg-ink text-white hover:bg-ink-soft"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" /> {children}
    </Link>
  );
}
