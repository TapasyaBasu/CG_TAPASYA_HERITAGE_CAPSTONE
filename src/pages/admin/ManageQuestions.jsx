import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, ArrowLeft, Trash2, Edit3, Save, X,
  BookOpen, CheckCircle, GripVertical, AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getExamById, getQuestionsByExam, saveQuestion, deleteQuestion } from '../../utils/storage';

const emptyQuestion = { examId: '', text: '', options: ['', '', '', ''], correctAnswer: 0, marks: 10, timeLimit: 0 };

function QuestionForm({ question, examId, onSave, onCancel }) {
  const [form, setForm] = useState(question || { ...emptyQuestion, examId });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.text.trim()) e.text = 'Question text is required';
    form.options.forEach((opt, i) => { if (!opt.trim()) e[`opt${i}`] = 'Option cannot be empty'; });
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-indigo-500/30 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-indigo-400" />
          {question ? 'Edit Question' : 'Add New Question'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Question Text</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="Enter your question here..."
          value={form.text}
          onChange={e => { setForm(p => ({ ...p, text: e.target.value })); setErrors(p => ({ ...p, text: '' })); }}
        />
        {errors.text && <p className="text-red-400 text-xs mt-1">{errors.text}</p>}
      </div>

      {/* Options */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Answer Options</label>
        <div className="space-y-2">
          {form.options.map((opt, i) => (
            <div key={i} className="relative">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, correctAnswer: i }))}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 border-2
                    ${form.correctAnswer === i ? 'bg-green-500 border-green-500 text-white scale-110' : 'border-white/20 text-slate-400 hover:border-green-500/50 hover:text-green-400'}`}>
                  {String.fromCharCode(65 + i)}
                </button>
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={e => {
                    const opts = [...form.options];
                    opts[i] = e.target.value;
                    setForm(p => ({ ...p, options: opts }));
                    setErrors(p => ({ ...p, [`opt${i}`]: '' }));
                  }}
                />
                {form.correctAnswer === i && (
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                )}
              </div>
              {errors[`opt${i}`] && <p className="text-red-400 text-xs mt-1 ml-11">{errors[`opt${i}`]}</p>}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 ml-11">Click the letter button to mark the correct answer</p>
      </div>

      {/* Marks & Time Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Marks for this question</label>
          <input
            type="number"
            className="input-field"
            min={1}
            value={form.marks}
            onChange={e => setForm(p => ({ ...p, marks: parseInt(e.target.value) || 1 }))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">
            ⏱ Time Limit per Question
            <span className="ml-2 text-amber-400 font-semibold">(seconds)</span>
          </label>
          <input
            type="number"
            className="input-field"
            min={0}
            placeholder="e.g. 30 for 30 seconds, 0 = unlimited"
            value={form.timeLimit || 0}
            onChange={e => setForm(p => ({ ...p, timeLimit: parseInt(e.target.value) || 0 }))}
          />
          <p className="text-xs text-slate-600 mt-1">
            {form.timeLimit > 0
              ? `Student gets ${form.timeLimit}s to answer — auto-advances on timeout`
              : 'No limit — student takes as long as needed'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-ghost flex-1 text-sm py-2.5">Cancel</button>
        <button onClick={handleSave} className="btn-primary flex-1 text-sm py-2.5">
          <Save className="w-4 h-4" /> Save Question
        </button>
      </div>
    </div>
  );
}

export default function ManageQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQ, setEditingQ] = useState(null);

  const load = () => {
    const e = getExamById(id);
    if (!e) { navigate('/admin/dashboard'); return; }
    setExam(e);
    setQuestions(getQuestionsByExam(id));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = (q) => {
    saveQuestion({ ...q, examId: id });
    load();
    setShowForm(false);
    setEditingQ(null);
  };

  const handleDelete = (qId) => {
    if (window.confirm('Delete this question?')) {
      deleteQuestion(qId);
      load();
    }
  };

  if (!exam) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Manage <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> {exam.title}
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 ml-1">
                {questions.length} questions
              </span>
            </p>
          </div>
          {!showForm && !editingQ && (
            <button onClick={() => setShowForm(true)} className="btn-primary self-start sm:self-auto">
              <Plus className="w-5 h-5" /> Add Question
            </button>
          )}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="mb-6">
            <QuestionForm
              examId={id}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Question List */}
        {questions.length === 0 && !showForm ? (
          <div className="glass rounded-2xl p-16 text-center animate-fade-in">
            <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Questions Yet</h3>
            <p className="text-slate-500 mb-6">Start adding MCQ questions to this exam.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" /> Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id}>
                {editingQ?.id === q.id ? (
                  <QuestionForm
                    question={editingQ}
                    examId={id}
                    onSave={handleSave}
                    onCancel={() => setEditingQ(null)}
                  />
                ) : (
                  <div className="card group animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <GripVertical className="w-4 h-4 text-slate-600" />
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-indigo-500/20 text-indigo-400">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white mb-3">{q.text}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg
                                ${oi === q.correctAnswer ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                                <span className="font-bold">{String.fromCharCode(65 + oi)}.</span>
                                <span className="truncate">{opt}</span>
                                {oi === q.correctAnswer && <CheckCircle className="w-3 h-3 ml-auto shrink-0" />}
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500 font-medium">{q.marks} marks</span>
                            {q.timeLimit > 0 && (
                              <span className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                                ⏱️ {q.timeLimit}s time limit
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setEditingQ(q)}
                          className="p-2 rounded-lg text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 rounded-lg text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
