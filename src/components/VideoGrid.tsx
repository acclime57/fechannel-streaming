import React from 'react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';
import { Loader2 } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  className?: string;
  cardSize?: 'small' | 'medium' | 'large';
  emptyMessage?: string;
}

export function VideoGrid({ 
  videos, 
  loading = false, 
  error = null, 
  title, 
  className = '',
  cardSize = 'medium',
  emptyMessage = 'No videos found.'
}: VideoGridProps) {
  if (loading) {
    return (
      <div className={`${className}`}>
        {title && (
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        )}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
          <span className="ml-3 text-white">Loading videos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {title && (
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        )}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={`${className}`}>
        {title && (
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        )}
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            size={cardSize}
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
}