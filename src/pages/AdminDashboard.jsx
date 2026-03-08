import React, { useEffect, useState } from 'react';
import { getToken } from '@/utils/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadEnrollments() {
      setIsLoading(true);
      setError('');

      const token = getToken();
      if (!token) {
        setIsLoading(false);
        setError('Missing admin token. Please log in as an admin.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/enrollments`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let message = 'Failed to load enrollments.';
          try {
            const data = await response.json();
            if (data?.message) message = data.message;
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(message);
        }

        const data = await response.json();
        if (!isMounted) return;
        setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);
      } catch (err) {
        if (!isMounted || err.name === 'AbortError') return;
        // eslint-disable-next-line no-console
        console.error('Failed to fetch enrollments', err);
        setError(err.message || 'Failed to load enrollments.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEnrollments();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            View all course enrollments submitted by students.
          </p>
        </div>

        {isLoading && (
          <div className="text-gray-300">Loading enrollments...</div>
        )}

        {!isLoading && error && (
          <div className="text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {!isLoading && !error && enrollments.length === 0 && (
          <div className="text-gray-400">No enrollments found.</div>
        )}

        {!isLoading && !error && enrollments.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-cyan-500/10">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Experience Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">
                      {enrollment.student?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {enrollment.student?.email || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">
                      {enrollment.course?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {enrollment.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm capitalize text-gray-300">
                      {enrollment.experienceLevel || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {enrollment.createdAt
                        ? new Date(enrollment.createdAt).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

