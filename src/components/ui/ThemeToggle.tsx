'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Избегаем гидрации при рендере на сервере
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />; // Заглушка для предотвращения скачков интерфейса
  }

  const isDark = resolvedTheme === 'dark';
  
  return (
    <motion.button
      aria-label="Toggle Dark Mode"
      type="button"
      className="flex items-center justify-center rounded-full w-10 h-10 bg-white/10 dark:bg-gray-800/20 hover:bg-white/20 dark:hover:bg-gray-800/40 transition-colors border border-white/20 dark:border-gray-800/50"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={{ 
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.1)',
        rotate: isDark ? 180 : 0
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 45 : 0,
          scale: isDark ? 0.8 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <FiSun className="text-yellow-300" size={20} /> : <FiMoon className="text-blue-600" size={20} />}
      </motion.div>
    </motion.button>
  );
} 