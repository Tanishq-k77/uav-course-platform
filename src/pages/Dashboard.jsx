import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, decodeToken } from '@/utils/auth.js';
import { BookOpen, Calendar, PlayCircle, GraduationCap, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* ─── helpers ─────────────────────────────────────────────── */
const courseId = (course) => course?._id || course?.id || '';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/* ─── sub-components ──────────────────────────────────────── */
const ProgressBar = ({ percent = 0 }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs text-gray-400">
      <span>Progress</span>
      <span className="text-cyan-400 font-semibold">{Math.round(percent)}%</span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700"
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

const CourseCard = ({ enrollment, progress, onContinue }) => {
  const course = enrollment.course || {};
  const id = courseId(course);

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-44 bg-slate-800 overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-cyan-900/40 to-purple-900/40">
            <BookOpen className="w-10 h-10 text-cyan-500/60" />
            <span className="text-gray-500 text-xs">No image available</span>
          </div>
        )}
        {/* Difficulty badge */}
        {course.difficulty && (
          <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 backdrop-blur-sm">
            {course.difficulty}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {course.title || 'Untitled Course'}
        </h2>

        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed flex-1">
          {course.description || 'No description available.'}
        </p>

        {/* Enrollment date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Enrolled on {formatDate(enrollment.createdAt)}</span>
        </div>

        {/* Progress bar */}
        <ProgressBar percent={progress} />

        {/* CTA */}
        <button
          type="button"
          onClick={() => onContinue(id)}
          disabled={!id}
          className="mt-1 w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PlayCircle className="w-4 h-4" />
          Continue Learning
        </button>
      </div>
    </div>
  );
};

/* ─── main page ───────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressMap, setProgressMap] = useState({});

  /* Fetch enrollments */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadEnrollments() {
      setIsLoading(true);
      setError('');

      const token = getToken();
      if (!token) {
        setIsLoading(false);
        setError('Please log in to view your courses.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/enrollments/user`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Failed to load enrollments');

        if (!isMounted) return;
        setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);
      } catch (err) {
        if (!isMounted || err.name === 'AbortError') return;
        console.error('Load user enrollments error', err);
        setError(err.message || 'Failed to load enrollments');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEnrollments();
    return () => { isMounted = false; controller.abort(); };
  }, []);

  /* Fetch per-course progress */
  useEffect(() => {
    async function loadProgress() {
      const token = getToken();
      if (!token || enrollments.length === 0) return;

      const payload = decodeToken(token);
      const userId = payload?.sub;
      if (!userId) return;

      const entries = await Promise.all(
        enrollments.map(async (enrollment) => {
          const id = courseId(enrollment.course);
          if (!id) return null;
          try {
            const res = await fetch(`${API_BASE_URL}/api/progress/${id}/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return null;
            return [id, data.percent ?? 0];
          } catch {
            return null;
          }
        })
      );

      const map = {};
      for (const entry of entries) {
        if (entry) map[entry[0]] = entry[1];
      }
      setProgressMap(map);
    }

    loadProgress();
  }, [enrollments]);

  const handleContinue = (id) => {
    if (id) navigate(`/course/${id}/learn`);
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">My Courses</h1>
            {!isLoading && !error && enrollments.length > 0 && (
              <p className="text-sm text-gray-400 mt-0.5">
                {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-400 py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
            <span>Loading your courses…</span>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex items-center gap-3 text-red-400 bg-red-950/40 border border-red-500/30 rounded-xl px-5 py-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && enrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
              <BookOpen className="w-9 h-9 text-cyan-500/60" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-gray-200">
                You have not enrolled in any courses yet.
              </p>
              <p className="text-gray-500 text-sm">
                Browse courses on the home page to get started.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30"
            >
              Explore Courses
            </button>
          </div>
        )}

        {/* Course grid */}
        {!isLoading && !error && enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.id || enrollment._id}
                enrollment={enrollment}
                progress={progressMap[courseId(enrollment.course)] ?? 0}
                onContinue={handleContinue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
