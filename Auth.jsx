import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Logo, Btn, Field, Input, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { TAGLINE } from '../constants';

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login, register, toast } = useApp();
  const navigate = useNavigate();
  const { register: reg, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    setServerError('');
    try {
      if (mode === 'register') {
        const acc = await register({ name: values.name, email: values.email, password: values.password });
        toast('success', `Welcome, ${acc.name.split(' ')[0]}!`, 'Your local account is ready.');
      } else {
        const acc = await login({ email: values.email, password: values.password });
        toast('success', `Welcome back, ${acc.name.split(' ')[0]}.`);
      }
      navigate('/dashboard');
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <div className="grid min-h-screen pt-16 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="mesh-dark noise relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 grid-lines" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/"><Logo dark /></Link>
          <div>
            <Badge className="border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-slate-200 backdrop-blur">
              <Sparkles size={12} className="text-cyan-300" /> Complete interview preparation
            </Badge>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.08] text-white">
              {TAGLINE[0]}<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{TAGLINE[1]}</span><br />
              <span className="bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">{TAGLINE[2]}</span>
            </h1>
            <p className="mt-5 max-w-md leading-relaxed text-slate-400">
              AI interviews, resume analysis, coding, aptitude and communication coaching — one account, five disciplines, zero fake numbers.
            </p>
          </div>
          <div className="flex gap-3">
            {['AI Interviews', 'Coding Arena', 'Aptitude', 'Resume ATS'].map((t, i) => (
              <span key={t} className={`rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold ${['text-cyan-300', 'text-emerald-300', 'text-amber-300', 'text-orange-300'][i]}`}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#f8fafc] px-4 py-12 dark:bg-[#080b12] sm:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden"><Logo /></div>
          <h2 className="mt-6 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {mode === 'register' ? 'Start your preparation journey in under a minute.' : 'Pick up right where you left off.'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            {mode === 'register' && (
              <Field label="Full name" error={errors.name?.message}>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10" placeholder="Ada Lovelace" autoComplete="name"
                    {...reg('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
                </div>
              </Field>
            )}
            <Field label="Email" error={errors.email?.message}>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10" type="email" placeholder="you@example.com" autoComplete="email"
                  {...reg('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} />
              </div>
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10 pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  {...reg('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            {mode === 'register' && (
              <Field label="Confirm password" error={errors.confirm?.message}>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10" type="password" placeholder="••••••••" autoComplete="new-password"
                    {...reg('confirm', { required: 'Please confirm your password', validate: (v) => v === watch('password') || 'Passwords do not match' })} />
                </div>
              </Field>
            )}

            {serverError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {serverError}
              </motion.p>
            )}

            <Btn type="submit" size="lg" className="w-full" loading={isSubmitting}>
              {mode === 'register' ? 'Create account' : 'Log in'} <ArrowRight size={16} />
            </Btn>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === 'register' ? 'Already have an account? ' : 'New to InterviewHub? '}
            <button
              className="font-bold text-cyan-600 hover:underline dark:text-cyan-400"
              onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setServerError(''); }}
            >
              {mode === 'register' ? 'Log in' : 'Create one free'}
            </button>
          </p>

          <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <span><b>MVP authentication.</b> Your account is stored locally in this browser (salted + hashed) so features work without a database. It is not production-grade security — a real auth provider can be plugged in later.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
