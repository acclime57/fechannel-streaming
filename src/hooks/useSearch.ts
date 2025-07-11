import { useState, useEffect, useMemo } from 'react';
import { Video } from '../types';
import { dataService } from '../services/dataService';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useMemo(() => {
    const timer = setTimeout(() => query, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchVideos = async () => {
      setLoading(true);
      try {
        const searchResults = await dataService.searchVideos(query.trim());
        setResults(searchResults);
        setError(null);
      } catch (err) {
        setError('Search failed');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchVideos, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
    hasResults: results.length > 0
  };
}