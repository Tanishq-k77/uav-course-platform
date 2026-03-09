import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '@/utils/auth.js';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ── Small reusable modal ──────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl shadow-cyan-500/10">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h3 className="font-bold text-white text-sm">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition text-lg leading-none">✕</button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── Course form (shared by create + edit) ─────────────────────────────────────
const EMPTY_FORM = { title: '', description: '', category: '', instructor: '', image: '', difficulty: '', duration: '' };

const CourseForm = ({ initial = EMPTY_FORM, onSubmit, saving, error }) => {
  const [form, setForm] = useState(initial);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded px-3 py-2">{error}</p>
      )}
      {[
        { key: 'title', label: 'Title', required: true },
        { key: 'category', label: 'Category', required: true },
        { key: 'instructor', label: 'Instructor', required: true },
        { key: 'difficulty', label: 'Difficulty (e.g. Beginner)' },
        { key: 'duration', label: 'Duration (e.g. 8 hours)' },
        { key: 'image', label: 'Thumbnail URL', type: 'url' },
      ].map(({ key, label, required, type }) => (
        <div key={key}>
          <label className="block text-xs text-slate-400 mb-1">
            {label}{required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <input
            type={type || 'text'}
            required={required}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Description <span className="text-red-400">*</span></label>
        <textarea
          required
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition mt-1"
      >
        {saving ? 'Saving…' : 'Save Course'}
      </button>
    </form>
  );
};

// ── Main AdminDashboard ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState(null); // course object or null
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, eRes] = await Promise.all([
        fetch(`${API}/api/admin/courses`, { headers: authHeaders() }),
        fetch(`${API}/api/admin/enrollments`, { headers: authHeaders() }),
      ]);

      if (!cRes.ok) throw new Error('Failed to load courses');
      const { courses: cl } = await cRes.json();
      setCourses(cl);

      if (eRes.ok) {
        const { enrollments: el } = await eRes.json();
        setEnrollments(Array.isArray(el) ? el : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async (form) => {
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(`${API}/api/admin/courses`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');
      setShowCreate(false);
      loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = async (form) => {
    setSaving(true);
    setFormError('');
    const id = editCourse._id || editCourse.id;
    try {
      const res = await fetch(`${API}/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setEditCourse(null);
      loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? All modules and lessons will be removed.`)) return;
    const id = course._id || course.id;
    try {
      const res = await fetch(`${API}/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Delete failed');
      }
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage courses, modules, and enrollments</p>
          </div>
          <div className="flex gap-2">
            {tab === 'courses' && (
              <button
                onClick={() => { setFormError(''); setShowCreate(true); }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                + New Course
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 pb-0">
          {['courses', 'enrollments'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`capitalize text-sm font-medium px-4 py-2.5 border-b-2 transition ${
                tab === t
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
              {t === 'enrollments' && enrollments.length > 0 && (
                <span className="ml-1.5 bg-cyan-500/20 text-cyan-300 text-xs px-1.5 py-0.5 rounded-full">
                  {enrollments.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-cyan-400 animate-pulse">Loading…</div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* ── Courses tab ─────────────────────────────────────────────── */}
        {!loading && !error && tab === 'courses' && (
          <div className="space-y-3">
            {courses.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                No courses yet. Click <strong className="text-cyan-400">+ New Course</strong> to create one.
              </div>
            )}
            {courses.map((course) => {
              const id = course._id || course.id;
              return (
                <div
                  key={id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-start gap-4 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-2xl">🎓</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {course.category && (
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{course.category}</span>
                      )}
                      {course.difficulty && (
                        <span className="text-xs text-slate-400">{course.difficulty}</span>
                      )}
                      {course.duration && (
                        <span className="text-xs text-slate-400">⏱ {course.duration}</span>
                      )}
                      <span className="text-xs text-cyan-400/70">
                        {course.moduleCount ?? 0} module{course.moduleCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => navigate(`/admin/course/${id}`)}
                      className="text-xs bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/60 px-3 py-1.5 rounded-lg transition font-medium"
                    >
                      Build
                    </button>
                    <button
                      onClick={() => { setFormError(''); setEditCourse(course); }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Enrollments tab ─────────────────────────────────────────── */}
        {!loading && !error && tab === 'enrollments' && (
          <>
            {enrollments.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No enrollments found.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-cyan-500/5">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/80">
                    <tr>
                      {['Student', 'Email', 'Course', 'Phone', 'Experience', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id || enrollment._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-100 whitespace-nowrap">{enrollment.student?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">{enrollment.student?.email || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-100 whitespace-nowrap">{enrollment.course?.title || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">{enrollment.phone || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-300 capitalize whitespace-nowrap">{enrollment.experienceLevel || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                          {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      {showCreate && (
        <Modal title="Create New Course" onClose={() => setShowCreate(false)}>
          <CourseForm onSubmit={handleCreate} saving={saving} error={formError} />
        </Modal>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      {editCourse && (
        <Modal title={`Edit — ${editCourse.title}`} onClose={() => setEditCourse(null)}>
          <CourseForm
            initial={{
              title: editCourse.title || '',
              description: editCourse.description || '',
              category: editCourse.category || '',
              instructor: editCourse.instructor || '',
              image: editCourse.image || '',
              difficulty: editCourse.difficulty || '',
              duration: editCourse.duration || '',
            }}
            onSubmit={handleEdit}
            saving={saving}
            error={formError}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
