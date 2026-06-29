import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy, XCircle, CheckCircle, Clock, Target,
  BookOpen, ArrowLeft, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getExamById, getResultByUser, getQuestionsByExam } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const e = getExamById(id);
    const r = getResultByUser(id, user.id);
    if (!e || !r) { navigate('/student/exams'); return; }
    setExam(e);
    setResult(r);
    setQuestions(getQuestionsByExam(id));
  }, [id]);

  if (!result || !exam) return null;

  const passed = result.score >= result.passingMarks;
  const percentage = Math.round((result.score / result.totalMarks) * 100);
  const correctCount = questions.filter(q => result.answers?.[q.id] === q.correctAnswer).length;
  const wrongCount = result.attempted - correctCount;
  const skippedCount = questions.length - result.attempted;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/student/exams')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Exams
        </button>

        {/* Result Hero */}
        <div className="glass-strong rounded-3xl p-10 mb-6 text-center animate-slide-up relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ background: passed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }} />

          <div className="relative">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float`}
              style={{ background: passed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              {passed ? <Trophy className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
            </div>

            <h1 className={`text-5xl font-black mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? '🎉 Passed!' : '😔 Failed'}
            </h1>
            <p className="text-slate-400 mb-6">{exam.title}</p>

            {/* Score Ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={passed ? '#10b981' : '#ef4444'} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${passed ? 'text-green-400' : 'text-red-400'}`}>{percentage}%</span>
                  <span className="text-xs text-slate-500">Score</span>
                </div>
              </div>
            </div>

            <div className="text-2xl font-bold text-white">
              {result.score} / {result.totalMarks} marks
            </div>
            {result.autoSubmitted && (
              <p className="text-sm text-yellow-400 mt-2 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> Auto-submitted when timer expired
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {[
            { icon: CheckCircle, label: 'Correct', value: correctCount, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            { icon: XCircle, label: 'Wrong', value: wrongCount, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { icon: BookOpen, label: 'Skipped', value: skippedCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { icon: Clock, label: 'Time Taken', value: formatTime(result.timeTaken), color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`glass rounded-2xl p-4 flex flex-col items-center gap-2 border ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Review Answers */}
        <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
            <span className="font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Review Answers
            </span>
            {showReview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showReview && (
            <div className="border-t border-white/10 divide-y divide-white/10">
              {questions.map((q, idx) => {
                const userAns = result.answers?.[q.id];
                const isCorrect = userAns === q.correctAnswer;
                const isSkipped = userAns === undefined;
                return (
                  <div key={q.id} className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`badge shrink-0 mt-0.5 ${isSkipped ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {isSkipped ? 'Skipped' : isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                      <p className="text-sm font-medium text-white">
                        <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                        {q.text}
                      </p>
                    </div>
                    <div className="sm:ml-16 ml-4 space-y-1.5">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                          ${oi === q.correctAnswer ? 'bg-green-500/15 text-green-300 border border-green-500/20'
                            : oi === userAns && !isCorrect ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                            : 'text-slate-500'}`}>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border border-current/30">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                          {oi === q.correctAnswer && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                          {oi === userAns && !isCorrect && <XCircle className="w-3.5 h-3.5 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <button onClick={() => navigate('/student/exams')} className="btn-ghost flex-1">
            <ArrowLeft className="w-4 h-4" /> Back to Exams
          </button>
          <button onClick={() => navigate(`/student/exam/${id}/start`)} className="btn-primary flex-1">
            <RotateCcw className="w-4 h-4" /> Retake Exam
          </button>
        </div>
      </div>
    </div>
  );
}
