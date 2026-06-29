import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, Target, Trophy, ChevronRight,
  CheckCircle, Lock, Play, AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getExams, getQuestionsByExam, getResultByUser } from '../../utils/storage';

export default function ExamList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const allExams = getExams().filter(e => e.isActive);
    setExams(allExams);
  }, []);

  const getExamStatus = (exam) => {
    const result = getResultByUser(exam.id, user.id);
    const qCount = getQuestionsByExam(exam.id).length;
    return { result, qCount };
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <BookOpen className="w-3 h-3" /> Available Exams
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-1">
            Hello, <span className="gradient-text">{user?.name}! 👋</span>
          </h1>
          <p className="text-slate-500 text-sm mb-1">@{user?.username}</p>
          <p className="text-slate-400 text-lg">Choose an exam to get started. Good luck!</p>
        </div>

        {exams.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center animate-fade-in">
            <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Exams Available</h3>
            <p className="text-slate-500">Check back later for new exams.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, i) => {
              const { result, qCount } = getExamStatus(exam);
              const attempted = !!result;
              const passed = result && result.score >= exam.passingMarks;

              return (
                <div key={exam.id}
                  className="card group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => !attempted && navigate(`/student/exam/${exam.id}/start`)}>

                  {/* Top gradient bar */}
                  <div className="h-1.5 -mx-6 -mt-6 mb-6 rounded-t-2xl"
                    style={{ background: attempted ? (passed ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)') : 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)' }} />

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`badge ${attempted
                      ? passed
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                      {attempted ? (passed ? <><Trophy className="w-3 h-3" /> Passed</> : <><AlertCircle className="w-3 h-3" /> Failed</>) : <><Play className="w-3 h-3" /> Available</>}
                    </span>
                    {attempted && (
                      <span className="text-lg font-bold gradient-text">{result.score}/{exam.totalMarks}</span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">{exam.title}</h3>
                  <p className="text-slate-400 text-sm mb-5 line-clamp-2">{exam.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { icon: Clock, label: `${exam.duration} min`, desc: 'Duration' },
                      { icon: BookOpen, label: qCount, desc: 'Questions' },
                      { icon: Target, label: `${exam.passingMarks}%`, desc: 'Passing' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={desc} className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10">
                        <Icon className="w-4 h-4 text-indigo-400 mb-1" />
                        <span className="text-sm font-bold text-white">{label}</span>
                        <span className="text-[10px] text-slate-500">{desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {attempted ? (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/student/exam/${exam.id}/result`); }}
                      className="btn-ghost w-full text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" /> View Result
                    </button>
                  ) : (
                    <button className="btn-primary w-full text-sm group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.6)]">
                      Start Exam <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
