import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BookOpen, CheckCircle } from 'lucide-react';
import { useEnrollment } from '@/hooks/useEnrollment.jsx';
import { toast } from '@/components/ui/use-toast.jsx';
import { getToken } from '@/utils/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const EnrollmentModal = () => {
  const { isModalOpen, selectedCourse, closeModal } = useEnrollment();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (!selectedCourse) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: selectedCourse.id }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        toast({
          title: 'Already Enrolled',
          description: 'You are already enrolled in this course.',
          variant: 'destructive',
        });
        closeModal();
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to enroll. Please try again.');
      }

      toast({
        title: 'Enrollment Successful! 🎉',
        description: `You are now enrolled in ${selectedCourse.title}!`,
      });
      closeModal();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Enrollment error', error);
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && selectedCourse && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-cyan-500/20">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">Enroll in Course</h2>
                <p className="text-cyan-400">{selectedCourse.title}</p>
              </div>

              {/* Confirmation Body */}
              <div className="p-6 space-y-6">
                {/* Course info card */}
                <div className="flex items-start gap-4 p-4 bg-slate-800/60 rounded-xl border border-cyan-500/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold leading-snug">{selectedCourse.title}</p>
                    <p className="text-gray-400 text-sm mt-1">Enroll in this course?</p>
                  </div>
                </div>

                {/* What you get */}
                <ul className="space-y-2 text-sm text-gray-300">
                  {[
                    'Instant access to all course materials',
                    'Track your progress from your dashboard',
                    'Certificate upon completion',
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EnrollmentModal;