import { Video, Category, RokuFeed, RokuFeedItem } from '../types';
import { ROKU_CONFIG } from '../config/constants';
import { dataService } from './dataService';

class RokuService {
  async generateRokuFeed(): Promise<RokuFeed> {
    const videos = await dataService.getVideos();
    const categories = await dataService.getCategories();

    // Convert videos to Roku format
    const rokuItems: RokuFeedItem[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      content: {
        duration: video.duration,
        videos: [
          {
            url: video.video_url,
            quality: 'HD',
            videoType: 'MP4'
          }
        ]
      },
      thumbnail: video.thumbnail_url.startsWith('http') 
        ? video.thumbnail_url 
        : `${window.location.origin}${video.thumbnail_url}`,
      releaseDate: video.created_at,
      shortDescription: this.truncateDescription(video.description, 200),
      longDescription: video.description,
      tags: video.tags
    }));

    // Group by categories for series format
    const categorizedContent = categories.map(category => {
      const categoryVideos = videos.filter(video => video.category_id === category.id);
      return {
        id: category.id,
        title: category.name,
        episodes: categoryVideos.map(video => ({
          id: video.id,
          title: video.title,
          content: {
            duration: video.duration,
            videos: [
              {
                url: video.video_url,
                quality: 'HD',
                videoType: 'MP4'
              }
            ]
          },
          thumbnail: video.thumbnail_url.startsWith('http') 
            ? video.thumbnail_url 
            : `${window.location.origin}${video.thumbnail_url}`,
          releaseDate: video.created_at,
          shortDescription: this.truncateDescription(video.description, 200),
          longDescription: video.description,
          tags: video.tags
        }))
      };
    }).filter(category => category.episodes.length > 0);

    const feed: RokuFeed = {
      providerName: ROKU_CONFIG.channelTitle,
      language: 'en-us',
      lastUpdated: new Date().toISOString(),
      movies: rokuItems,
      series: categorizedContent
    };

    return feed;
  }

  async downloadRokuFeed(): Promise<string> {
    const feed = await this.generateRokuFeed();
    const feedJson = JSON.stringify(feed, null, 2);
    
    // Create downloadable blob
    const blob = new Blob([feedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'roku-feed.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return feedJson;
  }

  private truncateDescription(description: string, maxLength: number): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3) + '...';
  }

  // Format duration for Roku (expects seconds)
  private formatDurationForRoku(duration: number): number {
    return Math.floor(duration);
  }

  // Validate video URL for Roku compatibility
  private isValidRokuVideoUrl(url: string): boolean {
    // Roku supports MP4, M4V, MOV, HLS, DASH
    const supportedFormats = ['.mp4', '.m4v', '.mov'];
    const hasValidFormat = supportedFormats.some(format => 
      url.toLowerCase().includes(format)
    );
    
    // Also check for streaming protocols
    const hasStreamingProtocol = url.includes('.m3u8') || url.includes('.mpd');
    
    return hasValidFormat || hasStreamingProtocol;
  }
}

// Export singleton instance
export const rokuService = new RokuService();