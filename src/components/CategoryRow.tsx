import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Video } from '../types';
import { VideoCard } from './VideoCard';

interface CategoryRowProps {
  title: string;
  videos: Video[];
  categoryId?: string;
  loading?: boolean;
  className?: string;
}

export function CategoryRow({ title, videos, categoryId, loading = false, className = '' }: CategoryRowProps) {
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[300px] h-[400px] bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {categoryId && videos.length > 0 && (
          <Link 
            to={`/categories/${categoryId}`}
            className="flex items-center text-red-500 hover:text-red-400 transition-colors"
          >
            <span className="mr-1">View All</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
      </div>
      
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4">
        {videos.slice(0, 8).map((video) => (
          <div key={video.id} className="min-w-[280px] flex-shrink-0">
            <VideoCard 
              video={video} 
              size="medium"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}