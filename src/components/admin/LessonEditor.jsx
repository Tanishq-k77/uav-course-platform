import React, { useState } from 'react';
import { getToken } from '@/utils/auth.js';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const LessonEditor = ({ moduleId, lessons: initialLessons, onLessonsChange }) => {
  const [lessons, setLessons] = useState(initialLessons || []);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', videoUrl: '', description: '', duration: '' });

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  const sync = (updated) => {
    setLessons(updated);
    onLessonsChange?.(updated);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const dur = parseInt(form.duration, 10);
    if (!form.title.trim() || !form.videoUrl.trim() || !dur || dur < 1) {
      setError('Title, video URL, and duration (seconds > 0) are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/lessons`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          moduleId,
          title: form.title.trim(),
          videoUrl: form.videoUrl.trim(),
          description: form.description.trim(),
          duration: dur,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add lesson');
      const newLesson = { ...data.lesson, id: data.lesson._id || data.lesson.id };
      const updated = [...lessons, newLesson];
      sync(updated);
      setForm({ title: '', videoUrl: '', description: '', duration: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`${API}/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to delete lesson');
      }
      sync(lessons.filter((l) => (l._id || l.id) !== lessonId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const newArr = [...lessons];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newArr.length) return;
    [newArr[index], newArr[swapIdx]] = [newArr[swapIdx], newArr[index]];
    const reordered = newArr.map((l, i) => ({ ...l, order: i + 1 }));
    sync(reordered);
    try {
      await fetch(`${API}/api/admin/lessons/reorder`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          lessons: reordered.map((l) => ({ id: l._id || l.id, order: l.order })),
        }),
      });
    } catch {/* silent */}
  };

  const formatDuration = (secs) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mt-2 space-y-2">
      {lessons.length === 0 && (
        <p className="text-xs text-slate-500 italic pl-1">No lessons yet.</p>
      )}

      {lessons.map((lesson, idx) => {
        const id = lesson._id || lesson.id;
        return (
          <div
            key={id}
            className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 group"
          >
            {/* Order handle */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0}
                className="text-slate-500 hover:text-cyan-400 disabled:opacity-20 leading-none text-xs"
                title="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => handleMove(idx, 1)}
                disabled={idx === lessons.length - 1}
                className="text-slate-500 hover:text-cyan-400 disabled:opacity-20 leading-none text-xs"
                title="Move down"
              >
                ▼
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{lesson.title}</p>
              <p className="text-xs text-slate-500 truncate">{lesson.videoUrl}</p>
            </div>

            <span className="text-xs text-cyan-400/70 shrink-0">{formatDuration(lesson.duration)}</span>

            <button
              onClick={() => handleDelete(id)}
              className="ml-1 text-red-400/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs shrink-0"
              title="Delete lesson"
            >
              ✕
            </button>
          </div>
        );
      })}

      {showForm ? (
        <form onSubmit={handleAdd} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3 mt-2">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">New Lesson</p>
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded px-2 py-1">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Title *</label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                placeholder="Lesson title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Duration (seconds) *</label>
              <input
                type="number"
                min={1}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                placeholder="e.g. 300"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Video URL *</label>
            <input
              type="url"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              placeholder="https://..."
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Description (optional)</label>
            <textarea
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
              placeholder="Short description…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
            >
              {saving ? 'Adding…' : 'Add Lesson'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-1 text-xs text-cyan-400 hover:text-cyan-300 border border-dashed border-cyan-500/40 hover:border-cyan-400/60 rounded-lg px-3 py-1.5 w-full transition"
        >
          + Add Lesson
        </button>
      )}
    </div>
  );
};

export default LessonEditor;
