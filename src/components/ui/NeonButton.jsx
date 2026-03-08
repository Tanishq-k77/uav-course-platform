import React from 'react';
import { motion } from 'framer-motion';

const NeonButton = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/30',
    secondary: 'bg-slate-900 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 shadow-lg shadow-cyan-500/20',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default NeonButton;