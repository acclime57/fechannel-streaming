import React, { useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { formatDuration } from '../utils/videoUtils';
import { dataService } from '../services/dataService';

interface VideoPlayerProps {
  src: string;
  videoId?: string;
  poster?: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ src, videoId, poster, title, className = '' }: VideoPlayerProps) {
  const {
    videoRef,
    commercialVideoRef,
    state,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    showControls,
    hideControls,
    showingCommercial,
    currentCommercial
  } = useVideoPlayer();

  // Increment view count when video starts playing
  useEffect(() => {
    if (videoId && state.isPlaying && state.currentTime > 5) {
      dataService.incrementViewCount(videoId);
    }
  }, [videoId, state.isPlaying, state.currentTime]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * state.duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setVolume(pos);
  };

  const skipBackward = () => {
    seek(Math.max(0, state.currentTime - 10));
  };

  const skipForward = () => {
    seek(Math.min(state.duration, state.currentTime + 10));
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={showControls}
      onMouseMove={showControls}
      onMouseLeave={hideControls}
    >
      {/* Main Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={`w-full h-full ${showingCommercial ? 'hidden' : 'block'}`}
        onClick={togglePlay}
        onLoadStart={() => {
          console.log('Video loading started:', src);
        }}
        onError={(e) => {
          console.error('Video error:', e);
        }}
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Commercial Video Overlay */}
      {showingCommercial && (
        <div className="absolute inset-0 z-20 bg-black">
          <video
            ref={commercialVideoRef}
            className="w-full h-full"
            autoPlay
            muted={false}
            controls={false}
          />
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Advertisement
          </div>
          {currentCommercial && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-white text-lg font-bold bg-black/50 px-4 py-2 rounded">
                {currentCommercial.title}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Video Title Overlay */}
      {title && !showingCommercial && (
        <div className="absolute top-4 left-4 right-4">
          <h1 className="text-white text-xl md:text-2xl font-bold bg-black/50 px-4 py-2 rounded">
            {title}
          </h1>
        </div>
      )}
      
      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity duration-300 ${
        state.showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={skipBackward}
              className="text-white hover:text-red-500 transition-colors"
            >
              <SkipBack className="h-8 w-8" />
            </button>
            
            <button
              onClick={togglePlay}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
            >
              {state.isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </button>
            
            <button
              onClick={skipForward}
              className="text-white hover:text-red-500 transition-colors"
            >
              <SkipForward className="h-8 w-8" />
            </button>
          </div>
        </div>
        
        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              className="w-full bg-gray-600 rounded-full h-2 cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div 
                className="bg-red-600 h-2 rounded-full relative group-hover:bg-red-500 transition-colors"
                style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            {/* Time Display */}
            <div className="flex justify-between text-white text-sm mt-2">
              <span>{formatDuration(state.currentTime)}</span>
              <span>{formatDuration(state.duration)}</span>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-red-500 transition-colors"
              >
                {state.isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  {state.isMuted || state.volume === 0 ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </button>
                
                <div className="w-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div 
                    className="w-full bg-gray-600 rounded-full h-1 cursor-pointer"
                    onClick={handleVolumeClick}
                  >
                    <div 
                      className="bg-white h-1 rounded-full"
                      style={{ width: `${state.volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition-colors"
              >
                <Maximize className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {state.duration === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
}