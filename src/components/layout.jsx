import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Mic, FileText, Code2, Calculator, BarChart3, Sun, Moon, LogOut,
  Settings as SettingsIcon, User as UserIcon, Menu, X, History,
} from 'lucide-react';
import { Logo, btnClasses } from './ui';
import { FEATURES } from '../constants';
import { useApp } from '../context/AppContext';

const APP_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, hex: '#2563eb' },
  { to: '/interview', label: 'Interview', icon: Mic, hex: '#06b6d4' },
  { to: '/coding', label: 'Coding', icon: Code2, hex: '#10b981' },
  { to: '/resume', label: 'Resume', icon: FileText, hex: '#f97316' },
  { to: '/aptitude', label: 'Aptitude', icon: Calculator, hex: '#f59e0b' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, hex: '#6366f1' },
];

const GUEST_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how', label: 'How it works' },
  { id: 'analytics', label: 'Analytics' },
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ThemeButton() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 60, opacity: 0 }} transition={{ duration: 0.18 }}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Navbar() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onLanding = location.pathname === '/' && !user;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${onLanding ? 'border-white/10 bg-slate-950/70' : 'border-slate-200/70 bg-white/80 dark:border-slate-800/80 dark:bg-[#080b12]/85'}`}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Main">
          <Link to={user ? '/dashboard' : '/'} aria-label="InterviewHub home">
            <Logo dark={onLanding} />
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {user ? (
              APP_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <l.icon size={16} style={{ color: isActive ? l.hex : undefined }} className={isActive ? '' : 'opacity-60 group-hover:opacity-100'} />
                      {l.label}
                      {isActive && <motion.span layoutId="navdot" className="ml-0.5 h-1.5 w-1.5 rounded-full" style={{ background: l.hex }} />}
                    </>
                  )}
                </NavLink>
              ))
            ) : (
              GUEST_LINKS.map((l) => (
                <button key={l.id} onClick={() => scrollToId(l.id)} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                  {l.label}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeButton />
            {user ? (
              <UserMenu />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/auth" className={btnClasses({ variant: onLanding ? 'ghost' : 'ghost', size: 'sm', className: onLanding ? 'text-slate-200 hover:bg-white/10' : '' })}>Log in</Link>
                <Link to="/auth?mode=register" className={btnClasses({ size: 'sm', grad: 'from-blue-600 to-cyan-500' })}>Get Started</Link>
              </div>
            )}
            <button
              className={`grid h-9 w-9 place-items-center rounded-xl lg:hidden ${onLanding ? 'text-slate-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className={`overflow-hidden border-t lg:hidden ${onLanding ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b0f1a]'}`}
            >
              <div className="space-y-1 px-4 py-4">
                {user ? (
                  <>
                    {[...APP_LINKS, { to: '/practice', label: 'Practice Hub', icon: LayoutDashboard, hex: '#14b8a6' }, { to: '/history', label: 'History', icon: History, hex: '#8b5cf6' }, { to: '/settings', label: 'Settings', icon: SettingsIcon, hex: '#64748b' }].map((l) => (
                      <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        <l.icon size={17} style={{ color: l.hex }} /> {l.label}
                      </NavLink>
                    ))}
                  </>
                ) : (
                  <>
                    {GUEST_LINKS.map((l) => (
                      <button key={l.id} onClick={() => { setOpen(false); setTimeout(() => scrollToId(l.id), 50); }} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-300 hover:bg-white/5">{l.label}</button>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Link to="/auth" onClick={() => setOpen(false)} className={btnClasses({ variant: 'outline', size: 'md', className: 'flex-1 border-slate-600 text-slate-200' })}>Log in</Link>
                      <Link to="/auth?mode=register" onClick={() => setOpen(false)} className={btnClasses({ size: 'md', className: 'flex-1' })}>Get Started</Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile bottom nav for authed users */}
      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0b0f1a]/95 lg:hidden" aria-label="Mobile">
          <div className="grid grid-cols-5">
            {[
              { to: '/dashboard', label: 'Home', icon: LayoutDashboard, hex: '#2563eb' },
              { to: '/practice', label: 'Practice', icon: Calculator, hex: '#14b8a6' },
              { to: '/interview', label: 'Interview', icon: Mic, hex: '#06b6d4' },
              { to: '/coding', label: 'Coding', icon: Code2, hex: '#10b981' },
              { to: '/profile', label: 'Profile', icon: UserIcon, hex: '#ec4899' },
            ].map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold ${isActive ? '' : 'text-slate-400 dark:text-slate-500'}`}>
                {({ isActive }) => (
                  <>
                    <l.icon size={19} style={{ color: isActive ? l.hex : undefined }} />
                    <span style={{ color: isActive ? l.hex : undefined }}>{l.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}

function UserMenu() {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Account menu" aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-xs font-bold text-white shadow-md"
      >
        {initials}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }}
              className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              {[
                { to: '/profile', label: 'Profile', icon: UserIcon },
                { to: '/history', label: 'Interview History', icon: History },
                { to: '/settings', label: 'Settings', icon: SettingsIcon },
              ].map((i) => (
                <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                  <i.icon size={15} /> {i.label}
                </Link>
              ))}
              <button
                onClick={() => { logout(); setOpen(false); navigate('/'); }}
                className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:border-slate-800 dark:hover:bg-rose-500/10"
              >
                <LogOut size={15} /> Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Page({ children, className = '', pad = true }) {
  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#080b12] dark:text-slate-100 ${pad ? 'pt-16 pb-24 lg:pb-12' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function FeatureHeader({ feature, title, desc }) {
  const F = FEATURES[feature];
  return (
    <div className={`relative overflow-hidden rounded-3xl ${F.soft} border border-slate-200/70 p-6 sm:p-8 dark:border-white/5`}>
      <div className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br ${F.grad} opacity-20 blur-3xl`} />
      <div className="relative flex flex-wrap items-center gap-4">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${F.grad} text-white shadow-lg ${F.glowShadow}`}>
          <F.icon size={26} />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title || F.name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc || F.desc}</p>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800/70 dark:bg-[#0a0e17]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            One platform for complete interview preparation — AI interviews, resume analysis, coding, aptitude and communication training. Your data stays in your browser.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Practice</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-slate-600 hover:text-cyan-500 dark:text-slate-400" to="/interview">AI Voice Interview</Link></li>
            <li><Link className="text-slate-600 hover:text-orange-500 dark:text-slate-400" to="/resume">Resume Analyzer</Link></li>
            <li><Link className="text-slate-600 hover:text-emerald-500 dark:text-slate-400" to="/coding">Coding Arena</Link></li>
            <li><Link className="text-slate-600 hover:text-pink-500 dark:text-slate-400" to="/communication">Communication Coach</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Platform</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-slate-600 hover:text-amber-500 dark:text-slate-400" to="/aptitude">Aptitude Tests</Link></li>
            <li><Link className="text-slate-600 hover:text-indigo-500 dark:text-slate-400" to="/analytics">Analytics</Link></li>
            <li><Link className="text-slate-600 hover:text-teal-500 dark:text-slate-400" to="/practice">Practice Hub</Link></li>
            <li><Link className="text-slate-600 hover:text-blue-500 dark:text-slate-400" to="/settings">Settings</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400 dark:border-slate-800/70">
        InterviewHub — Prepare Smarter. Perform Better. Get Hired.
      </div>
    </footer>
  );
}
