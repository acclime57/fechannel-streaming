import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, Globe, Tv, ExternalLink, Video, Headphones, FileText } from 'lucide-react';
import { VideoGrid } from '../components/VideoGrid';
import { useSearch } from '../hooks/useSearch';
import { useUnifiedSearch } from '../hooks/useNetworkData';
import { dataService } from '../services/dataService';
import { Video as VideoType } from '../types';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const isNetworkSearch = searchParams.get('network') === 'true';
  const { query, setQuery } = useSearch();
  const { results: networkResults, loading: networkLoading, error: networkError, search: searchNetwork } = useUnifiedSearch();
  const [localResults, setLocalResults] = useState<VideoType[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchType, setSearchType] = useState<'local' | 'network'>(isNetworkSearch ? 'network' : 'local');

  // Set initial query from URL
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performLocalSearch = async (searchQuery: string) => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      const searchResults = await dataService.searchVideos(searchQuery.trim());
      setLocalResults(searchResults);
    } catch (err) {
      setLocalError('Local search failed. Please try again.');
      console.error('Local search error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setLocalResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    if (searchType === 'network') {
      await searchNetwork(searchQuery.trim());
    } else {
      await performLocalSearch(searchQuery.trim());
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
    
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newSearchParams.set('q', query.trim());
      if (searchType === 'network') {
        newSearchParams.set('network', 'true');
      } else {
        newSearchParams.delete('network');
      }
    } else {
      newSearchParams.delete('q');
      newSearchParams.delete('network');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams}`);
  };

  const clearSearch = () => {
    setQuery('');
    setLocalResults([]);
    setHasSearched(false);
    setLocalError(null);
    
    // Clear URL
    window.history.replaceState({}, '', '/search');
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link
          to="/"
          className="text-white hover:text-red-500 inline-flex items-center space-x-2 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Search {searchType === 'network' ? 'Network-Wide' : 'FEChannel Videos'}
          </h1>
          
          {/* Search Type Selector */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setSearchType('local')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  searchType === 'local' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>FEChannel Videos</span>
              </button>
              <button
                onClick={() => setSearchType('network')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  searchType === 'network' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Entire Network</span>
              </button>
            </div>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchType === 'network' 
                  ? "Search across all 12 platforms..." 
                  : "Search for documentaries, interviews, educational content..."
                }
                className="flex-1 bg-gray-800 text-white px-6 py-4 rounded-l-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={searchType === 'local' ? localLoading : networkLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-8 py-4 rounded-r-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <Search className="h-5 w-5" />
                <span>{(searchType === 'local' ? localLoading : networkLoading) ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </form>

          {/* Clear Search */}
          {(query || hasSearched) && (
            <button
              onClick={clearSearch}
              className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Search Results */}
        <div className="mb-8">
          {/* Loading State */}
          {(searchType === 'local' ? localLoading : networkLoading) && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-white">
                {searchType === 'network' ? 'Searching across all platforms...' : 'Searching videos...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {(searchType === 'local' ? localError : networkError) && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-400">{searchType === 'local' ? localError : networkError}</p>
            </div>
          )}

          {/* Local Video Results */}
          {searchType === 'local' && hasSearched && !localLoading && !localError && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {localResults.length > 0 
                    ? `Found ${localResults.length} video${localResults.length === 1 ? '' : 's'} for "${query}"`
                    : `No videos found for "${query}"`
                  }
                </h2>
              </div>

              {localResults.length > 0 && (
                <VideoGrid
                  videos={localResults}
                  loading={localLoading}
                  error={localError}
                  cardSize="medium"
                  emptyMessage={`No videos found for "${query}". Try different keywords.`}
                />
              )}
            </>
          )}

          {/* Network-Wide Results */}
          {searchType === 'network' && hasSearched && !networkLoading && !networkError && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {networkResults.length > 0 
                    ? `Found ${networkResults.length} result${networkResults.length === 1 ? '' : 's'} across the network for "${query}"`
                    : `No content found across the network for "${query}"`
                  }
                </h2>
              </div>

              {networkResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networkResults.map((item: any, index: number) => (
                    <div key={`${item.platform}-${index}`} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                      <div className="relative">
                        <img
                          src={item.thumbnail_url || '/images/fechannel-logo-v.jpg'}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                          {getContentIcon(item.content_type)}
                          <span>{item.content_type?.toUpperCase() || 'CONTENT'}</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                          {item.platform}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-white font-medium mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{item.author}</span>
                          <button className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1">
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Search Tips */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Tv className="h-5 w-5 text-red-500" />
                <span>FEChannel Search Tips</span>
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Search by video title, description, or tags</li>
                <li>• Try keywords like "documentary", "interview", "educational"</li>
                <li>• Search for topics like "flat earth", "science", "research"</li>
                <li>• Use specific terms for better results</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span>Network Search Tips</span>
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Search across all 12 platforms simultaneously</li>
                <li>• Find videos, audio, articles, and documents</li>
                <li>• Results include content from FE People, FE News, FE Talks, etc.</li>
                <li>• Discover content you might miss on individual platforms</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}