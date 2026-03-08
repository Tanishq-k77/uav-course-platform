import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load course');
        }
        if (!isMounted) return;
        setCourse(data.course);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load course');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-gray-300">Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error || 'Course not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">{course.title}</h1>
        <p className="text-gray-300">{course.description}</p>
        <p className="text-sm text-gray-400">
          Instructor: <span className="text-cyan-400">{course.instructor}</span>
        </p>
      </div>
    </div>
  );
};

export default CourseDetails;

