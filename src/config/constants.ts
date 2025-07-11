export const SITE_CONFIG = {
  siteName: 'FEChannel.com',
  channelName: 'Flat Earth TV Channel',
  description: 'The premier destination for Flat Earth content and documentaries',
  logo: '/images/fechannel-logo-v.jpg',
  theme: {
    primary: '#FF0000', // Red
    secondary: '#000000', // Black
    background: '#0a0a0a', // Dark background
    surface: '#1a1a1a', // Slightly lighter surface
    text: '#ffffff', // White text
    textSecondary: '#cccccc' // Light gray text
  }
};

export const AWS_CONFIG = {
  bucketName: 'fechannel-videos',
  region: 'us-east-1',
  baseUrl: 'https://fechannel-videos.s3.us-east-1.amazonaws.com'
};

export const ADMIN_CONFIG = {
  // For immediate deployment, using simple local storage auth
  // This can be easily upgraded to Supabase auth later
  adminEmail: 'admin@fechannel.com',
  adminPassword: 'FEChannel2024!' // Change this in production
};

export const ROKU_CONFIG = {
  channelId: 'fechannel',
  channelTitle: 'Flat Earth TV Channel',
  channelDescription: 'The premier destination for Flat Earth content and documentaries',
  channelLogo: '/images/fechannel-logo-v.jpg',
  feedVersion: '1.0'
};