const AWS = require('aws-sdk');

// Configure AWS directly in function
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET || 'fechannel-videos';

async function deleteS3Object(key) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    
    return {
      success: true,
      message: `Successfully deleted ${key}`
    };
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function getS3ObjectMetadata(key) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    const result = await s3.headObject(params).promise();
    
    return {
      success: true,
      metadata: {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata
      }
    };
  } catch (error) {
    console.error('Error getting S3 object metadata:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

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
      // Get video metadata
      const { key } = req.query;
      
      if (!key) {
        return res.status(400).json({
          success: false,
          error: 'Missing video key parameter'
        });
      }
      
      const result = await getS3ObjectMetadata(key);
      return res.status(result.success ? 200 : 500).json(result);
    }
    
    if (req.method === 'DELETE') {
      // Delete video
      const { key } = req.query;
      
      if (!key) {
        return res.status(400).json({
          success: false,
          error: 'Missing video key parameter'
        });
      }
      
      const result = await deleteS3Object(key);
      return res.status(result.success ? 200 : 500).json(result);
    }
    
    if (req.method === 'POST') {
      // Upload video
      const { key, fileBuffer, contentType, metadata } = req.body;
      
      if (!key || !fileBuffer || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: key, fileBuffer, contentType'
        });
      }
      
      const buffer = Buffer.from(fileBuffer, 'base64');
      const result = await uploadFileToS3(key, buffer, contentType, metadata);
      
      return res.status(result.success ? 200 : 500).json(result);
    }
    
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('Video management error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process video management request',
      message: error.message
    });
  }
};