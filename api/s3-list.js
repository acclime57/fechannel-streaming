const AWS = require('aws-sdk');

// Configure AWS directly in function
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET || 'fechannel-videos';

async function listS3Objects(prefix = '', limit = 1000, continuationToken = null) {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: limit,
      ...(continuationToken && { ContinuationToken: continuationToken })
    };
    
    const result = await s3.listObjectsV2(params).promise();
    
    return {
      success: true,
      objects: result.Contents?.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        contentType: obj.ContentType || getContentTypeFromKey(obj.Key),
        url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`
      })) || [],
      totalCount: result.KeyCount || 0,
      isTruncated: result.IsTruncated || false,
      nextContinuationToken: result.NextContinuationToken || null
    };
  } catch (error) {
    console.error('Error listing S3 objects:', error);
    return {
      success: false,
      error: error.message,
      objects: [],
      totalCount: 0,
      isTruncated: false,
      nextContinuationToken: null
    };
  }
}

function getContentTypeFromKey(key) {
  const ext = key.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'json': 'application/json'
  };
  return mimeTypes[ext] || 'application/octet-stream';
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
    const { prefix = '', limit = 50, continuationToken } = req.query;
    
    const result = await listS3Objects(prefix, parseInt(limit), continuationToken);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    // Wrap successful response in 'data' property to match frontend expectations
    return res.status(200).json({
      success: true,
      data: {
        objects: result.objects,
        totalCount: result.totalCount,
        isTruncated: result.isTruncated,
        nextContinuationToken: result.nextContinuationToken
      }
    });
  } catch (error) {
    console.error('S3 list error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to list S3 objects',
      message: error.message
    });
  }
}