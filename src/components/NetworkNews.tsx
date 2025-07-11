import React from 'react';
import { AlertCircle, Clock, ExternalLink, TrendingUp } from 'lucide-react';
import { useNetworkNews } from '../hooks/useNetworkData';

export function NetworkNews() {
  const { news, loading, error } = useNetworkNews();

  if (loading) {
    return (
      <div className="mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 rounded-lg p-4">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
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
        <p className="text-red-400">Failed to load network news: {error}</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'breaking': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'normal': return 'bg-blue-600';
      case 'low': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'breaking': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <span>Network News & Updates</span>
        </h2>
        <button 
          onClick={() => window.open('https://fenewsnet.com', '_blank')}
          className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
        >
          <span>Visit FE News Net</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {news.map((article) => (
          <div key={article.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`${getPriorityColor(article.priority)} text-white px-2 py-1 rounded text-xs flex items-center space-x-1`}>
                  {getPriorityIcon(article.priority)}
                  <span>{article.priority.toUpperCase()}</span>
                </div>
                <span className="text-gray-400 text-sm">{article.source}</span>
              </div>
              <span className="text-gray-400 text-sm">{formatTimeAgo(article.published_at)}</span>
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-2">{article.title}</h3>
            <p className="text-gray-300 mb-3">{article.summary}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">By {article.author}</span>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="text-red-400 hover:text-red-300 transition-colors text-sm">
                Read More →
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {news.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">No news updates available at the moment.</p>
        </div>
      )}
    </div>
  );
}