import { useState, useEffect } from 'react';
import {
  getPlatforms,
  getFeaturedContent,
  getLatestNews,
  getLiveStreams,
  getUpcomingEvents,
  getCommunityHighlights,
  getNetworkStats,
  searchUnifiedContent,
  SupabasePlatform,
  SupabaseContent,
  SupabaseNews,
  SupabaseLiveStream,
  SupabaseEvent,
  SupabaseCommunityPost
} from '../lib/supabase';

// Hook for managing network platforms
export function usePlatforms() {
  const [platforms, setPlatforms] = useState<SupabasePlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlatforms() {
      try {
        setLoading(true);
        const data = await getPlatforms();
        // TRUTHFULNESS RULE: Show exactly 12 platforms as requested (was showing 13)
        const limitedPlatforms = data.slice(0, 12);
        setPlatforms(limitedPlatforms);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load platforms');
      } finally {
        setLoading(false);
      }
    }

    fetchPlatforms();
  }, []);

  return { platforms, loading, error };
}

// Hook for network-wide featured content
export function useNetworkContent() {
  const [content, setContent] = useState<SupabaseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const data = await getFeaturedContent();
        setContent(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return { content, loading, error };
}

// Hook for network news
export function useNetworkNews() {
  const [news, setNews] = useState<SupabaseNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const data = await getLatestNews();
        setNews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  return { news, loading, error };
}

// Hook for live streams
export function useLiveStreams() {
  const [streams, setStreams] = useState<SupabaseLiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStreams() {
      try {
        setLoading(true);
        const data = await getLiveStreams();
        setStreams(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load streams');
      } finally {
        setLoading(false);
      }
    }

    fetchStreams();
    
    // Refresh every 30 seconds for live data
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  return { streams, loading, error };
}

// Hook for upcoming events
export function useUpcomingEvents() {
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await getUpcomingEvents();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading, error };
}

// Hook for community highlights
export function useCommunityHighlights() {
  const [highlights, setHighlights] = useState<SupabaseCommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        setLoading(true);
        const data = await getCommunityHighlights();
        setHighlights(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load community highlights');
      } finally {
        setLoading(false);
      }
    }

    fetchHighlights();
  }, []);

  return { highlights, loading, error };
}

// Hook for unified search
export function useUnifiedSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, filters?: any) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await searchUnifiedContent(query, filters);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clearResults };
}

// Hook for network statistics
export function useNetworkStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getNetworkStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load network stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}