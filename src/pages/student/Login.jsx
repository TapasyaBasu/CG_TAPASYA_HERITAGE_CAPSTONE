import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, User, Lock, Eye, EyeOff,
  AlertCircle, Shield, Sparkles, ChevronRight, LogIn,
  UserPlus, Sun, Moon, KeyRound, CheckCircle2, ArrowLeft, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getUsers, registerUser, resetStudentPassword } from '../../utils/storage';

const GRADIENTS = [
  'from-indigo-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-500',
];

// ── Student Card (expands to show password field on click) ───────────────────
function StudentCard({ account, idx, onLogin, loading, isExpanded, onExpand, onCollapse }) {
  const [pass, setPass]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [cardErr, setCardErr] = useState('');
  const inputRef = useRef(null);

  const gradient = GRADIENTS[idx % GRADIENTS.length];
  const initials = account.name
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Focus password input when card expands
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setPass('');
      setCardErr('');
      setShowPass(false);
    }
  }, [isExpanded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pass) { setCardErr('Please enter your password'); return; }
    setCardErr('');
    const ok = await onLogin(account.username, pass);
    if (!ok) {
      setCardErr('Incorrect password. Please try again.');
      setPass('');
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden animate-slide-up
        ${isExpanded
          ? 'border-indigo-500/50 bg-indigo-500/8 shadow-[0_0_24px_rgba(99,102,241,0.15)]'
          : 'border-white/10 bg-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/6'}`}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Card Header — always visible */}
      <button
        onClick={() => isExpanded ? onCollapse() : onExpand(account.username)}
        disabled={!!loading && !isExpanded}
        className="w-full flex items-center gap-4 p-4 text-left group"
      >
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0
          bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-300 ${isExpanded ? 'scale-105' : 'group-hover:scale-105'}`}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">{account.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">@{account.username}</p>
        </div>

        {/* Expand / Collapse icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0
          ${isExpanded
            ? 'bg-indigo-500/30 border border-indigo-500/50'
            : 'bg-indigo-500/20 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:border-indigo-500'}`}>
          {loading === account.username
            ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            : isExpanded
            ? <X className="w-4 h-4 text-indigo-400" />
            : <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />}
        </div>
      </button>

      {/* Inline password form — shown when expanded */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 animate-fade-in">
          <div className="h-px bg-indigo-500/20 mb-4" />

          {cardErr && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {cardErr}
            </div>
          )}

          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Enter your password to sign in
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              ref={inputRef}
              type={showPass ? 'text' : 'password'}
              className="input-field pl-10 pr-10 text-sm"
              placeholder="••••••••"
              value={pass}
              onChange={e => { setPass(e.target.value); setCardErr(''); }}
              autoComplete="current-password"
            />
            <button type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!!loading || !pass}
            className="w-full mt-3 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}
          >
            {loading === account.username
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              : <><LogIn className="w-4 h-4" /> Sign In</>}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function Login() {
  const [tab, setTab]           = useState('student');
  const [students, setStudents] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);

  // Admin form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Registration
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName]             = useState('');
  const [regUsername, setRegUsername]     = useState('');
  const [regPassword, setRegPassword]     = useState('');
  const [showRegPass, setShowRegPass]     = useState(false);

  // Forgot Password
  const [isForgotPass, setIsForgotPass]       = useState(false);
  const [forgotUsername, setForgotUsername]   = useState('');
  const [forgotFullName, setForgotFullName]   = useState('');
  const [forgotPassword, setForgotPassword]   = useState('');
  const [showForgotPass, setShowForgotPass]   = useState(false);
  const [successMsg, setSuccessMsg]           = useState('');

  const { login, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const loadStudents = () => {
    const allUsers = getUsers();
    setStudents(allUsers.filter(u => u.role === 'student'));
  };

  useEffect(() => { loadStudents(); }, []);

  // Returns true on success, false on failure
  const handleLogin = async (u, p) => {
    setError('');
    setLoading(u);
    await new Promise(r => setTimeout(r, 400));
    const user = login(u, p);
    setLoading(false);
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/exams');
      return true;
    }
    return false;
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password).then(ok => {
      if (!ok) setError('Invalid admin credentials.');
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(regUsername);
    try {
      await new Promise(r => setTimeout(r, 500));
      const newUser = registerUser(regName.trim(), regUsername.trim().toLowerCase(), regPassword);
      const user = login(newUser.username, regPassword);
      setLoading(false);
      if (user) navigate('/student/exams');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(forgotUsername);
    try {
      await new Promise(r => setTimeout(r, 500));
      resetStudentPassword(forgotUsername.trim(), forgotFullName.trim(), forgotPassword);
      // Log out any active session so the student must re-authenticate with new password
      logout();
      setLoading(false);
      setSuccessMsg('Password reset! Please click your name and sign in with your new password.');
      setIsForgotPass(false);
      setForgotUsername('');
      setForgotFullName('');
      setForgotPassword('');
      setExpandedStudent(null);
      loadStudents();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Verification failed. Check your username and full name.');
    }
  };

  const goToStudentList = () => {
    setIsRegistering(false);
    setIsForgotPass(false);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-indigo-600 -top-20 -left-20" />
      <div className="orb w-72 h-72 bg-purple-600 top-1/2 -right-10" />
      <div className="orb w-48 h-48 bg-blue-600 bottom-10 left-1/4" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full glass hover:bg-white/10 border border-white/10 transition-all duration-300 text-slate-400 hover:text-white"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>
      </div>

      <div className="w-full max-w-md animate-slide-up">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl animate-float"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}>
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-1">ExamPro</h1>
          <p className="text-slate-400 text-sm">Online Examination System</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-2 shadow-2xl"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}>

          {/* Tab Switcher */}
          {!isForgotPass && !isRegistering && (
            <div className="flex rounded-2xl p-1 bg-black/30 mb-2">
              {[
                { key: 'student', label: 'Student Login', icon: User   },
                { key: 'admin',   label: 'Admin Login',   icon: Shield },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setError(''); setSuccessMsg(''); setExpandedStudent(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                    ${tab === key
                      ? key === 'admin'
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="p-6">

            {/* Success Message */}
            {successMsg && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* ══ FORGOT PASSWORD ══ */}
            {tab === 'student' && isForgotPass && (
              <div className="animate-fade-in space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                    <KeyRound className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Reset Password</h3>
                  <p className="text-xs text-slate-500 mt-1">Verify your identity to set a new password</p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold">@</span>
                      <input type="text" className="input-field pl-8" placeholder="your_username"
                        value={forgotUsername} onChange={e => setForgotUsername(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                      Full Name <span className="text-xs text-slate-600">(for identity verification)</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" className="input-field pl-10" placeholder="e.g. Alice Smith"
                        value={forgotFullName} onChange={e => setForgotFullName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showForgotPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                        placeholder="••••••••" value={forgotPassword}
                        onChange={e => setForgotPassword(e.target.value)} required minLength={4} />
                      <button type="button" onClick={() => setShowForgotPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={!!loading}
                    className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                      : <><KeyRound className="w-4 h-4" /> Reset Password</>}
                  </button>
                </form>

                <div className="text-center pt-1">
                  <button onClick={goToStudentList}
                    className="flex items-center gap-1 mx-auto text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* ══ REGISTER ══ */}
            {tab === 'student' && isRegistering && !isForgotPass && (
              <div className="animate-fade-in space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white">Create Student Account</h3>
                  <p className="text-xs text-slate-500">Sign up to take examinations</p>
                </div>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" className="input-field pl-10" placeholder="e.g. Charlie Brown"
                        value={regName} onChange={e => setRegName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold">@</span>
                      <input type="text" className="input-field pl-8" placeholder="charlie"
                        value={regUsername} onChange={e => setRegUsername(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showRegPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                        placeholder="••••••••" value={regPassword}
                        onChange={e => setRegPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowRegPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={!!loading} className="w-full btn-primary mt-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering...</>
                      : <><UserPlus className="w-4 h-4" /> Register &amp; Sign In</>}
                  </button>
                </form>
                <div className="text-center pt-1">
                  <button onClick={goToStudentList}
                    className="flex items-center gap-1 mx-auto text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Student List
                  </button>
                </div>
              </div>
            )}

            {/* ══ STUDENT LIST ══ */}
            {tab === 'student' && !isRegistering && !isForgotPass && (
              <div className="animate-fade-in space-y-4">
                <p className="text-slate-400 text-sm text-center">
                  Select your account, then enter your password to sign in
                </p>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {students.length === 0 ? (
                    <p className="text-center text-slate-600 text-sm py-6">No accounts yet — register below!</p>
                  ) : (
                    students.map((acc, idx) => (
                      <StudentCard
                        key={acc.username}
                        idx={idx}
                        account={acc}
                        onLogin={handleLogin}
                        loading={loading}
                        isExpanded={expandedStudent === acc.username}
                        onExpand={setExpandedStudent}
                        onCollapse={() => setExpandedStudent(null)}
                      />
                    ))
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsRegistering(true); setError(''); setSuccessMsg(''); setExpandedStudent(null); }}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500 transition-all duration-300 text-indigo-300 hover:text-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="font-semibold text-sm">Register</span>
                  </button>
                  <button
                    onClick={() => { setIsForgotPass(true); setError(''); setSuccessMsg(''); setExpandedStudent(null); }}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500 transition-all duration-300 text-amber-400 hover:text-white"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span className="font-semibold text-sm">Forgot Password</span>
                  </button>
                </div>
              </div>
            )}

            {/* ══ ADMIN TAB ══ */}
            {tab === 'admin' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 p-4 mb-5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                    AU
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Admin User</p>
                    <p className="text-xs text-purple-400">System Administrator</p>
                  </div>
                  <Shield className="w-5 h-5 text-purple-400 ml-auto" />
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" className="input-field pl-10" placeholder="admin"
                        value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                        placeholder="••••••••" value={password}
                        onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={!!loading}
                    className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                      : <><LogIn className="w-4 h-4" /> Sign In as Admin</>}
                  </button>
                </form>

                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <p className="text-xs text-slate-500">
                    Demo: <span className="text-slate-300 font-mono">admin</span> / <span className="text-slate-300 font-mono">admin123</span>
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
