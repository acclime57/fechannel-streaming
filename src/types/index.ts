export interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category_id: string;
  tags: string[];
  duration: number; // in seconds
  file_size?: number;
  upload_status?: string;
  featured: boolean;
  view_count: number;
  created_at: string;
  updated_at?: string;
  seo_description?: string;
  seo_keywords?: string[];
  file_size_mb?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface RokuFeedItem {
  id: string;
  title: string;
  content: {
    duration: number;
    videos: Array<{
      url: string;
      quality: string;
      videoType: string;
    }>;
  };
  thumbnail: string;
  episodeNumber?: number;
  releaseDate: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
}

export interface RokuFeed {
  providerName: string;
  language: string;
  lastUpdated: string;
  movies?: RokuFeedItem[];
  series?: Array<{
    id: string;
    title: string;
    episodes: RokuFeedItem[];
  }>;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
}

export interface AdminVideoForm {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category_id: string;
  tags: string[];
  duration: number;
  featured: boolean;
  seo_description?: string;
  seo_keywords?: string[];
}