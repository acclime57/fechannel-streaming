import React from 'react';
import { Users, MessageCircle, ThumbsUp, Calendar, ExternalLink } from 'lucide-react';
import { useCommunityHighlights, useUpcomingEvents } from '../hooks/useNetworkData';

export function CommunityHub() {
  const { highlights, loading: highlightsLoading } = useCommunityHighlights();
  const { events, loading: eventsLoading } = useUpcomingEvents();

  if (highlightsLoading || eventsLoading) {
    return (
      <div className="mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'discussion': return 'bg-blue-600';
      case 'announcement': return 'bg-green-600';
      case 'question': return 'bg-yellow-600';
      case 'achievement': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-500" />
          <span>Community Hub</span>
        </h2>
        <button 
          onClick={() => window.open('https://fepeople.com', '_blank')}
          className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
        >
          <span>Visit FE People</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community Highlights */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <span>Community Highlights</span>
          </h3>
          
          <div className="space-y-3">
            {highlights.map((post) => (
              <div key={post.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`${getPostTypeColor(post.post_type)} text-white px-2 py-1 rounded text-xs`}>
                      {post.post_type.toUpperCase()}
                    </div>
                    <span className="text-gray-400 text-sm">by {post.author}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h4 className="text-white font-medium mb-2">{post.title}</h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.upvotes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.replies}</span>
                    </span>
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {highlights.length === 0 && (
              <div className="text-center py-8 bg-gray-800 rounded-lg">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">No community highlights yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-yellow-500" />
            <span>Upcoming Events</span>
          </h3>
          
          <div className="space-y-3">
            {events.slice(0, 4).map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-medium">
                      {event.event_type.toUpperCase()}
                    </div>
                  </div>
                  <span className="text-yellow-400 text-sm font-medium">
                    {formatEventDate(event.start_time)}
                  </span>
                </div>
                
                <h4 className="text-white font-medium mb-2">{event.title}</h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-400">
                    <span>Speaker: {event.speaker}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {event.current_attendees > 0 && (
                      <span className="text-gray-400">
                        {event.current_attendees} attending
                      </span>
                    )}
                    {event.registration_url && (
                      <button 
                        onClick={() => window.open(event.registration_url, '_blank')}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        Register →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {events.length === 0 && (
              <div className="text-center py-8 bg-gray-800 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">No upcoming events scheduled.</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => window.open('https://fetalks.com', '_blank')}
            className="w-full mt-4 bg-yellow-600 text-black py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            View All Events at FE Talks →
          </button>
        </div>
      </div>
    </div>
  );
}