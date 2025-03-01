'use client';

import React from 'react';
import Link from 'next/link';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 mt-16 border-t border-white/10 dark:border-gray-800/30 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-center md:text-left">
              <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                ObsidianNotes
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                © {currentYear} Все права защищены
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/20 transition-colors"
              aria-label="GitHub"
            >
              <FiGithub className="w-5 h-5" />
            </Link>
            <Link 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/20 transition-colors"
              aria-label="Twitter"
            >
              <FiTwitter className="w-5 h-5" />
            </Link>
            <Link 
              href="mailto:example@example.com" 
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/20 transition-colors"
              aria-label="Email"
            >
              <FiMail className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 