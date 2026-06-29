import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, BookOpen, BarChart3,
  LogOut, ArrowLeft, Sun, Moon, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Home pages for each role
  const homePages = {
    admin: '/admin/dashboard',
    student: '/student/exams',
  };
  const homePage = user ? homePages[user.role] : '/login';
  const isOnHomePage = location.pathname === homePage;

  const handleBack = () => {
    if (isOnHomePage) {
      navigate('/login');
    } else {
      navigate(-1);
    }
  };

  const studentLinks = [
    { to: '/student/exams', label: 'My Exams', icon: BookOpen },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/results', label: 'Results', icon: BarChart3 },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Back Button + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back button always visible */}
            <button
              onClick={handleBack}
              title="Go Back"
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Logo */}
            <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/student/exams'}
              className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg gradient-text">ExamPro</span>
                <div className="text-[9px] sm:text-[10px] text-slate-500 -mt-0.5 font-medium tracking-wider uppercase">
                  {user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
                </div>
              </div>
            </Link>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(to)
                    ? 'text-white bg-white/10 border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right: Theme Toggle + User Info + Logout (Desktop) + Hamburger (Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
            </button>

            {/* Desktop Account Info & Logout */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass border border-white/10">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{
                    background: user?.role === 'admin'
                      ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                      : 'linear-gradient(135deg, #6366f1, #818cf8)'
                  }}
                >
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white leading-none">{user?.name}</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${user?.role === 'admin' ? 'text-purple-400' : 'text-indigo-400'}`}>
                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Links Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-strong border-t border-white/10 px-4 py-4 space-y-3 animate-fade-in">
          {/* Navigation Links */}
          <div className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mobile-menu-link
                  ${isActive(to)
                    ? 'text-white bg-indigo-500/10 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="w-4.5 h-4.5" />
                {label}
              </Link>
            ))}
          </div>

          <div className="h-px bg-white/10 my-2" />

          {/* User Profile Pill & Logout (Mobile) */}
          <div className="flex items-center justify-between p-3 rounded-2xl glass border border-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{
                  background: user?.role === 'admin'
                    ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                    : 'linear-gradient(135deg, #6366f1, #818cf8)'
                }}
              >
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">@{user?.username}</p>
              </div>
            </div>
            
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-500/25"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
