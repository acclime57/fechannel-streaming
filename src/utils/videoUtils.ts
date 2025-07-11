/**
 * Format duration from seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format view count to human readable format
 */
export function formatViewCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
  if (count < 1000000000) return (count / 1000000).toFixed(1) + 'M';
  return (count / 1000000000).toFixed(1) + 'B';
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Generate video thumbnail URL from video URL
 */
export function generateThumbnailUrl(videoUrl: string): string {
  // For S3 videos, we can try to find a corresponding thumbnail
  // This is a placeholder implementation
  const baseUrl = videoUrl.replace(/\.[^/.]+$/, '');
  return `${baseUrl}.jpg`;
}

/**
 * Validate video URL format
 */
export function isValidVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.m4v', '.mov', '.avi', '.webm'];
  const hasValidExtension = videoExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  const isValidUrl = /^https?:\/\/.+/.test(url);
  
  return isValidUrl && hasValidExtension;
}

/**
 * Extract video ID from URL or filename
 */
export function extractVideoId(url: string): string {
  const fileName = url.split('/').pop() || '';
  return fileName.split('.')[0] || Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate video quality based on file size and duration
 */
export function estimateVideoQuality(fileSize: number, duration: number): string {
  if (!fileSize || !duration) return 'Unknown';
  
  const bitrate = (fileSize * 8) / duration; // bits per second
  
  if (bitrate > 5000000) return '1080p';
  if (bitrate > 2500000) return '720p';
  if (bitrate > 1000000) return '480p';
  return '360p';
}