import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Eye } from 'lucide-react';
import { Video } from '../types';
import { formatDuration, formatViewCount, formatRelativeTime } from '../utils/videoUtils';

interface VideoCardProps {
  video: Video;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function VideoCard({ video, className = '', size = 'medium' }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'w-full max-w-xs',
    medium: 'w-full max-w-sm',
    large: 'w-full max-w-md'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} group cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/watch/${video.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
          {/* Thumbnail */}
          <div className="aspect-video relative">
            {!imageError ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Video Thumbnail</p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
            
            {/* Play Button */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <div className="bg-red-600 rounded-full p-3 shadow-lg">
                <Play className="h-8 w-8 text-white fill-current" />
              </div>
            </div>
            
            {/* Duration */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(video.duration)}</span>
              </div>
            </div>
            
            {/* Featured Badge */}
            {video.featured && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
                Featured
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
              {video.title}
            </h3>
            
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {video.description}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{formatViewCount(video.view_count)} views</span>
              </div>
              <span>{formatRelativeTime(video.created_at)}</span>
            </div>
            
            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {video.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {video.tags.length > 3 && (
                  <span className="text-gray-500 text-xs">+{video.tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}