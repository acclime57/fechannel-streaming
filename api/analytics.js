const AWS = require('aws-sdk');

// Configure AWS directly in function
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET || 'fechannel-videos';

// Mock analytics data for demonstration
// In production, this would connect to a real analytics service
function generateMockAnalytics() {
  const platforms = {
    web: {
      views: Math.floor(Math.random() * 10000) + 5000,
      users: Math.floor(Math.random() * 1000) + 500,
      watchTime: Math.floor(Math.random() * 50000) + 25000
    },
    roku: {
      views: Math.floor(Math.random() * 8000) + 3000,
      users: Math.floor(Math.random() * 800) + 300,
      watchTime: Math.floor(Math.random() * 40000) + 20000
    },
    mobile: {
      views: Math.floor(Math.random() * 6000) + 2000,
      users: Math.floor(Math.random() * 600) + 200,
      watchTime: Math.floor(Math.random() * 30000) + 15000
    }
  };

  const totalViews = Object.values(platforms).reduce((sum, platform) => sum + platform.views, 0);
  const totalUsers = Object.values(platforms).reduce((sum, platform) => sum + platform.users, 0);
  const totalWatchTime = Object.values(platforms).reduce((sum, platform) => sum + platform.watchTime, 0);

  return {
    overview: {
      totalViews,
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.3),
      totalWatchTime
    },
    platforms,
    topVideos: [
      {
        id: '1',
        title: 'Flat Earth Documentary Series - Episode 1',
        views: Math.floor(Math.random() * 5000) + 2000,
        duration: 3600,
        thumbnail: '/images/1-fechannel-336X210.jpg'
      },
      {
        id: '2',
        title: 'Scientific Evidence for Flat Earth',
        views: Math.floor(Math.random() * 4000) + 1500,
        duration: 2700,
        thumbnail: '/images/2-fechannel-248X140.jpg'
      },
      {
        id: '3',
        title: 'Debunking Globe Earth Myths',
        views: Math.floor(Math.random() * 3500) + 1200,
        duration: 4200,
        thumbnail: '/images/3ss-fechannel-540X405.jpg'
      }
    ],
    recentActivity: [
      {
        type: 'view',
        description: 'New video watched',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        data: { videoTitle: 'Flat Earth Documentary Series - Episode 1' }
      },
      {
        type: 'upload',
        description: 'Video uploaded',
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        data: { videoTitle: 'New Flat Earth Evidence' }
      },
      {
        type: 'user',
        description: 'New user registered',
        timestamp: new Date(Date.now() - Math.random() * 10800000).toISOString(),
        data: { platform: 'Web' }
      }
    ],
    viewsOverTime: [
      { date: '2024-01-01', views: 1200 },
      { date: '2024-01-02', views: 1350 },
      { date: '2024-01-03', views: 1180 },
      { date: '2024-01-04', views: 1420 },
      { date: '2024-01-05', views: 1380 },
      { date: '2024-01-06', views: 1550 },
      { date: '2024-01-07', views: 1680 }
    ]
  };
}

async function getS3Analytics() {
  try {
    // Get bucket statistics
    const listParams = {
      Bucket: bucketName
    };
    
    const objects = await s3.listObjectsV2(listParams).promise();
    
    const videoCount = objects.Contents?.filter(obj => 
      obj.Key?.endsWith('.mp4') || 
      obj.Key?.endsWith('.mov') || 
      obj.Key?.endsWith('.avi')
    ).length || 0;
    
    const totalSize = objects.Contents?.reduce((sum, obj) => sum + (obj.Size || 0), 0) || 0;
    
    return {
      success: true,
      storage: {
        totalFiles: objects.Contents?.length || 0,
        videoFiles: videoCount,
        totalSize: totalSize,
        formattedSize: formatBytes(totalSize)
      }
    };
  } catch (error) {
    console.error('Error getting S3 analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { type = 'platform' } = req.query;
    
    if (type === 'storage') {
      const storageAnalytics = await getS3Analytics();
      return res.status(200).json(storageAnalytics);
    }
    
    // Default to platform analytics
    const analyticsData = generateMockAnalytics();
    
    return res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate analytics',
      message: error.message
    });
  }
};