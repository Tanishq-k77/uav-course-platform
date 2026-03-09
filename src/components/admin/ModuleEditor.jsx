import React, { useState } from 'react';
import { getToken } from '@/utils/auth.js';
import LessonEditor from './LessonEditor.jsx';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ModuleEditor = ({ module: initialModule, index, total, onUpdate, onDelete, onMove }) => {
  const [module, setModule] = useState(initialModule);
  const [lessons, setLessons] = useState(initialModule.lessons || []);
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initialModule.title);
  const [saving, setSaving] = useState(false);

  const id = module._id || module.id;

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  const handleRename = async () => {
    if (!editTitle.trim() || editTitle.trim() === module.title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/modules/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to rename module');
      const updated = { ...module, title: editTitle.trim() };
      setModule(updated);
      onUpdate?.(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    const lessonCount = lessons.length;
    const msg = lessonCount > 0
      ? `Delete "${module.title}" and its ${lessonCount} lesson(s)? This cannot be undone.`
      : `Delete "${module.title}"?`;
    if (!window.confirm(msg)) return;
    try {
      const res = await fetch(`${API}/api/admin/modules/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to delete module');
      }
      onDelete?.(id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/40">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={() => onMove?.(index, -1)}
            disabled={index === 0}
            className="text-slate-500 hover:text-cyan-400 disabled:opacity-20 text-xs leading-none"
            title="Move module up"
          >
            ▲
          </button>
          <button
            onClick={() => onMove?.(index, 1)}
            disabled={index === total - 1}
            className="text-slate-500 hover:text-cyan-400 disabled:opacity-20 text-xs leading-none"
            title="Move module down"
          >
            ▼
          </button>
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-slate-400 hover:text-slate-200 text-sm transition shrink-0"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '▾' : '▸'}
        </button>

        {/* Title / edit */}
        {editing ? (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              autoFocus
              className="flex-1 bg-slate-900 border border-cyan-500/60 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-400"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') { setEditing(false); setEditTitle(module.title); }
              }}
            />
            <button
              onClick={handleRename}
              disabled={saving}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setEditTitle(module.title); }}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-semibold text-slate-100 text-sm truncate">{module.title}</span>
            <span className="text-xs text-slate-500 shrink-0 mr-1">
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-slate-400 hover:text-cyan-400 transition shrink-0"
              title="Rename module"
            >
              ✎
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-red-400/60 hover:text-red-400 transition shrink-0 ml-1"
              title="Delete module"
            >
              🗑
            </button>
          </>
        )}
      </div>

      {/* Lesson list */}
      {expanded && (
        <div className="px-4 pb-4 pt-2">
          <LessonEditor
            moduleId={id}
            lessons={lessons}
            onLessonsChange={setLessons}
          />
        </div>
      )}
    </div>
  );
};

export default ModuleEditor;
