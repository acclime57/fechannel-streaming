import { dataService } from './dataService';
import { Video } from '../types';

interface RokuCategory {
  name: string;
  playlistName: string;
  videos: Video[];
}

interface RokuFeed {
  providerName: string;
  language: string;
  lastUpdated: string;
  categories: RokuCategory[];
}

class MultiRokuService {
  private baseConfig = {
    providerName: 'Flat Earth Media Group',
    language: 'en',
  };

  async generateMasterFeed(): Promise<RokuFeed> {
    const videos = await dataService.getVideos();
    const lastUpdated = new Date().toISOString();

    return {
      ...this.baseConfig,
      lastUpdated,
      categories: [
        {
          name: 'Featured Content',
          playlistName: 'Featured',
          videos: videos.filter(v => v.featured)
        },
        {
          name: 'All Content',
          playlistName: 'All Videos',
          videos: videos
        }
      ]
    };
  }

  async generateChannelFeed(channelType: 'tv' | 'radio' | 'documentary' | 'educational' | 'community'): Promise<RokuFeed> {
    const videos = await dataService.getVideos();
    const lastUpdated = new Date().toISOString();

    let filteredVideos: Video[] = [];
    let providerName = '';

    switch (channelType) {
      case 'tv':
        providerName = 'FEChannel TV';
        filteredVideos = videos; // All content for main TV channel
        break;
      case 'radio':
        providerName = 'FE Radio Live';
        filteredVideos = videos.filter(v => 
          v.tags.some(tag => tag.toLowerCase().includes('audio')) ||
          v.tags.some(tag => tag.toLowerCase().includes('radio')) ||
          v.category_id === 'interviews'
        );
        break;
      case 'documentary':
        providerName = 'FE Documentary Channel';
        filteredVideos = videos.filter(v => v.category_id === 'documentaries');
        break;
      case 'educational':
        providerName = 'FE Educational Channel';
        filteredVideos = videos.filter(v => v.category_id === 'educational');
        break;
      case 'community':
        providerName = 'FE Community Channel';
        filteredVideos = videos.filter(v => 
          v.tags.some(tag => tag.toLowerCase().includes('community')) ||
          v.tags.some(tag => tag.toLowerCase().includes('user'))
        );
        break;
    }

    return {
      ...this.baseConfig,
      providerName,
      lastUpdated,
      categories: [
        {
          name: 'Latest',
          playlistName: 'Latest Content',
          videos: filteredVideos.slice(0, 20)
        },
        {
          name: 'Popular',
          playlistName: 'Most Viewed',
          videos: filteredVideos.sort((a, b) => b.view_count - a.view_count).slice(0, 20)
        },
        {
          name: 'All Content',
          playlistName: 'All Videos',
          videos: filteredVideos
        }
      ]
    };
  }

  convertToRokuFormat(feed: RokuFeed): any {
    return {
      providerName: feed.providerName,
      language: feed.language,
      lastUpdated: feed.lastUpdated,
      categories: feed.categories.map(category => ({
        name: category.name,
        playlistName: category.playlistName,
        videos: category.videos.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail_url,
          url: video.video_url,
          duration: video.duration,
          dateAdded: video.created_at,
          tags: video.tags,
          genres: [this.getCategoryDisplayName(video.category_id)],
          rating: {
            rating: 'NR',
            ratingSource: 'MPAA'
          },
          captions: [],
          shortDescription: video.description.substring(0, 200),
          longDescription: video.description,
          quality: 'HD',
          actors: [],
          directors: [],
          episodeNumber: null,
          seasonNumber: null,
          seriesTitle: null
        }))
      }))
    };
  }

  private getCategoryDisplayName(categoryId: string): string {
    const categoryMap: { [key: string]: string } = {
      'documentaries': 'Documentary',
      'interviews': 'Interview',
      'educational': 'Educational',
      'news': 'News',
      'research': 'Research'
    };
    return categoryMap[categoryId] || 'General';
  }

  async generateAllFeeds(): Promise<{ [key: string]: any }> {
    const feeds = {};

    // Generate master feed
    const masterFeed = await this.generateMasterFeed();
    feeds['master'] = this.convertToRokuFormat(masterFeed);

    // Generate individual channel feeds
    const channelTypes: Array<'tv' | 'radio' | 'documentary' | 'educational' | 'community'> = 
      ['tv', 'radio', 'documentary', 'educational', 'community'];

    for (const channelType of channelTypes) {
      const channelFeed = await this.generateChannelFeed(channelType);
      feeds[channelType] = this.convertToRokuFormat(channelFeed);
    }

    return feeds;
  }

  async saveFeeds(): Promise<void> {
    try {
      const feeds = await this.generateAllFeeds();
      
      // Save individual feeds (in a real implementation, these would be saved to files or API endpoints)
      Object.entries(feeds).forEach(([feedType, feedData]) => {
        const feedJson = JSON.stringify(feedData, null, 2);
        
        // For demonstration, we'll log the feeds
        // In production, save to public/roku-feeds/ directory
        console.log(`Generated ${feedType} Roku feed:`, feedJson.substring(0, 200) + '...');
        
        // Save to localStorage for now
        localStorage.setItem(`roku_feed_${feedType}`, feedJson);
      });

      console.log('All Roku feeds generated successfully!');
    } catch (error) {
      console.error('Error generating Roku feeds:', error);
      throw error;
    }
  }

  getFeedUrl(feedType: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/roku-feeds/${feedType}.json`;
  }

  getAllFeedUrls(): { [key: string]: string } {
    return {
      'Master Feed (All Channels)': this.getFeedUrl('master'),
      'FEChannel TV': this.getFeedUrl('tv'),
      'FE Radio Live': this.getFeedUrl('radio'),
      'FE Documentary Channel': this.getFeedUrl('documentary'),
      'FE Educational Channel': this.getFeedUrl('educational'),
      'FE Community Channel': this.getFeedUrl('community')
    };
  }
}

export const multiRokuService = new MultiRokuService();