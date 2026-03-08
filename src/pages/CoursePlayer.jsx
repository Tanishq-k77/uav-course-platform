import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken, decodeToken } from '@/utils/auth.js';
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  CheckCircle,
  BookOpen,
  ArrowLeft,
  Loader2,
  Film,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* ─── helpers ─────────────────────────────────────────────── */
const fmtDuration = (secs) => {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/* ─── ModuleAccordion ─────────────────────────────────────── */
const ModuleAccordion = ({
  mod,
  isOpen,
  onToggle,
  lessons,
  isLoadingLessons,
  selectedLesson,
  onLessonClick,
}) => (
  <div className="rounded-xl border border-slate-700/60 overflow-hidden">
    {/* Module header */}
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
        isOpen
          ? 'bg-slate-800 text-cyan-400'
          : 'bg-slate-900 text-gray-200 hover:bg-slate-800/70'
      }`}
    >
      <span className="flex items-center gap-2 text-left">
        <span className="text-xs text-gray-500 font-mono w-5 flex-shrink-0">
          {mod.order ?? ''}
        </span>
        {mod.title}
      </span>
      {isOpen ? (
        <ChevronDown className="w-4 h-4 flex-shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
      )}
    </button>

    {/* Lesson list */}
    {isOpen && (
      <div className="bg-slate-900/60 divide-y divide-slate-800/60">
        {isLoadingLessons && (
          <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading lessons…
          </div>
        )}
        {!isLoadingLessons && lessons.length === 0 && (
          <p className="px-5 py-3 text-xs text-gray-500 italic">
            No lessons in this module yet.
          </p>
        )}
        {lessons.map((lesson) => {
          const active = selectedLesson?.id === lesson.id;
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onLessonClick(lesson)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left text-xs transition-colors ${
                active
                  ? 'bg-cyan-500/10 text-cyan-300'
                  : 'text-gray-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              {active ? (
                <PlayCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-600" />
              )}
              <span className="flex-1 leading-snug">{lesson.title}</span>
              {lesson.duration ? (
                <span className="text-gray-500 font-mono flex-shrink-0">
                  {fmtDuration(lesson.duration)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

/* ─── main page ───────────────────────────────────────────── */
const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [openModuleId, setOpenModuleId] = useState(null);
  const [lessonsByModule, setLessonsByModule] = useState({}); // { moduleId: Lesson[] }
  const [loadingModuleId, setLoadingModuleId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  /* Load modules on mount */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadModules() {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/modules/${courseId}`, {
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Failed to load modules');
        if (!isMounted) return;

        setCourse(data.course || null);
        const mods = Array.isArray(data.modules) ? data.modules : [];
        setModules(mods);

        // Auto-open and load first module
        if (mods.length > 0) {
          setOpenModuleId(mods[0].id);
        }
      } catch (err) {
        if (!isMounted || err.name === 'AbortError') return;
        console.error('Load modules error', err);
        setError(err.message || 'Failed to load modules');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadModules();
    return () => { isMounted = false; controller.abort(); };
  }, [courseId]);

  /* Load lessons whenever a new module is opened */
  useEffect(() => {
    if (!openModuleId || lessonsByModule[openModuleId]) return;

    let isMounted = true;

    async function loadLessons() {
      setLoadingModuleId(openModuleId);
      try {
        const res = await fetch(`${API_BASE_URL}/api/lessons/${openModuleId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Failed to load lessons');
        if (!isMounted) return;

        const lessons = Array.isArray(data.lessons) ? data.lessons : [];
        setLessonsByModule((prev) => ({ ...prev, [openModuleId]: lessons }));

        // Auto-select first lesson of first module if nothing selected yet
        if (!selectedLesson && lessons.length > 0) {
          setSelectedLesson(lessons[0]);
        }
      } catch (err) {
        console.error('Load lessons error', err);
      } finally {
        if (isMounted) setLoadingModuleId(null);
      }
    }

    loadLessons();
    return () => { isMounted = false; };
  }, [openModuleId]);

  /* Mark lesson complete on video ended */
  const handleVideoEnded = async () => {
    const token = getToken();
    if (!token || !selectedLesson?.id) return;
    try {
      await fetch(`${API_BASE_URL}/api/progress/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId: selectedLesson.id }),
      });
    } catch {
      // soft-fail
    }
  };

  const handleModuleToggle = (id) => {
    setOpenModuleId((prev) => (prev === id ? null : id));
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    // Scroll video into view on mobile
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <span className="text-sm font-semibold text-white line-clamp-1">
          {course?.title || 'Course Player'}
        </span>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1400px] w-full mx-auto">

        {/* ── Left sidebar ── */}
        <aside className="w-full lg:w-80 xl:w-96 bg-slate-900 border-r border-slate-800 flex flex-col lg:h-[calc(100vh-53px)] lg:sticky lg:top-[53px]">
          <div className="px-4 py-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Course Content
            </h2>
            {!isLoading && modules.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {modules.length} module{modules.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Loading */}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                Loading modules…
              </div>
            )}

            {/* Error */}
            {!isLoading && error && (
              <p className="text-red-400 text-xs px-2">{error}</p>
            )}

            {/* Empty state */}
            {!isLoading && !error && modules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                <BookOpen className="w-10 h-10 text-cyan-500/40" />
                <p className="text-gray-400 text-sm">
                  This course content is coming soon.
                </p>
              </div>
            )}

            {/* Module accordions */}
            {modules.map((mod) => (
              <ModuleAccordion
                key={mod.id}
                mod={mod}
                isOpen={openModuleId === mod.id}
                onToggle={() => handleModuleToggle(mod.id)}
                lessons={lessonsByModule[mod.id] || []}
                isLoadingLessons={loadingModuleId === mod.id}
                selectedLesson={selectedLesson}
                onLessonClick={handleLessonClick}
              />
            ))}
          </div>
        </aside>

        {/* ── Right: video + info ── */}
        <main ref={videoRef} className="flex-1 flex flex-col p-4 sm:p-6 gap-6">
          {selectedLesson ? (
            <>
              {/* Video player */}
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/50">
                <video
                  key={selectedLesson.videoUrl}
                  src={selectedLesson.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onEnded={handleVideoEnded}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Lesson info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                  <Film className="w-4 h-4" />
                  Now Playing
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {selectedLesson.title}
                </h2>
                {selectedLesson.description && (
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl">
                    {selectedLesson.description}
                  </p>
                )}
              </div>

              {/* Next lesson hint */}
              {(() => {
                const currentLessons = lessonsByModule[openModuleId] || [];
                const idx = currentLessons.findIndex((l) => l.id === selectedLesson.id);
                const next = currentLessons[idx + 1];
                if (!next) return null;
                return (
                  <div className="mt-auto pt-4 border-t border-slate-800">
                    <p className="text-xs text-gray-500 mb-2">Up next</p>
                    <button
                      type="button"
                      onClick={() => handleLessonClick(next)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group w-full max-w-lg"
                    >
                      <PlayCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200 group-hover:text-white text-left">
                        {next.title}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </>
          ) : (
            /* No lesson selected yet */
            <div className="flex-1 flex flex-col items-center justify-center gap-5 py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <PlayCircle className="w-9 h-9 text-cyan-500/60" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-gray-200">
                  {modules.length === 0 && !isLoading
                    ? 'This course content is coming soon.'
                    : 'Select a lesson to begin'}
                </p>
                {modules.length > 0 && (
                  <p className="text-gray-500 text-sm">
                    Choose a lesson from the sidebar on the left.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursePlayer;
