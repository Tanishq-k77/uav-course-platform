import React from 'react';
import { motion } from 'framer-motion';
import NeonButton from '@/components/ui/NeonButton';
import FloatingParticles from '@/components/FloatingParticles';

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1683496865103-263bd91872b6"
          alt="Futuristic Technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Wolf Dynamics Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <div className="px-4 py-2 rounded-full border border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm">
              <span className="text-sm text-cyan-400">A Wolf Dynamics Company</span>
            </div>
          </motion.div>

          {/* Main Heading with Neon Glow */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold"
            style={{
              textShadow: '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.3), 0 0 60px rgba(0, 217, 255, 0.2)',
            }}
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Propellex
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-6 rounded-2xl bg-slate-900/30 backdrop-blur-md border border-cyan-500/20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-200">
                Deeptech Courses for the Future
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Master cutting-edge technologies in Aeromodelling, Unmanned Systems, Robotics, and more
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <NeonButton onClick={() => scrollToSection('#courses')} variant="primary">
              Explore Courses
            </NeonButton>
            <NeonButton onClick={() => scrollToSection('#contact')} variant="secondary">
              Get Started
            </NeonButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;