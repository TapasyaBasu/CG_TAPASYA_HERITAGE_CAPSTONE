import React, { useEffect, useState } from 'react';
import {
  BarChart3, Users, TrendingUp, Trophy, XCircle,
  Clock, BookOpen, Search, Filter, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getResults, getExams } from '../../utils/storage';

export default function ViewResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState({ exam: '', status: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    setResults(getResults());
    setExams(getExams());
  }, []);

  const formatTime = (sec) => {
    if (!sec) return 'N/A';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const filtered = results.filter(r => {
    const matchExam = !filter.exam || r.examId === filter.exam;
    const passed = r.score >= r.passingMarks;
    const matchStatus = !filter.status || (filter.status === 'passed' ? passed : !passed);
    const matchSearch = !search || r.userName?.toLowerCase().includes(search.toLowerCase());
    return matchExam && matchStatus && matchSearch;
  });

  const totalPass = filtered.filter(r => r.score >= r.passingMarks).length;
  const avgScore = filtered.length
    ? Math.round(filtered.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / filtered.length)
    : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-1">
            Student <span className="gradient-text">Results</span>
          </h1>
          <p className="text-slate-400">View all exam submissions and performance data.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Submissions', value: filtered.length, color: 'text-indigo-400', border: 'border-indigo-500/20' },
            { icon: Trophy, label: 'Passed', value: totalPass, color: 'text-green-400', border: 'border-green-500/20' },
            { icon: XCircle, label: 'Failed', value: filtered.length - totalPass, color: 'text-red-400', border: 'border-red-500/20' },
            { icon: TrendingUp, label: 'Avg. Score', value: `${avgScore}%`, color: 'text-yellow-400', border: 'border-yellow-500/20' },
          ].map(({ icon: Icon, label, value, color, border }, i) => (
            <div key={label} className={`glass rounded-2xl p-4 border ${border} animate-slide-up`} style={{ animationDelay: `${i * 80}ms` }}>
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center animate-fade-in">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search by student name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="input-field py-2 text-sm w-auto"
              value={filter.exam}
              onChange={e => setFilter(p => ({ ...p, exam: e.target.value }))}>
              <option value="">All Exams</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <select
              className="input-field py-2 text-sm w-auto"
              value={filter.status}
              onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
              <option value="">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center animate-fade-in">
            <BarChart3 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Results Found</h3>
            <p className="text-slate-500">No exam submissions match your filters.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Exam</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((r, idx) => {
                    const passed = r.score >= r.passingMarks;
                    const pct = Math.round((r.score / r.totalMarks) * 100);
                    return (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 text-sm text-slate-500">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                              {r.userName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm font-medium text-white">{r.userName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-300 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                            {r.examTitle}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{r.score}/{r.totalMarks}</span>
                            <div className="w-16 h-1.5 rounded-full bg-white/10">
                              <div className={`h-full rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`badge ${passed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {passed ? <><Trophy className="w-3 h-3" /> Passed</> : <><XCircle className="w-3 h-3" /> Failed</>}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(r.timeTaken)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">{formatDate(r.submittedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
