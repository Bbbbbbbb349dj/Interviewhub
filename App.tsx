import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Resume from './pages/Resume';
import Coding from './pages/Coding';
import Aptitude from './pages/Aptitude';
import Communication from './pages/Communication';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Practice from './pages/Practice';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function Private({ children }: { children: React.ReactNode }) {
  const { user } = (useApp() as any) || {};
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = (useApp() as any) || {};
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mesh-dark grid min-h-screen place-items-center px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-2xl font-bold text-white shadow-lg">!</div>
            <h1 className="mt-5 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>InterviewHub hit a snag</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Something crashed while rendering. Your saved progress is safe in this browser.
            </p>
            <pre className="mt-4 max-h-40 overflow-y-auto rounded-xl bg-slate-950/70 p-3 text-left text-xs text-rose-300">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Reload InterviewHub
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Shell() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<GuestOnly><Auth /></GuestOnly>} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/practice" element={<Private><Practice /></Private>} />
        <Route path="/interview" element={<Private><Interview /></Private>} />
        <Route path="/resume" element={<Private><Resume /></Private>} />
        <Route path="/coding" element={<Private><Coding /></Private>} />
        <Route path="/aptitude" element={<Private><Aptitude /></Private>} />
        <Route path="/communication" element={<Private><Communication /></Private>} />
        <Route path="/analytics" element={<Private><Analytics /></Private>} />
        <Route path="/history" element={<Private><History /></Private>} />
        <Route path="/profile" element={<Private><Profile /></Private>} />
        <Route path="/settings" element={<Private><Settings /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppProvider>
          <Shell />
        </AppProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
