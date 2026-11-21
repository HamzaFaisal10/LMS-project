import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, Menu, Receipt, Search, User, X } from 'lucide-react';
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
    `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-6">
        {!compact && <Logo />}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/courses" className={link}>
            Explore
          </NavLink>
          {user?.role === 'student' && (
            <NavLink to="/my-learning" className={link}>
              My Learning
            </NavLink>
          )}
          {!user && (
            <NavLink to="/register?role=instructor" className={link}>
              Teach on LearnHub
            </NavLink>
          )}
        </nav>
        <form onSubmit={search} className="relative ml-auto hidden max-w-sm flex-1 lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for anything"
            className="input rounded-full pl-9"
          />
        </form>
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
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}
          <button
            className="btn-ghost px-2 md:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-label="Menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobile && (
        <div className="border-t border-slate-100 bg-white md:hidden">
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
              Explore courses
            </Link>
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
                  className="btn-primary flex-1"
                >
                  Sign up
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
