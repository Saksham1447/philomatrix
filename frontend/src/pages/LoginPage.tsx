import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuthTokens, UserProfile } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LoginSplash } from '../components/common/LoginSplash';

interface DemoAccount {
  label: string;
  role: string;
  email: string;
  pass: string;
  desc: string;
}

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashData, setSplashData] = useState<{ fullName: string; role: string; institution?: string } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts: DemoAccount[] = [
    {
      label: 'Principal',
      role: 'PRINCIPAL',
      email: 'principal@royalscience.edu',
      pass: 'Royal@Principal2026',
      desc: 'Institution KPIs, Marks Approvals, Timetable & Publications',
    },
    {
      label: 'Physics Lecturer',
      role: 'FACULTY',
      email: 'physics.prof@royalscience.edu',
      pass: 'Faculty@Pass2026',
      desc: 'Period Attendance Entry, Marks Entry Draft/Submit',
    },
    {
      label: 'Student (Arjun)',
      role: 'STUDENT',
      email: 'arjun.sharma@royalscience.edu',
      pass: 'Student@Pass2026',
      desc: 'Class 11 Science, Personal Timetable, Attendance & Report Card',
    },
    {
      label: 'Parent (Mr. Sharma)',
      role: 'PARENT',
      email: 'parent.sharma@gmail.com',
      pass: 'Parent@Pass2026',
      desc: 'Linked Child Switcher, Real-time Attendance & Marks',
    },
    {
      label: 'Office Staff',
      role: 'OFFICE_STAFF',
      email: 'admissions@royalscience.edu',
      pass: 'Staff@Pass2026',
      desc: 'Student Admissions, Guardian Linking & Documents',
    },
    {
      label: 'SaaS Super Admin',
      role: 'SUPER_ADMIN',
      email: 'superadmin@philomatrix.local',
      pass: 'Philomatrix@2026',
      desc: 'Multi-Tenant Management & Platform Health',
    },
  ];

  const handleQuickFill = (acc: DemoAccount) => {
    setUsernameOrEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const tokenRes = await api.post<AuthTokens>('/auth/login', {
        username_or_email: usernameOrEmail,
        password: password,
      });

      localStorage.setItem('philomatrix_access_token', tokenRes.access_token);
      const profile = await api.get<UserProfile>('/auth/me');

      setSplashData({
        fullName: profile.full_name,
        role: profile.roles?.[0] || 'USER',
        institution: profile.institution_name,
      });
      setShowSplash(true);

      setTimeout(() => {
        login(tokenRes.access_token, profile);
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showSplash && splashData && (
        <LoginSplash
          userFullName={splashData.fullName}
          userRole={splashData.role}
          institutionName={splashData.institution}
          onComplete={() => setShowSplash(false)}
          duration={3000}
        />
      )}

      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
          <img
            src="/assets/logos/philomatrix-logo.png"
            alt="PHILOMATRIX Logo"
            className="h-16 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            PHILOMATRIX SOFTWARE
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Integrated Junior College ERP Platform
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Username or Official Email
                </label>
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. principal@royalscience.edu"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick-Fill Demo Accounts Matrix */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick-Fill Demo Roles
                </span>
                <span className="text-[11px] text-slate-500">1-Click Local Testing</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className="text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all group cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-brand-400 flex items-center justify-between">
                      <span>{acc.label}</span>
                      <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                        {acc.role}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{acc.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
