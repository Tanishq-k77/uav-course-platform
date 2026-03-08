import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Linkedin, Twitter } from 'lucide-react';

const Instructors = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const instructors = [
    {
      id: 1,
      name: 'Dr. Alex Morgan',
      expertise: 'Robotics & AI',
      bio: 'PhD in Robotics from MIT. 15+ years experience in autonomous systems and machine learning. Published researcher and industry consultant.',
      image: 'https://images.unsplash.com/photo-1650278795309-26295c74cf2b',
      linkedin: '#',
      twitter: '#',
    },
    {
      id: 2,
      name: 'Sarah Mitchell',
      expertise: 'Aeromodelling & UAV',
      bio: 'Former aerospace engineer at Boeing. Specialized in aerodynamics and flight control systems. Award-winning model aircraft designer.',
      image: 'https://images.unsplash.com/photo-1699885960867-56d5f5262d38',
      linkedin: '#',
      twitter: '#',
    },
    {
      id: 3,
      name: 'James Chen',
      expertise: 'Software Engineering',
      bio: 'Senior software architect with expertise in embedded systems and IoT. Former lead developer at Tesla. Passionate educator and mentor.',
      image: 'https://images.unsplash.com/photo-1550092464-83454409161e',
      linkedin: '#',
      twitter: '#',
    },
    {
      id: 4,
      name: 'Dr. Maya Patel',
      expertise: 'Unmanned Systems',
      bio: 'Defense research scientist specializing in autonomous vehicles. Expert in sensor fusion and mission planning systems.',
      image: 'https://images.unsplash.com/photo-1650278795309-26295c74cf2b',
      linkedin: '#',
      twitter: '#',
    },
  ];

  return (
    <section id="instructors" ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Expert Instructors
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn from industry leaders and renowned experts
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((instructor, index) => (
            <motion.div
              key={instructor.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group"
            >
              <div className="bg-slate-900 rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/60 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {instructor.name}
                  </h3>
                  <p className="text-cyan-400 font-medium">{instructor.expertise}</p>
                  <p className="text-gray-400 text-sm line-clamp-3">{instructor.bio}</p>

                  {/* Social Links */}
                  <div className="flex gap-3 pt-2">
                    <a
                      href={instructor.linkedin}
                      className="w-10 h-10 bg-slate-950 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={instructor.twitter}
                      className="w-10 h-10 bg-slate-950 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instructors;