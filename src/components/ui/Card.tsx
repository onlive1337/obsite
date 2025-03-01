'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  hoverEffect = true,
}) => {
  const baseStyles = 'rounded-xl overflow-hidden backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border border-white/20 dark:border-gray-800/50 shadow-xl';
  const hoverStyles = hoverEffect 
    ? 'group transition duration-300 hover:shadow-2xl hover:border-purple-500/30 dark:hover:border-purple-500/20 hover:bg-gradient-to-b hover:from-white/20 hover:to-white/5 dark:hover:from-gray-800/40 dark:hover:to-gray-900/60'
    : '';
  
  return (
    <motion.div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
      {hoverEffect && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl transform translate-x-1/3 translate-y-1/3" />
        </div>
      )}
    </motion.div>
  );
};

export default Card; 