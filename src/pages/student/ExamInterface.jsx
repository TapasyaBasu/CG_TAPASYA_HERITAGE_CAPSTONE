import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, ChevronRight, Send, Lock,
  AlertTriangle, CheckCircle, Circle, BookOpen, ArrowLeft, Sun, Moon, Zap
} from 'lucide-react';
import { getExamById, getQuestionsByExam, saveResult } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ── Exam-level countdown (total duration) ────────────────────────────────────
function Timer({ totalSeconds, onExpire }) {
  const [seconds, setSeconds] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pct = (seconds / totalSeconds) * 100;
  const isUrgent = seconds < 60;
  const isWarning = seconds < 300;

  return (
    <div className={`glass rounded-2xl p-4 border transition-all duration-300
      ${isUrgent ? 'border-red-500/40 bg-red-500/10' : isWarning ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-white/10'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-pulse' : isWarning ? 'text-yellow-400' : 'text-indigo-400'}`} />
        <span className="text-xs text-slate-400 font-medium">Exam Time Left</span>
      </div>
      <div className={`text-3xl font-mono font-bold tracking-wider mb-2 ${isUrgent ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'}`}>
        {h > 0 && `${String(h).padStart(2, '0')}:`}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Per-question countdown widget ─────────────────────────────────────────────
function QuestionTimer({ seconds, totalSeconds }) {
  if (!totalSeconds || totalSeconds <= 0) return null;

  const pct = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
  const isUrgent  = seconds <= 5;
  const isWarning = seconds <= 10;

  const color = isUrgent  ? '#ef4444'
              : isWarning ? '#f59e0b'
              : '#6366f1';

  // SVG circle parameters
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-5 transition-all duration-500
      ${isUrgent  ? 'bg-red-500/10 border-red-500/30'
      : isWarning ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-indigo-500/8 border-indigo-500/20'}`}>

      {/* SVG Ring */}
      <div className="relative shrink-0">
        <svg width="64" height="64" className={isUrgent ? 'animate-pulse' : ''}>
          {/* Background track */}
          <circle cx="32" cy="32" r={radius}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          {/* Progress arc */}
          <circle cx="32" cy="32" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 32 32)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
          {/* Center text */}
          <text x="32" y="36" textAnchor="middle"
            fontSize="14" fontWeight="700" fontFamily="monospace"
            fill={color}>
            {seconds}
          </text>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold mb-0.5 ${isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-indigo-300'}`}>
          {isUrgent ? '⚡ Hurry up!' : isWarning ? '⏰ Running low!' : '⏱ Question Timer'}
        </p>
        <p className="text-xs text-slate-500">
          {seconds === 0 ? 'Time up — moving on...' : `${seconds}s of ${totalSeconds}s remaining`}
        </p>
        {/* Progress bar */}
        <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Exam Interface ───────────────────────────────────────────────────────
export default function ExamInterface() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [exam, setExam]               = useState(null);
  const [questions, setQuestions]     = useState([]);
  const [answers, setAnswers]         = useState({});
  const [current, setCurrent]         = useState(0);
  const [submitted, setSubmitted]     = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const startTimeRef = useRef(Date.now());

  // ── Load exam + questions ────────────────────────────────────────────────
  useEffect(() => {
    const e = getExamById(id);
    if (!e) { navigate('/student/exams'); return; }
    const qs = getQuestionsByExam(id);
    if (qs.length === 0) { navigate('/student/exams'); return; }
    setExam(e);
    setQuestions(qs);
  }, [id]);

  // ── Submit exam (defined FIRST so handleQuestionTimeout can reference it) ─
  const submitExam = useCallback((auto = false) => {
    if (submitted) return;
    setSubmitted(true);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score += q.marks;
    });
    saveResult({
      examId: id,
      userId: user.id,
      userName: user.name,
      examTitle: exam.title,
      score,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      timeTaken,
      autoSubmitted: auto,
      answers,
      totalQuestions: questions.length,
      attempted: Object.keys(answers).length,
    });
    navigate(`/student/exam/${id}/result`);
  }, [submitted, questions, answers, exam, user, id]);

  // ── Question timeout handler ─────────────────────────────────────────────
  const handleQuestionTimeout = useCallback(() => {
    setCurrent(c => {
      const next = c + 1;
      if (next < questions.length) return next;
      // last question — submit
      submitExam(true);
      return c;
    });
  }, [questions.length, submitExam]);

  // ── Per-question timer effect ────────────────────────────────────────────
  useEffect(() => {
    const q = questions[current];
    if (!q || !q.timeLimit || q.timeLimit <= 0 || submitted) {
      setQuestionTimeLeft(0);
      return;
    }

    setQuestionTimeLeft(q.timeLimit);

    const timer = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuestionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [current, questions, submitted, handleQuestionTimeout]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const handleAnswer = (qId, optIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const getQuestionStatus = (idx) => {
    const q = questions[idx];
    if (idx === current) return 'current';
    if (idx < current) return 'locked'; // past questions — cannot return
    if (answers[q?.id] !== undefined) return 'answered';
    return 'unanswered';
  };

  // Move forward only — called by Next button
  const goNext = () => {
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentQ      = questions[current];
  const answeredCount = Object.keys(answers).length;
  const progressPct   = (answeredCount / questions.length) * 100;
  const hasQTimer     = currentQ.timeLimit > 0;

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 glass-strong border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to leave? Your exam progress will be lost.')) {
                  navigate(`/student/exam/${id}/start`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20 group"
              title="Exit Exam"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white line-clamp-1">{exam.title}</p>
              <p className="text-xs text-slate-400">{answeredCount}/{questions.length} answered</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Progress bar */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-32 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-xs text-slate-400">{Math.round(progressPct)}%</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            <button onClick={() => setShowSubmitModal(true)}
              className="btn-success text-sm px-4 py-2 flex items-center gap-2">
              <Send className="w-4 h-4" /> Submit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* ── Sidebar: Exam Timer + Navigator + Stats ── */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
            <Timer totalSeconds={exam.duration * 60} onExpire={() => submitExam(true)} />

            {/* Question Navigator */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, idx) => {
                  const status = getQuestionStatus(idx);
                  const qHasTimer = questions[idx]?.timeLimit > 0;
                  const isLocked = status === 'locked';
                  return (
                    <button
                      key={idx}
                      onClick={() => !isLocked && setCurrent(idx)}
                      disabled={isLocked}
                      title={isLocked ? 'Already passed — cannot go back' : `Question ${idx + 1}`}
                      className={`relative w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center
                        ${status === 'current'
                          ? 'bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-110'
                          : status === 'locked'
                          ? 'bg-slate-800/60 text-slate-600 border border-slate-700/40 cursor-not-allowed opacity-50'
                          : status === 'answered'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-white/5 text-slate-500 border border-white/10 hover:border-white/20 hover:text-slate-300'}`}
                    >
                      {isLocked
                        ? <Lock className="w-2.5 h-2.5" />
                        : idx + 1
                      }
                      {qHasTimer && !isLocked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black/20" title="Has time limit" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-3 border-t border-white/10">
                {[
                  { color: 'bg-indigo-500', label: 'Current' },
                  { color: 'bg-green-500/20 border border-green-500/30', label: 'Answered' },
                  { color: 'bg-white/5 border border-white/10', label: 'Upcoming' },
                  { color: 'bg-slate-800/60 border border-slate-700/40 opacity-50', label: 'Locked (past)' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                    <div className={`w-3 h-3 rounded ${color}`} />
                    {label}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="relative w-3 h-3">
                    <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <span>Has timer</span>
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Answered</span>
                  <span className="text-white font-semibold">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-slate-500" /> Remaining</span>
                  <span className="text-white font-semibold">{questions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> With Timer</span>
                  <span className="text-white font-semibold">{questions.filter(q => q.timeLimit > 0).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Question Card ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-strong rounded-2xl p-6 animate-fade-in">
              {/* Question header */}
              <div className="flex items-center justify-between mb-4">
                <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Question {current + 1} of {questions.length}
                </span>
                <span className="text-sm text-slate-400">{currentQ.marks} marks</span>
              </div>

              {/* ── Per-question timer widget ── */}
              {hasQTimer && (
                <QuestionTimer
                  seconds={questionTimeLeft}
                  totalSeconds={currentQ.timeLimit}
                />
              )}

              {/* Question text */}
              <p className="text-lg font-medium text-white leading-relaxed mb-6">
                {currentQ.text}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(currentQ.id, idx)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                        ${isSelected
                          ? 'border-indigo-500/60 bg-indigo-500/15 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8 hover:text-white'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200
                        ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm font-medium flex-1">{option}</span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-indigo-400 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation — forward only, no going back */}
            <div className="flex items-center justify-between gap-3">
              {/* Info badge: shows question position */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Forward only — no going back</span>
              </div>

              {current < questions.length - 1 ? (
                <button
                  onClick={goNext}
                  className="btn-primary">
                  {answers[currentQ.id] !== undefined ? 'Next' : 'Skip'} <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setShowSubmitModal(true)} className="btn-success">
                  <Send className="w-4 h-4" /> Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)} />
          <div className="relative glass-strong rounded-3xl p-8 max-w-md w-full animate-slide-up"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Submit Exam?</h3>
            <p className="text-slate-400 text-sm text-center mb-4">
              You have answered <strong className="text-white">{answeredCount}</strong> of <strong className="text-white">{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && ` ${questions.length - answeredCount} question(s) will be unanswered.`}
            </p>
            <p className="text-slate-500 text-xs text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => { setShowSubmitModal(false); submitExam(false); }} className="btn-success flex-1">
                <Send className="w-4 h-4" /> Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
