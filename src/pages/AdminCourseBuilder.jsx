import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getToken } from '@/utils/auth.js';
import ModuleEditor from '@/components/admin/ModuleEditor.jsx';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminCourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', category: '', instructor: '',
    image: '', difficulty: '', duration: '',
  });

  const [modules, setModules] = useState([]);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }), []);

  // ── Load course + modules + lessons ────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [courseRes, modulesRes] = await Promise.all([
          fetch(`${API}/api/admin/courses`, { headers: authHeaders() }),
          fetch(`${API}/api/modules/${courseId}`, { headers: authHeaders() }),
        ]);

        if (!courseRes.ok) throw new Error('Failed to load courses');
        const { courses } = await courseRes.json();
        const course = courses.find((c) => (c._id || c.id).toString() === courseId);
        if (!course) throw new Error('Course not found');

        if (!mounted) return;
        setForm({
          title: course.title || '',
          description: course.description || '',
          category: course.category || '',
          instructor: course.instructor || '',
          image: course.image || '',
          difficulty: course.difficulty || '',
          duration: course.duration || '',
        });

        if (!modulesRes.ok) {
          if (mounted) setModules([]);
        } else {
          const modData = await modulesRes.json();
          const rawModules = modData.modules || [];

          // Fetch lessons for each module in parallel
          const withLessons = await Promise.all(
            rawModules.map(async (m) => {
              const mid = m._id || m.id;
              try {
                const lr = await fetch(`${API}/api/lessons/${mid}`, { headers: authHeaders() });
                if (!lr.ok) return { ...m, lessons: [] };
                const ld = await lr.json();
                return { ...m, lessons: ld.lessons || [] };
              } catch {
                return { ...m, lessons: [] };
              }
            })
          );
          if (mounted) setModules(withLessons);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [courseId, authHeaders]);

  // ── Save course details ────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API}/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      setSaveMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Add module ─────────────────────────────────────────────────────────────
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/modules`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ courseId, title: newModuleTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add module');
      setModules((prev) => [...prev, { ...data.module, lessons: [] }]);
      setNewModuleTitle('');
      setAddingModule(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Reorder modules ────────────────────────────────────────────────────────
  const handleMoveModule = async (index, direction) => {
    const arr = [...modules];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
    const reordered = arr.map((m, i) => ({ ...m, order: i + 1 }));
    setModules(reordered);
    try {
      await fetch(`${API}/api/admin/modules/reorder`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          modules: reordered.map((m) => ({ id: m._id || m.id, order: m.order })),
        }),
      });
    } catch {/* silent */}
  };

  const handleModuleDeleted = (id) =>
    setModules((prev) => prev.filter((m) => (m._id || m.id) !== id));

  const handleModuleUpdated = (updated) =>
    setModules((prev) =>
      prev.map((m) => (m._id || m.id) === (updated._id || updated.id) ? { ...m, ...updated } : m)
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse text-lg">Loading course…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <Link to="/admin" className="text-cyan-400 hover:underline text-sm">← Back to Admin</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-slate-400 hover:text-cyan-400 text-sm transition"
          >
            ← Admin
          </button>
          <div className="w-px h-5 bg-slate-700" />
          <h1 className="text-lg font-bold text-white truncate">
            Course Builder — <span className="text-cyan-400">{form.title || 'Untitled'}</span>
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left panel: Course details ────────────────────────────────── */}
        <section className="lg:col-span-2">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-5">
              Course Details
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { key: 'title', label: 'Title', required: true },
                { key: 'category', label: 'Category', required: true },
                { key: 'instructor', label: 'Instructor', required: true },
                { key: 'difficulty', label: 'Difficulty' },
                { key: 'duration', label: 'Duration (e.g. "8 hours")' },
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
                <label className="block text-xs text-slate-400 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Thumbnail preview */}
              {form.image && (
                <div className="rounded-xl overflow-hidden border border-slate-700">
                  <img src={form.image} alt="thumbnail" className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-xl transition"
                >
                  {saving ? 'Saving…' : 'Save Details'}
                </button>
                {saveMsg && (
                  <span className={`text-sm ${saveMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* ── Right panel: Modules & Lessons ───────────────────────────── */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
              Modules &amp; Lessons
            </h2>
            <span className="text-xs text-slate-500">{modules.length} module{modules.length !== 1 ? 's' : ''}</span>
          </div>

          {modules.length === 0 && !addingModule && (
            <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
              <p className="text-slate-500 text-sm">No modules yet. Add one below.</p>
            </div>
          )}

          {modules.map((mod, idx) => (
            <ModuleEditor
              key={mod._id || mod.id}
              module={mod}
              index={idx}
              total={modules.length}
              onUpdate={handleModuleUpdated}
              onDelete={handleModuleDeleted}
              onMove={handleMoveModule}
            />
          ))}

          {/* Add module */}
          {addingModule ? (
            <form
              onSubmit={handleAddModule}
              className="bg-slate-900/70 border border-cyan-500/30 rounded-xl px-4 py-4 flex gap-3 items-center"
            >
              <input
                autoFocus
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                placeholder="Module title…"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setAddingModule(false); setNewModuleTitle(''); }}
                className="text-slate-400 hover:text-slate-200 text-sm px-2"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddingModule(true)}
              className="w-full border border-dashed border-slate-600 hover:border-cyan-500/60 hover:bg-slate-800/40 text-slate-400 hover:text-cyan-400 text-sm font-medium py-3 rounded-xl transition"
            >
              + Add Module
            </button>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminCourseBuilder;
