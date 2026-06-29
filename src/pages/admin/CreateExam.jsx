import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Clock, Target, BookOpen, AlignLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { saveExam, getExamById } from '../../utils/storage';

export default function CreateExam() {
  const navigate = useNavigate();
  const { id } = useParams(); // if editing
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 60,
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const exam = getExamById(id);
      if (exam) setForm(exam);
      else navigate('/admin/dashboard');
    }
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.duration < 1 || form.duration > 300) e.duration = 'Duration must be between 1 and 300 minutes';
    if (form.passingMarks > form.totalMarks) e.passingMarks = 'Passing marks cannot exceed total marks';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    saveExam(isEditing ? { ...form, id } : form);
    setSaving(false);
    navigate('/admin/dashboard');
  };

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const fields = [
    {
      icon: AlignLeft, label: 'Exam Title', field: 'title', type: 'text',
      placeholder: 'e.g., JavaScript Fundamentals', full: true
    },
    {
      icon: BookOpen, label: 'Description', field: 'description', type: 'textarea',
      placeholder: 'Describe what this exam covers...', full: true
    },
    {
      icon: Clock, label: 'Duration (minutes)', field: 'duration', type: 'number',
      placeholder: '30', min: 1, max: 300
    },
    {
      icon: Target, label: 'Total Marks', field: 'totalMarks', type: 'number',
      placeholder: '100', min: 1
    },
    {
      icon: Target, label: 'Passing Marks', field: 'passingMarks', type: 'number',
      placeholder: '60', min: 1
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-white mb-1">
            {isEditing ? 'Edit' : 'Create'} <span className="gradient-text">Exam</span>
          </h1>
          <p className="text-slate-400 mb-8">Fill in the details below to {isEditing ? 'update the' : 'set up a new'} exam.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="glass-strong rounded-3xl p-8 space-y-5">
              {fields.map(({ icon: Icon, label, field, type, placeholder, full, min, max }) => (
                <div key={field} className={full ? 'col-span-2' : ''}>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
                    <Icon className="w-4 h-4 text-indigo-400" /> {label}
                  </label>
                  {type === 'textarea' ? (
                    <textarea
                      className="input-field resize-none"
                      rows={3}
                      placeholder={placeholder}
                      value={form[field]}
                      onChange={set(field)}
                    />
                  ) : (
                    <input
                      type={type}
                      className="input-field"
                      placeholder={placeholder}
                      value={form[field]}
                      min={min}
                      max={max}
                      onChange={set(field)}
                    />
                  )}
                  {errors[field] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">Exam Status</p>
                  <p className="text-xs text-slate-500">Students can see and take active exams</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${form.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                  {form.isActive ? <><ToggleRight className="w-5 h-5" /> Active</> : <><ToggleLeft className="w-5 h-5" /> Inactive</>}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-ghost flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed">
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  : <><Save className="w-4 h-4" /> {isEditing ? 'Update' : 'Create'} Exam</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
