import { Video, Category, AdminVideoForm } from '../types';

class DataService {
  private videos: Video[] = [];
  private categories: Category[] = [];
  private isLoaded = false;

  async loadData(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Load videos
      const videosResponse = await fetch('/data/videos.json');
      const videosData = await videosResponse.json();
      this.videos = videosData.videos || [];

      // Load categories
      const categoriesResponse = await fetch('/data/categories.json');
      const categoriesData = await categoriesResponse.json();
      this.categories = categoriesData.categories || [];

      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty arrays
      this.videos = [];
      this.categories = [];
    }
  }

  async getVideos(): Promise<Video[]> {
    await this.loadData();
    return [...this.videos];
  }

  async getVideoById(id: string): Promise<Video | null> {
    await this.loadData();
    return this.videos.find(video => video.id === id) || null;
  }

  async getVideosByCategory(categoryId: string): Promise<Video[]> {
    await this.loadData();
    return this.videos.filter(video => video.category_id === categoryId);
  }

  async getFeaturedVideos(): Promise<Video[]> {
    await this.loadData();
    return this.videos.filter(video => video.featured);
  }

  async searchVideos(query: string): Promise<Video[]> {
    await this.loadData();
    const lowercaseQuery = query.toLowerCase();
    return this.videos.filter(video => 
      video.title.toLowerCase().includes(lowercaseQuery) ||
      video.description.toLowerCase().includes(lowercaseQuery) ||
      video.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getCategories(): Promise<Category[]> {
    await this.loadData();
    return [...this.categories].sort((a, b) => a.display_order - b.display_order);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    await this.loadData();
    return this.categories.find(category => category.id === id) || null;
  }

  // Admin functions for managing videos
  async addVideo(videoData: AdminVideoForm): Promise<Video> {
    await this.loadData();
    
    const newVideo: Video = {
      id: Date.now().toString(),
      ...videoData,
      view_count: 0,
      upload_status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.videos.push(newVideo);
    await this.saveData();
    return newVideo;
  }

  async updateVideo(id: string, updates: Partial<AdminVideoForm>): Promise<Video | null> {
    await this.loadData();
    
    const videoIndex = this.videos.findIndex(video => video.id === id);
    if (videoIndex === -1) return null;

    this.videos[videoIndex] = {
      ...this.videos[videoIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this.saveData();
    return this.videos[videoIndex];
  }

  async deleteVideo(id: string): Promise<boolean> {
    await this.loadData();
    
    const videoIndex = this.videos.findIndex(video => video.id === id);
    if (videoIndex === -1) return false;

    this.videos.splice(videoIndex, 1);
    await this.saveData();
    return true;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.loadData();
    
    const video = this.videos.find(video => video.id === id);
    if (video) {
      video.view_count += 1;
      await this.saveData();
    }
  }

  private async saveData(): Promise<void> {
    // For now, we'll store in localStorage
    // This can be easily upgraded to Supabase later
    try {
      localStorage.setItem('fechannel_videos', JSON.stringify(this.videos));
      localStorage.setItem('fechannel_categories', JSON.stringify(this.categories));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Load from localStorage if available (for persistence)
  private async loadFromStorage(): Promise<void> {
    try {
      const storedVideos = localStorage.getItem('fechannel_videos');
      const storedCategories = localStorage.getItem('fechannel_categories');
      
      if (storedVideos) {
        this.videos = JSON.parse(storedVideos);
      }
      
      if (storedCategories) {
        this.categories = JSON.parse(storedCategories);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  // Initialize with storage data if available
  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }
}

// Export singleton instance
export const dataService = new DataService();