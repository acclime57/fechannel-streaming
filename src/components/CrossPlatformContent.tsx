import React from 'react';
import { Play, Clock, Eye, ExternalLink, Video, Headphones, FileText, Image } from 'lucide-react';
import { useNetworkContent } from '../hooks/useNetworkData';

export function CrossPlatformContent() {
  const { content, loading, error } = useNetworkContent();

  if (loading) {
    return (
      <div className="mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-700"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400">Failed to load network content: {error}</p>
      </div>
    );
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-600';
      case 'audio': return 'bg-green-600';
      case 'article': return 'bg-blue-600';
      case 'document': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Featured Content Across Network</h2>
        <button 
          onClick={() => window.open('https://flatearthastan.com', '_blank')}
          className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
        >
          <span>View All</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group">
            <div className="relative">
              <img
                src={item.thumbnail_url || '/images/fechannel-logo-v.jpg'}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors">
                  <Play className="h-6 w-6" />
                </button>
              </div>
              
              {/* Content Type Badge */}
              <div className={`absolute top-2 left-2 ${getContentTypeColor(item.content_type)} text-white px-2 py-1 rounded text-xs flex items-center space-x-1`}>
                {getContentIcon(item.content_type)}
                <span>{item.content_type.toUpperCase()}</span>
              </div>
              
              {/* Duration */}
              {item.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(item.duration)}</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-white font-medium mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{item.view_count.toLocaleString()}</span>
                  </span>
                  <span className="text-gray-400">{item.author}</span>
                </div>
                
                {item.featured && (
                  <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-medium">
                    FEATURED
                  </span>
                )}
              </div>
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {content.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No featured content available at the moment.</p>
          </div>
        </div>
      )}
    </div>
  );
}