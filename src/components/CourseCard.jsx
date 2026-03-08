import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart } from 'lucide-react';
import { useEnrollment } from '@/hooks/useEnrollment.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast.jsx';
import { getToken } from '@/utils/auth.js';

const CourseCard = ({ course, isEnrolled }) => {
  const { openModal } = useEnrollment();
  const navigate = useNavigate();
  const Icon = course.icon;

  const difficultyColors = {
    Beginner: 'text-green-400',
    Intermediate: 'text-yellow-400',
    Advanced: 'text-red-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      className="group relative h-full"
    >
      <div className="h-full bg-slate-900 rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/60 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          {/* Icon */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-slate-950/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-cyan-500/30">
            <Icon className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-gray-400 line-clamp-3">
            {course.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-gray-500" />
              <span className={difficultyColors[course.difficulty]}>
                {course.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{course.duration}</span>
            </div>
          </div>

          {/* Primary action */}
          <button
            onClick={() => {
              const token = getToken();
              if (!token) {
                window.localStorage.setItem('redirectAfterLogin', window.location.pathname);
                toast({
                  title: 'Login required',
                  description: 'You must login to enroll in a course.',
                  variant: 'destructive',
                });
                navigate('/login');
                return;
              }

              if (isEnrolled) {
                navigate(`/course/${course.id}/learn`);
              } else {
                openModal(course);
              }
            }}
            className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </button>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default CourseCard;