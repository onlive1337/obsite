'use client';

import React from 'react';
import Link from 'next/link';
import { FiCalendar, FiTag, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import { type NoteMetadata } from '@/lib/github';

interface NoteCardProps {
  note: NoteMetadata;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const { title, description, date, tags, slug, coverImage } = note;
  
  return (
    <Card className="h-full">
      <Link href={`/notes/${slug}`} className="block h-full">
        <div className="p-6 flex flex-col h-full">
          {coverImage && (
            <div className="mb-4 overflow-hidden rounded-lg relative aspect-video">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          
          <h2 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            {title}
          </h2>
          
          {description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="mt-auto">
            {date && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <FiCalendar className="mr-2" />
                <span>{new Date(date).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
            
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300"
                  >
                    <FiTag className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <motion.div 
              className="flex items-center text-blue-500 font-medium"
              whileHover={{ x: 5 }}
            >
              <span>Читать</span>
              <FiArrowRight className="ml-2" />
            </motion.div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default NoteCard; 