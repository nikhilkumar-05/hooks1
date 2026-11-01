import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, ShieldCheck, Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('B.Tech CSE');
  const [semester, setSemester] = useState('6th Semester');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          course: course.trim(),
          semester: semester.trim(),
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header matching reference screenshot */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-3">
          <LinkIcon className="w-6 h-6 -rotate-45" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          LPU Hooks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Your Campus. Your Community. Your Hooks.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-hover border border-slate-200/90 rounded-3xl">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Sign in to your student account' : 'Create your LPU student profile'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login'
                ? 'Stay connected with peers, technical clubs, and campus events.'
                : 'Join the Lovely Professional University student networking platform.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech CSE"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                    <input
                      type="text"
                      placeholder="e.g. 6th Semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LPU Student Email</label>
              <input
                type="email"
                required
                placeholder="name@lpu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Hooks' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {mode === 'login'
                ? 'New to LPU Hooks? Create a student account'
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Quick Demo Student Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Instant 1-Click Demo Accounts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('aman.sharma@lpu.in')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/80 rounded-xl transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">Aman Sharma</p>
                <p className="text-[10px] text-slate-500">Tech Club Lead</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('priya.patel@lpu.in')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/80 rounded-xl transition-all"
              >
                <p className="font-bold text-slate-800 text-[11px]">Priya Patel</p>
                <p className="text-[10px] text-slate-500">AI / ML Researcher</p>
              </button>
            </div>
          </div>
        </div>

        {/* Campus safety note */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected by LPU Hooks automated campus AI safety system</span>
        </div>
      </div>
    </div>
  );
};

