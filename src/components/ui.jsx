import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/* ---------------- Logo ---------------- */
export function Logo({ size = 36, dark = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid place-items-center rounded-xl shadow-lg shadow-blue-500/25" style={{ width: size, height: size, background: 'linear-gradient(135deg,#2563eb 0%,#06b6d4 45%,#ec4899 100%)' }}>
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 10a8 8 0 0 1 16 0" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="10.6" y="10" width="2.8" height="10" rx="1.4" fill="white" />
          <circle cx="12" cy="10" r="2" fill="white" />
        </svg>
      </span>
      <span className={`font-display text-xl font-bold leading-none ${dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
        Interview<span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-pink-500 bg-clip-text text-transparent">Hub</span>
      </span>
    </span>
  );
}

/* ---------------- Buttons ---------------- */
const BTN_BASE = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]';
const BTN_SIZES = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
  xl: 'text-lg px-9 py-4',
};

export function btnClasses({ variant = 'primary', grad = 'from-blue-600 to-cyan-500', size = 'md', className = '' } = {}) {
  const variants = {
    primary: `text-white bg-gradient-to-r ${grad} shadow-lg hover:shadow-xl hover:-translate-y-0.5`,
    outline: 'border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70',
    danger: 'text-white bg-gradient-to-r from-rose-500 to-red-500 shadow-lg hover:shadow-xl',
    dark: 'text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
  };
  return `${BTN_BASE} ${BTN_SIZES[size]} ${variants[variant]} ${className}`;
}

export function Btn({ variant, grad, size, className, loading, icon: Icon, children, ...rest }) {
  return (
    <button className={btnClasses({ variant, grad, size, className })} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

export function BtnLink({ to, variant, grad, size, className, icon: Icon, children }) {
  return (
    <Link to={to} className={btnClasses({ variant, grad, size, className })}>
      {Icon ? <Icon size={16} /> : null}
      {children}
    </Link>
  );
}

/* ---------------- Cards ---------------- */
export function Card({ className = '', hover = false, children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80 ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Badge({ className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionHead({ eyebrow, eyebrowClass = 'text-cyan-600 dark:text-cyan-400', title, sub, center = true, dark = false }) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl`}>
      {eyebrow && (
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${eyebrowClass}`}>{eyebrow}</p>
      )}
      <h2 className={`mt-3 font-display text-3xl font-bold sm:text-4xl ${dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h2>
      {sub && <p className={`mt-4 text-base leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

/* ---------------- Progress ---------------- */
export function ProgressBar({ value = 0, grad = 'from-blue-500 to-cyan-400', className = '', track = 'bg-slate-200 dark:bg-slate-700/60' }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${track} ${className}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-full bg-gradient-to-r ${grad}`}
      />
    </div>
  );
}

export function Ring({ value = 0, size = 120, stroke = 10, from = '#06b6d4', to = '#2563eb', label, sub, trackClass = 'stroke-slate-200 dark:stroke-slate-700/70' }) {
  const id = useId().replace(/:/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`g${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={`url(#g${id})`} strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * v) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-bold text-slate-900 dark:text-white" style={{ fontSize: size * 0.22 }}>{label ?? `${Math.round(v)}`}</div>
        {sub && <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------------- Forms ---------------- */
export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span>}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500';

export function Input(props) { return <input className={`${inputCls} ${props.className || ''}`} {...props} />; }
export function Textarea(props) { return <textarea className={`${inputCls} ${props.className || ''}`} {...props} />; }
export function Select({ children, ...props }) { return <select className={`${inputCls} ${props.className || ''}`} {...props}>{children}</select>; }

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900`}
            onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label={title}
          >
            {title && <h3 className="mb-4 font-display text-xl font-bold text-slate-900 dark:text-white">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- States ---------------- */
export function EmptyState({ icon: Icon, title, desc, action, accent = 'from-blue-500 to-cyan-400' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
        <Icon size={26} />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {desc && <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10" role="alert">
      <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{title}</p>
      {message && <p className="mt-1 text-sm text-rose-600/90 dark:text-rose-300/80">{message}</p>}
      {onRetry && <Btn size="sm" variant="outline" className="mt-3" onClick={onRetry}>Retry</Btn>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <Loader2 size={16} className="animate-spin" /> {label}
    </span>
  );
}

/* ---------------- Score visuals ---------------- */
export function scoreColor(v, of = 10) {
  const pct = (v / of) * 100;
  if (pct >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export function ScoreBar({ label, value, max = 10, delay = 0 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const grad = pct >= 75 ? 'from-emerald-500 to-teal-400' : pct >= 50 ? 'from-amber-400 to-orange-400' : 'from-rose-500 to-orange-400';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className={`font-bold ${scoreColor(value, max)}`}>{value}/{max}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/60">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${grad}`}
        />
      </div>
    </div>
  );
}
