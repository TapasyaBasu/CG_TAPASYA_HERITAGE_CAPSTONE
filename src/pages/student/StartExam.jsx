import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, Target, AlertTriangle,
  CheckCircle, Play, ArrowLeft, Info
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getExamById, getQuestionsByExam, getResultByUser } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function StartExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [qCount, setQCount] = useState(0);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  useEffect(() => {
    const e = getExamById(id);
    if (!e) { navigate('/student/exams'); return; }
    setExam(e);
    setQCount(getQuestionsByExam(id).length);
    setAlreadyAttempted(!!getResultByUser(id, user.id));
  }, [id]);

  const rules = [
    'Read each question carefully before answering.',
    'You can navigate between questions using the question panel.',
    'Unanswered questions will be marked as wrong.',
    'The exam will auto-submit when the timer reaches zero.',
    'You cannot pause the exam once started.',
    'Do not refresh or close the browser during the exam.',
  ];

  if (!exam) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/student/exams')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Exams
        </button>

        {/* Exam Header */}
        <div className="glass-strong rounded-3xl p-8 mb-6 animate-slide-up relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
          <div className="relative">
            <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
              <BookOpen className="w-3 h-3" /> Exam Details
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">{exam.title}</h1>
            <p className="text-slate-400 mb-6">{exam.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: Clock, label: `${exam.duration} Minutes`, desc: 'Total Duration', color: 'text-blue-400' },
                { icon: BookOpen, label: `${qCount} Questions`, desc: 'Total Questions', color: 'text-indigo-400' },
                { icon: Target, label: `${exam.passingMarks} / ${exam.totalMarks}`, desc: 'Passing Marks', color: 'text-green-400' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={desc} className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color} mb-1 sm:mb-2`} />
                  <span className="text-sm sm:text-base font-bold text-white text-center">{label}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 mt-0.5 text-center">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="glass rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Instructions</h2>
          </div>
          <ul className="space-y-3">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Warning for attempted */}
        {alreadyAttempted && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-300 text-sm">
              You have already attempted this exam. Starting again will overwrite your previous result.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button onClick={() => navigate('/student/exams')} className="btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={() => navigate(`/student/exam/${id}/test`)}
            className="btn-primary flex-1 text-base py-4"
            style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.5)' }}>
            <Play className="w-5 h-5" /> Start Exam Now
          </button>
        </div>
      </div>
    </div>
  );
}
