import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Clock, Tag } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoGrid } from '../components/VideoGrid';
import { useVideo, useVideosByCategory } from '../hooks/useVideos';
import { useCategory } from '../hooks/useCategories';
import { formatDuration, formatViewCount, formatRelativeTime } from '../utils/videoUtils';
import { SITE_CONFIG } from '../config/constants';

export function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const { video, loading, error } = useVideo(id!);
  const { category } = useCategory(video?.category_id || '');
  const { videos: relatedVideos } = useVideosByCategory(video?.category_id || '');

  // Set page title
  useEffect(() => {
    if (video) {
      document.title = `${video.title} - ${SITE_CONFIG.channelName}`;
    }
    return () => {
      document.title = SITE_CONFIG.channelName;
    };
  }, [video]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Video Not Found</h1>
          <p className="text-gray-400 mb-6">The video you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filter out current video from related videos
  const filteredRelatedVideos = relatedVideos.filter(v => v.id !== video.id);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/"
          className="text-white hover:text-red-500 inline-flex items-center space-x-2 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Video Player Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video */}
          <div className="lg:col-span-2">
            <div className="aspect-video w-full mb-6">
              <VideoPlayer
                src={video.video_url}
                videoId={video.id}
                poster={video.thumbnail_url}
                title={video.title}
                className="w-full h-full"
              />
            </div>
            
            {/* Video Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {video.title}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatViewCount(video.view_count)} views</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatRelativeTime(video.created_at)}</span>
                  </div>
                  
                  {category && (
                    <Link
                      to={`/categories/${category.id}`}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {video.description}
                </p>
                
                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-400">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                More {category?.name || 'Videos'}
              </h2>
              
              {filteredRelatedVideos.length > 0 ? (
                <div className="space-y-4">
                  {filteredRelatedVideos.slice(0, 6).map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      to={`/watch/${relatedVideo.id}`}
                      className="block group"
                    >
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-24 h-16 bg-gray-700 rounded overflow-hidden">
                          <img
                            src={relatedVideo.thumbnail_url}
                            alt={relatedVideo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-500 transition-colors">
                            {relatedVideo.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
                            <span>{formatViewCount(relatedVideo.view_count)} views</span>
                            <span>•</span>
                            <span>{formatDuration(relatedVideo.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {filteredRelatedVideos.length > 6 && (
                    <Link
                      to={`/categories/${video.category_id}`}
                      className="block text-center text-red-500 hover:text-red-400 text-sm font-medium py-2 transition-colors"
                    >
                      View All {category?.name} Videos
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No related videos found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* More Videos Section */}
      {filteredRelatedVideos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <VideoGrid
            title={`More ${category?.name || 'Videos'}`}
            videos={filteredRelatedVideos.slice(0, 8)}
            cardSize="medium"
            emptyMessage="No more videos in this category."
          />
        </div>
      )}
    </div>
  );
}