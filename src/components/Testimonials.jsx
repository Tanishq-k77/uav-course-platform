import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      course: 'Robotics',
      quote: 'Propellex transformed my understanding of robotics. The hands-on projects and expert instructors made complex concepts accessible and exciting!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1650278795309-26295c74cf2b',
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      course: 'Drone Piloting',
      quote: 'Best investment in my career! The drone piloting course gave me professional certification and real-world skills. Now I run my own aerial photography business.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1699885960867-56d5f5262d38',
    },
    {
      id: 3,
      name: 'Emily Watson',
      course: 'Aeromodelling',
      quote: 'The aeromodelling program exceeded all expectations. From theory to practical application, every lesson was meticulously crafted and incredibly engaging.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1650278795309-26295c74cf2b',
    },
    {
      id: 4,
      name: 'David Kim',
      course: 'Coding',
      quote: 'As a complete beginner, I was nervous about coding. The supportive environment and structured curriculum made learning Python not just easy, but genuinely fun!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1699885960867-56d5f5262d38',
    },
    {
      id: 5,
      name: 'Aisha Patel',
      course: 'Unmanned Systems',
      quote: 'The unmanned systems course is cutting-edge. The knowledge I gained opened doors to opportunities I never thought possible. Highly recommend!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1650278795309-26295c74cf2b',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Student Testimonials
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Hear from our students who are shaping the future
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-950 rounded-2xl p-8 md:p-12 border border-cyan-500/30 shadow-xl shadow-cyan-500/10"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  {/* Stars */}
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg md:text-xl text-gray-300 mb-6 italic">
                    "{testimonials[currentIndex].quote}"
                  </p>

                  {/* Name and Course */}
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-cyan-400">
                      {testimonials[currentIndex].course} Student
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 bg-slate-900 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 bg-slate-900 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-cyan-400 w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;