const AWS = require('aws-sdk');

// Configure AWS directly in function
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET || 'fechannel-videos';

// Helper function to fetch current Roku feed from external URL
async function fetchCurrentRokuFeed() {
  try {
    const url = process.env.ROKU_FEED_URL || 'https://fechannel.com/roku-feed.json';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const feed = await response.json();
    return { success: true, feed };
  } catch (error) {
    console.error('Error fetching Roku feed:', error);
    return { success: false, error: 'Failed to fetch feed', message: error.message };
  }
}

// Upload file to S3
async function uploadFileToS3(key, fileBuffer, contentType, metadata = {}) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: metadata,
      ACL: 'public-read'
    };
    
    const result = await s3.upload(params).promise();
    
    return {
      success: true,
      location: result.Location,
      key: result.Key,
      etag: result.ETag
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Validate Roku feed structure
function validateRokuFeed(feed) {
  const errors = [];
  const warnings = [];
  
  if (!feed) {
    errors.push('Feed is empty or invalid');
    return { isValid: false, errors, warnings, totalVideos: 0, categories: [] };
  }
  
  if (!feed.categories || !Array.isArray(feed.categories)) {
    errors.push('Missing or invalid categories array');
  }
  
  if (!feed.lastUpdated) {
    warnings.push('Missing lastUpdated timestamp');
  }
  
  let totalVideos = 0;
  const categories = [];
  
  if (feed.categories) {
    feed.categories.forEach((category, index) => {
      if (!category.name) {
        errors.push(`Category ${index} missing name`);
      } else {
        categories.push(category.name);
      }
      
      if (!category.videos || !Array.isArray(category.videos)) {
        errors.push(`Category "${category.name || index}" missing or invalid videos array`);
      } else {
        totalVideos += category.videos.length;
        
        category.videos.forEach((video, videoIndex) => {
          if (!video.id) {
            errors.push(`Video ${videoIndex} in category "${category.name}" missing id`);
          }
          if (!video.title) {
            errors.push(`Video ${videoIndex} in category "${category.name}" missing title`);
          }
          if (!video.content || !video.content.videos || !Array.isArray(video.content.videos)) {
            errors.push(`Video ${videoIndex} in category "${category.name}" missing content.videos array`);
          }
        });
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalVideos,
    categories
  };
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'GET') {
      // Fetch and validate current Roku feed
      const result = await fetchCurrentRokuFeed();
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
      
      const validation = validateRokuFeed(result.feed);
      
      return res.status(200).json({
        success: true,
        data: {
          feed: result.feed,
          validation: validation
        }
      });
    }
    
    if (req.method === 'POST') {
      // Generate or update Roku feed
      const { feedData, action = 'validate' } = req.body;
      
      if (!feedData) {
        return res.status(400).json({
          success: false,
          error: 'Missing feedData in request body'
        });
      }
      
      // Validate the feed
      const validation = validateRokuFeed(feedData);
      
      if (action === 'validate') {
        return res.status(200).json({
          success: true,
          data: { validation }
        });
      }
      
      if (action === 'upload' && validation.isValid) {
        // Upload to S3
        const feedBuffer = Buffer.from(JSON.stringify(feedData, null, 2));
        const uploadResult = await uploadFileToS3(
          'roku-feed.json',
          feedBuffer,
          'application/json',
          {
            'generated-by': 'fechannel-admin',
            'generated-at': new Date().toISOString(),
            'total-videos': validation.totalVideos.toString()
          }
        );
        
        if (!uploadResult.success) {
          return res.status(500).json({
            success: false,
            error: 'Failed to upload feed to S3',
            message: uploadResult.error
          });
        }
        
        return res.status(200).json({
          success: true,
          data: {
            validation,
            upload: uploadResult
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        error: 'Invalid action or feed validation failed'
      });
    }
    
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('Roku feed error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process Roku feed request',
      message: error.message
    });
  }
};