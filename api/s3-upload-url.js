const AWS = require('aws-sdk');

// Configure AWS directly in function
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET || 'fechannel-videos';

async function generatePresignedUploadUrl(key, contentType, expiresIn = 3600) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn,
      ACL: 'public-read'
    };
    
    const url = await s3.getSignedUrlPromise('putObject', params);
    
    return {
      success: true,
      uploadUrl: url,
      publicUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { filename, contentType, folder = 'videos' } = req.body;
    
    if (!filename || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: filename, contentType'
      });
    }
    
    // Generate unique key with timestamp
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}-${filename}`;
    
    const result = await generatePresignedUploadUrl(key, contentType);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.status(200).json({
      success: true,
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      key: key
    });
  } catch (error) {
    console.error('S3 upload URL error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate upload URL',
      message: error.message
    });
  }
};