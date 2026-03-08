import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import CourseCard from '@/components/CourseCard';
import { Plane, Cpu, Bot, Code, Wifi } from 'lucide-react';
import { getToken } from '@/utils/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Courses = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const fallbackCourses = [
    {
      id: 1,
      title: 'Aeromodelling',
      description: 'Master the art of aircraft design, aerodynamics, and flight mechanics. Build and pilot your own models.',
      image: 'https://images.unsplash.com/photo-1653070618908-5c76cf690427',
      icon: Plane,
      difficulty: 'Intermediate',
      duration: '12 weeks',
    },
    {
      id: 2,
      title: 'Unmanned Systems',
      description: 'Explore autonomous systems, sensor integration, and mission planning for unmanned aerial vehicles.',
      image: 'https://images.unsplash.com/photo-1660141259390-d08a8e13c13c',
      icon: Wifi,
      difficulty: 'Advanced',
      duration: '16 weeks',
    },
    {
      id: 3,
      title: 'Robotics',
      description: 'Design, build, and program intelligent robots. Learn kinematics, control systems, and AI integration.',
      image: 'https://images.unsplash.com/photo-1531837404483-bdbd0d209ec1',
      icon: Bot,
      difficulty: 'Intermediate',
      duration: '14 weeks',
    },
    {
      id: 4,
      title: 'Coding',
      description: 'Master programming fundamentals and advanced techniques. From Python to embedded systems.',
      image: 'https://images.unsplash.com/photo-1650278795309-26295c74cf2b',
      icon: Code,
      difficulty: 'Beginner',
      duration: '10 weeks',
    },
    {
      id: 5,
      title: 'Drone Piloting',
      description: 'Professional drone operation, regulations, aerial photography, and advanced flight techniques.',
      image: 'https://images.unsplash.com/photo-1660141259390-d08a8e13c13c',
      icon: Cpu,
      difficulty: 'Beginner',
      duration: '8 weeks',
    },
  ];

  const [courses, setCourses] = useState(fallbackCourses);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses from API');
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.courses) || data.courses.length === 0) {
          return;
        }

        const mapped = data.courses.map((course, index) => {
          const fallback = fallbackCourses[index % fallbackCourses.length];
          return {
            id: course._id,
            title: course.title,
            description: course.description,
            image: course.image || fallback.image,
            icon: fallback.icon,
            difficulty: course.difficulty || fallback.difficulty,
            duration: course.duration || fallback.duration,
          };
        });

        setCourses(mapped);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load courses from API', error);
      }
    }

    loadCourses();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEnrollments() {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/enrollments/user`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return;
        }

        const ids = new Set(
          (data.enrollments || [])
            .map((e) => e.course && (e.course._id || e.course.id))
            .filter(Boolean)
        );
        setEnrolledCourseIds(ids);
      } catch {
        // ignore errors, keep UX simple
      }
    }

    loadEnrollments();

    return () => controller.abort();
  }, []);

  return (
    <section id="courses" ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Our Courses
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Cutting-edge programs designed to propel you into the future of technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CourseCard
                course={course}
                isEnrolled={enrolledCourseIds.has(course.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;