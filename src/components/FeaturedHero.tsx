import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Video } from '../types';
import { formatDuration, formatViewCount } from '../utils/videoUtils';

interface FeaturedHeroProps {
  videos: Video[];
  className?: string;
}

export function FeaturedHero({ videos, className = '' }: FeaturedHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentVideo = videos[currentIndex];

  // Auto-rotate featured videos
  useEffect(() => {
    if (videos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [videos.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  if (!currentVideo) {
    return null;
  }

  return (
    <div className={`relative h-[70vh] min-h-[500px] overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        {!imageError ? (
          <img
            src={currentVideo.thumbnail_url}
            alt={currentVideo.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Play className="h-24 w-24 mx-auto mb-4 opacity-50" />
              <p className="text-xl">Featured Video</p>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Featured Badge */}
            <div className="mb-4">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured Content
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {currentVideo.title}
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed line-clamp-3">
              {currentVideo.description}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center space-x-6 text-sm text-gray-400 mb-8">
              <span>{formatDuration(currentVideo.duration)}</span>
              <span>{formatViewCount(currentVideo.view_count)} views</span>
              <div className="flex space-x-1">
                {currentVideo.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="bg-gray-700/80 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to={`/watch/${currentVideo.id}`}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Watch Now</span>
              </Link>
              
              <Link
                to={`/watch/${currentVideo.id}`}
                className="bg-gray-600/80 hover:bg-gray-500/80 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <Info className="h-5 w-5" />
                <span>More Info</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {videos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {videos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-red-600' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}