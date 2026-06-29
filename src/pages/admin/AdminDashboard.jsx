import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, BookOpen, Clock, Users, Trash2, Settings,
  BarChart3, GraduationCap, TrendingUp, Edit3, Eye
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getExams, deleteExam, getResultsByExam, getQuestionsByExam } from '../../utils/storage';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalAttempts: 0, avgScore: 0 });

  const loadData = () => {
    const all = getExams();
    let totalAttempts = 0, totalScore = 0, totalScoreCount = 0;
    all.forEach(e => {
      const results = getResultsByExam(e.id);
      totalAttempts += results.length;
      results.forEach(r => { totalScore += (r.score / r.totalMarks) * 100; totalScoreCount++; });
    });
    setExams(all);
    setStats({
      total: all.length,
      totalAttempts,
      avgScore: totalScoreCount ? Math.round(totalScore / totalScoreCount) : 0,
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete exam "${title}"? This will also remove all results and questions.`)) {
      deleteExam(id);
      loadData();
    }
  };

  const statCards = [
    { icon: BookOpen, label: 'Total Exams', value: stats.total, color: 'text-indigo-400', bg: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/20' },
    { icon: Users, label: 'Total Attempts', value: stats.totalAttempts, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
    { icon: TrendingUp, label: 'Average Score', value: `${stats.avgScore}%`, color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-slate-400">Manage exams, questions, and view student results.</p>
          </div>
          <button onClick={() => navigate('/admin/exam/create')} className="btn-primary self-start sm:self-auto">
            <Plus className="w-5 h-5" /> Create Exam
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {statCards.map(({ icon: Icon, label, value, color, bg, border }, i) => (
            <div key={label}
              className={`glass rounded-2xl p-6 border ${border} bg-gradient-to-br ${bg} animate-slide-up`}
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 ${color}`} />
                <span className="text-xs text-slate-500 font-medium">All Time</span>
              </div>
              <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Exams List */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" /> All Exams
            </h2>
          </div>

          {exams.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No Exams Yet</h3>
              <p className="text-slate-500 mb-6">Create your first exam to get started.</p>
              <button onClick={() => navigate('/admin/exam/create')} className="btn-primary mx-auto">
                <Plus className="w-4 h-4" /> Create First Exam
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam, i) => {
                const results = getResultsByExam(exam.id);
                const qCount = getQuestionsByExam(exam.id).length;
                const passRate = results.length
                  ? Math.round((results.filter(r => r.score >= r.passingMarks).length / results.length) * 100)
                  : 0;

                return (
                  <div key={exam.id} className="card group animate-slide-up" style={{ animationDelay: `${(i + 4) * 80}ms` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white group-hover:gradient-text transition-all duration-300 truncate">
                            {exam.title}
                          </h3>
                          <span className={`badge shrink-0 ${exam.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-1">{exam.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.duration} min</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {qCount} questions</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {results.length} attempts</span>
                          {results.length > 0 && (
                            <span className="flex items-center gap-1 text-green-400"><TrendingUp className="w-3.5 h-3.5" /> {passRate}% pass rate</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:mt-0 mt-3 w-full sm:w-auto">
                        <button
                          onClick={() => navigate(`/admin/exam/${exam.id}/questions`)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all flex-1 sm:flex-none justify-center">
                          <Settings className="w-3.5 h-3.5" /> Questions
                        </button>
                        <button
                          onClick={() => navigate('/admin/results')}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all flex-1 sm:flex-none justify-center">
                          <Eye className="w-3.5 h-3.5" /> Results
                        </button>
                        <button
                          onClick={() => navigate(`/admin/exam/${exam.id}/edit`)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex-1 sm:flex-none justify-center">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id, exam.title)}
                          className="flex items-center justify-center p-2 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
