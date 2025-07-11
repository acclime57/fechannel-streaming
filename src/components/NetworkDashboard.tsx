import React from 'react';
import { Radio, Users, Video, Calendar, TrendingUp, Globe } from 'lucide-react';
import { useLiveStreams, useNetworkStats, useUpcomingEvents } from '../hooks/useNetworkData';

export function NetworkDashboard() {
  const { streams, loading: streamsLoading } = useLiveStreams();
  const { stats, loading: statsLoading } = useNetworkStats();
  const { events, loading: eventsLoading } = useUpcomingEvents();

  const liveStreams = streams.filter(stream => stream.status === 'live');
  const nextEvent = events[0];

  if (streamsLoading || statsLoading || eventsLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Globe className="h-6 w-6 text-red-500" />
          <span>Network Status</span>
        </h2>
        <div className="flex items-center space-x-2 bg-green-900/30 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">All Systems Online</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Live Streams */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Radio className={`h-8 w-8 ${liveStreams.length > 0 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
          </div>
          <div className="text-2xl font-bold text-white">{liveStreams.length}</div>
          <div className="text-sm text-gray-400">Live Streams</div>
        </div>

        {/* Total Members */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.total_members?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-gray-400">Network Members</div>
        </div>

        {/* Total Content */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Video className="h-8 w-8 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.total_content?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-gray-400">Content Items</div>
        </div>

        {/* Next Event */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="text-lg font-bold text-white">
            {nextEvent ? new Date(nextEvent.start_time).toLocaleDateString() : 'TBD'}
          </div>
          <div className="text-sm text-gray-400">Next Event</div>
        </div>
      </div>

      {/* Live Streams */}
      {liveStreams.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            <span>Currently Live</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{stream.title}</h4>
                  <p className="text-gray-400 text-sm">{stream.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-red-400 text-sm flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </span>
                    <span className="text-gray-400 text-sm">
                      {stream.viewer_count} viewers
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Event */}
      {nextEvent && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-yellow-500" />
            <span>Upcoming Event</span>
          </h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium text-lg">{nextEvent.title}</h4>
                <p className="text-gray-400 text-sm mb-2">{nextEvent.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-yellow-400">
                    {new Date(nextEvent.start_time).toLocaleDateString()} at {new Date(nextEvent.start_time).toLocaleTimeString()}
                  </span>
                  <span className="text-gray-400">Speaker: {nextEvent.speaker}</span>
                </div>
              </div>
              <span className="bg-yellow-600 text-black text-xs px-2 py-1 rounded font-medium">
                {nextEvent.event_type.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}