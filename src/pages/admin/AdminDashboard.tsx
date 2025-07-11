import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Video, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  LogOut,
  Home,
  Globe,
  BarChart,
  Users,
  Radio,
  Settings,
  Network
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useVideos } from '../../hooks/useVideos';
import { useNetworkStats, usePlatforms } from '../../hooks/useNetworkData';
import { dataService } from '../../services/dataService';
import { rokuService } from '../../services/rokuService';
import { multiRokuService } from '../../services/multiRokuService';
import { RokuFeedsManager } from '../../components/RokuFeedsManager';
import { formatDuration, formatViewCount, formatRelativeTime } from '../../utils/videoUtils';
import { SITE_CONFIG } from '../../config/constants';

export function AdminDashboard() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { videos, loading, refetch } = useVideos();
  const { stats: networkStats, loading: networkLoading } = useNetworkStats();
  const { platforms, loading: platformsLoading } = usePlatforms();
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'network' | 'roku' | 'analytics'>('overview');
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    featuredVideos: 0,
    totalDuration: 0
  });
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Calculate stats
  useEffect(() => {
    if (videos.length > 0) {
      setStats({
        totalVideos: videos.length,
        totalViews: videos.reduce((sum, video) => sum + video.view_count, 0),
        featuredVideos: videos.filter(video => video.featured).length,
        totalDuration: videos.reduce((sum, video) => sum + video.duration, 0)
      });
    }
  }, [videos]);

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await dataService.deleteVideo(videoId);
        refetch();
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video. Please try again.');
      }
    }
  };

  const handleGenerateRokuFeed = async () => {
    try {
      await rokuService.downloadRokuFeed();
    } catch (error) {
      console.error('Error generating Roku feed:', error);
      alert('Failed to generate Roku feed. Please try again.');
    }
  };

  const handleGenerateMultiRokuFeeds = async () => {
    try {
      await multiRokuService.saveFeeds();
      alert('All Roku feeds generated successfully!');
    } catch (error) {
      console.error('Error generating multi Roku feeds:', error);
      alert('Failed to generate multi Roku feeds. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black/90 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/favicon.png" 
                alt="FEChannel Network"
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Network Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Central Media Hub Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>View Site</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: <BarChart className="h-4 w-4" /> },
              { id: 'videos', name: 'Videos', icon: <Video className="h-4 w-4" /> },
              { id: 'network', name: 'Network', icon: <Globe className="h-4 w-4" /> },
              { id: 'roku', name: 'Roku Feeds', icon: <Radio className="h-4 w-4" /> },
              { id: 'analytics', name: 'Analytics', icon: <Users className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Network Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Network Platforms</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Members</p>
                    <p className="text-2xl font-bold text-white">
                      {networkStats?.total_members?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Video className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Network Content</p>
                    <p className="text-2xl font-bold text-white">
                      {networkStats?.total_content?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <ExternalLink className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">FEChannel Videos</p>
                    <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FEChannel Stats */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">FEChannel Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{formatViewCount(stats.totalViews)}</p>
                  <p className="text-gray-400">Total Views</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">{stats.featuredVideos}</p>
                  <p className="text-gray-400">Featured Videos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{formatDuration(stats.totalDuration)}</p>
                  <p className="text-gray-400">Total Content</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/admin/videos/new"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Video</span>
                </Link>
                
                <button
                  onClick={() => setActiveTab('roku')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <Radio className="h-5 w-5" />
                  <span>Roku Feeds</span>
                </button>

                <button
                  onClick={() => setActiveTab('network')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <Network className="h-5 w-5" />
                  <span>Network</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <BarChart className="h-5 w-5" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <>
            {/* Video Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Video className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Videos</p>
                    <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-white">{formatViewCount(stats.totalViews)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <ExternalLink className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Featured</p>
                    <p className="text-2xl font-bold text-white">{stats.featuredVideos}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Upload className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Duration</p>
                    <p className="text-2xl font-bold text-white">{formatDuration(stats.totalDuration)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Actions */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Video Management</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/admin/videos/new"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New Video</span>
                </Link>
                
                <button
                  onClick={handleGenerateRokuFeed}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Roku Feed</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Network Platform Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform) => (
                  <div key={platform.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{platform.name}</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        platform.status === 'active' ? 'bg-green-500' : 
                        platform.status === 'maintenance' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{platform.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <span>{platform.member_count?.toLocaleString()} members</span>
                      <span>{platform.content_count?.toLocaleString()} items</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <button 
                        onClick={() => window.open(`https://${platform.domain}`, '_blank')}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Visit Platform →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roku Tab */}
        {activeTab === 'roku' && (
          <RokuFeedsManager />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Network Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
                  <div className="space-y-4">
                    {platforms.slice(0, 5).map((platform) => (
                      <div key={platform.id} className="flex items-center justify-between">
                        <span className="text-gray-300">{platform.name}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-400 text-sm">
                            {platform.member_count?.toLocaleString()} members
                          </span>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min((platform.member_count || 0) / 10000 * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Content Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Videos</span>
                      <span className="text-white font-medium">{stats.totalVideos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Network Content</span>
                      <span className="text-white font-medium">
                        {networkStats?.total_content?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Total Views</span>
                      <span className="text-white font-medium">{formatViewCount(stats.totalViews)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Table - Only show in videos tab */}
        {activeTab === 'videos' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Manage Videos</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 mb-4">No videos found.</p>
                <Link
                  to="/admin/videos/new"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Your First Video</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Video
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="h-12 w-20 object-cover rounded"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white line-clamp-1">
                                {video.title}
                              </div>
                              <div className="text-sm text-gray-400">
                                {formatDuration(video.duration)}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            <div className="mb-1">
                              Created: {formatRelativeTime(video.created_at)}
                            </div>
                            {video.featured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {formatViewCount(video.view_count)} views
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/watch/${video.id}`}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="View Video"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            
                            <Link
                              to={`/admin/videos/${video.id}/edit`}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Edit Video"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Video"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}