import { useState, useEffect } from 'react';
import { Video } from '../types';
import { dataService } from '../services/dataService';

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videosData = await dataService.getVideos();
      setVideos(videosData);
      setError(null);
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    videos,
    loading,
    error,
    refetch: loadVideos
  };
}

export function useVideo(id: string) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await dataService.getVideoById(id);
      setVideo(videoData);
      setError(null);
    } catch (err) {
      setError('Failed to load video');
      console.error('Error loading video:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    video,
    loading,
    error,
    refetch: loadVideo
  };
}

export function useVideosByCategory(categoryId: string) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    
    loadVideos();
  }, [categoryId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videosData = await dataService.getVideosByCategory(categoryId);
      setVideos(videosData);
      setError(null);
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    videos,
    loading,
    error,
    refetch: loadVideos
  };
}

export function useFeaturedVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videosData = await dataService.getFeaturedVideos();
      setVideos(videosData);
      setError(null);
    } catch (err) {
      setError('Failed to load featured videos');
      console.error('Error loading featured videos:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    videos,
    loading,
    error,
    refetch: loadVideos
  };
}