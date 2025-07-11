import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pjqfangqpjldkptovoep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcWZhbmdxcGpsZGtwdG92b2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTQ4MzcsImV4cCI6MjA2NzY3MDgzN30.W9nT7bE3PREO263wb0yyhCrZBH-Z4yqUR_-tmJWk1u0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Supabase database
export interface SupabasePlatform {
  id: string;
  name: string;
  domain: string;
  description: string;
  icon: string;
  color: string;
  status: 'active' | 'maintenance' | 'coming_soon';
  member_count: number;
  content_count: number;
  last_updated: string;
  platform_type: string;
  is_flagship?: boolean;
}

export interface SupabaseContent {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'audio' | 'article' | 'document';
  platform_id: string;
  thumbnail_url?: string;
  content_url?: string;
  view_count: number;
  duration?: number;
  author: string;
  tags: string[];
  featured: boolean;
  published_at: string;
  seo_keywords: string[];
}

export interface SupabaseNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  priority: 'breaking' | 'high' | 'normal' | 'low';
  source: string;
  author: string;
  published_at: string;
  tags: string[];
  image_url?: string;
}

export interface SupabaseLiveStream {
  id: string;
  title: string;
  description: string;
  platform_id: string;
  stream_url?: string;
  thumbnail_url?: string;
  status: 'live' | 'scheduled' | 'ended';
  viewer_count: number;
  started_at?: string;
  scheduled_for?: string;
  duration?: number;
}

export interface SupabaseEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'conference' | 'workshop' | 'webinar' | 'meetup';
  platform_id: string;
  start_time: string;
  end_time: string;
  location?: string;
  registration_url?: string;
  speaker: string;
  max_attendees?: number;
  current_attendees: number;
}

export interface SupabaseCommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  platform_id: string;
  post_type: 'discussion' | 'announcement' | 'question' | 'achievement';
  upvotes: number;
  replies: number;
  created_at: string;
  tags: string[];
}

// API Functions
export async function getPlatforms(): Promise<SupabasePlatform[]> {
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching platforms:', error);
    return [];
  }
  
  return data || [];
}

export async function getFeaturedContent(): Promise<SupabaseContent[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching featured content:', error);
    return [];
  }
  
  return data || [];
}

export async function getLatestNews(): Promise<SupabaseNews[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  
  return data || [];
}

export async function getLiveStreams(): Promise<SupabaseLiveStream[]> {
  const { data, error } = await supabase
    .from('live_streams')
    .select('*')
    .in('status', ['live', 'scheduled'])
    .order('started_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching live streams:', error);
    return [];
  }
  
  return data || [];
}

export async function getUpcomingEvents(): Promise<SupabaseEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5);
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data || [];
}

export async function getCommunityHighlights(): Promise<SupabaseCommunityPost[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('upvotes', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching community highlights:', error);
    return [];
  }
  
  return data || [];
}

export async function searchUnifiedContent(query: string, filters?: {
  platforms?: string[];
  content_types?: string[];
  limit?: number;
}): Promise<any[]> {
  try {
    const response = await supabase.functions.invoke('unified-search', {
      body: {
        query,
        filters: filters || {}
      }
    });

    if (response.error) {
      console.error('Search error:', response.error);
      return [];
    }

    return response.data?.results || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function getNetworkStats(): Promise<any> {
  try {
    const response = await supabase.functions.invoke('content-aggregator', {
      body: { action: 'network_stats' }
    });

    if (response.error) {
      console.error('Network stats error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Network stats failed:', error);
    return null;
  }
}