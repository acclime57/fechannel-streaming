import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, ExternalLink, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useVideo } from '../../hooks/useVideos';
import { useCategories } from '../../hooks/useCategories';
import { dataService } from '../../services/dataService';
import { AdminVideoForm } from '../../types';
import { isValidVideoUrl } from '../../utils/videoUtils';
import { AWS_CONFIG } from '../../config/constants';

export function VideoForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { isAuthenticated, isAdmin } = useAuth();
  const { video, loading: videoLoading } = useVideo(id || '');
  const { categories } = useCategories();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<AdminVideoForm>({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category_id: '',
    tags: [],
    duration: 0,
    featured: false,
    seo_description: '',
    seo_keywords: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoKeywordInput, setSeoKeywordInput] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Load video data for editing
  useEffect(() => {
    if (isEdit && video) {
      setFormData({
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        category_id: video.category_id,
        tags: video.tags || [],
        duration: video.duration,
        featured: video.featured,
        seo_description: video.seo_description || '',
        seo_keywords: video.seo_keywords || []
      });
    }
  }, [isEdit, video]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleAddSeoKeyword = () => {
    if (seoKeywordInput.trim() && !formData.seo_keywords.includes(seoKeywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seo_keywords: [...prev.seo_keywords, seoKeywordInput.trim()]
      }));
      setSeoKeywordInput('');
    }
  };

  const handleRemoveSeoKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seo_keywords: prev.seo_keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };
  
  // AI-powered SEO assistance
  const generateSeoContent = async () => {
    if (!formData.title || !formData.description) {
      setError('Please provide title and description before generating SEO content');
      return;
    }
    
    setSeoLoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate SEO description
      const aiDescription = `${formData.description.substring(0, 120)}${formData.description.length > 120 ? '...' : ''} Watch this enlightening video on FEChannel.com, the premier platform for flat earth research and documentaries. ${formData.title} provides compelling evidence and critical analysis for truth-seekers.`;
      
      // Generate SEO keywords
      const baseKeywords = ['flat earth', 'flat earth channel', 'documentary', 'research', 'truth'];
      const titleWords = formData.title.toLowerCase().split(' ')
        .filter(word => word.length > 3 && !['with', 'from', 'this', 'that', 'and', 'for'].includes(word));
      const descriptionWords = formData.description.toLowerCase().split(' ')
        .filter(word => word.length > 5 && !baseKeywords.includes(word) && !titleWords.includes(word))
        .slice(0, 5);
      
      const categoryKeywords = {
        'documentaries': ['documentary film', 'flat earth documentary'],
        'educational': ['flat earth education', 'earth science'],
        'interviews': ['flat earth interview', 'researcher interview'],
        'featured': ['featured flat earth', 'top flat earth video']
      };
      
      const categorySpecificKeywords = categoryKeywords[formData.category_id as keyof typeof categoryKeywords] || [];
      const generatedKeywords = [...new Set([...baseKeywords, ...titleWords, ...descriptionWords, ...categorySpecificKeywords])].slice(0, 10);
      
      // Update form with AI-generated content
      setFormData(prev => ({
        ...prev,
        seo_description: aiDescription,
        seo_keywords: generatedKeywords
      }));
      
      setSuccess('SEO content generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to generate SEO content. Please try again.');
    } finally {
      setSeoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.video_url.trim()) {
      setError('Video URL is required');
      return;
    }
    
    if (!isValidVideoUrl(formData.video_url)) {
      setError('Please enter a valid video URL (MP4, M4V, MOV, AVI, WebM)');
      return;
    }
    
    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }
    
    if (formData.duration <= 0) {
      setError('Duration must be greater than 0 seconds');
      return;
    }

    setLoading(true);
    
    try {
      if (isEdit && id) {
        await dataService.updateVideo(id, formData);
        setSuccess('Video updated successfully!');
      } else {
        await dataService.addVideo(formData);
        setSuccess('Video added successfully!');
        
        // Reset form for new video
        setFormData({
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          category_id: '',
          tags: [],
          duration: 0,
          featured: false,
          seo_description: '',
          seo_keywords: []
        });
      }
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setError('Failed to save video. Please try again.');
      console.error('Error saving video:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateS3Url = () => {
    const filename = prompt('Enter the video filename (e.g., video.mp4):');
    if (filename) {
      const s3Url = `${AWS_CONFIG.baseUrl}/${filename}`;
      setFormData(prev => ({ ...prev, video_url: s3Url }));
    }
  };

  const generateThumbnailUrl = () => {
    if (formData.video_url) {
      // Extract filename and replace extension with .jpg
      const url = new URL(formData.video_url);
      const filename = url.pathname.split('/').pop();
      if (filename) {
        const thumbnailFilename = filename.replace(/\.[^/.]+$/, '.jpg');
        const thumbnailUrl = `${AWS_CONFIG.baseUrl}/${thumbnailFilename}`;
        setFormData(prev => ({ ...prev, thumbnail_url: thumbnailUrl }));
      }
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (isEdit && videoLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="text-white hover:text-red-500 inline-flex items-center space-x-2 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white">
            {isEdit ? 'Edit Video' : 'Add New Video'}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          {(error || success) && (
            <div className={`p-4 rounded-lg mb-6 ${
              error ? 'bg-red-900/20 border border-red-500/30' : 'bg-green-900/20 border border-green-500/30'
            }`}>
              <p className={error ? 'text-red-400' : 'text-green-400'}>
                {error || success}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Video Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter video title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter video description"
              />
            </div>

            {/* Video URL */}
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-300 mb-2">
                Video URL *
              </label>
              <div className="flex space-x-2">
                <input
                  id="video_url"
                  name="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  required
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://fechannel-videos.s3.us-east-1.amazonaws.com/video.mp4"
                />
                <button
                  type="button"
                  onClick={generateS3Url}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  title="Generate S3 URL"
                >
                  <Upload className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                S3 Bucket: {AWS_CONFIG.bucketName}
              </p>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnail URL
              </label>
              <div className="flex space-x-2">
                <input
                  id="thumbnail_url"
                  name="thumbnail_url"
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={handleInputChange}
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://fechannel-videos.s3.us-east-1.amazonaws.com/thumbnail.jpg"
                />
                <button
                  type="button"
                  onClick={generateThumbnailUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  title="Auto-generate thumbnail URL"
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Category and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds) *
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., 3600 (1 hour)"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* SEO Section */}
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-400" />
                  SEO Optimization
                </h3>
                <button
                  type="button"
                  onClick={generateSeoContent}
                  disabled={seoLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 transition-colors"
                >
                  {seoLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>{seoLoading ? 'Generating...' : 'Generate AI SEO'}</span>
                </button>
              </div>
              
              {/* SEO Description */}
              <div className="mb-4">
                <label htmlFor="seo_description" className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  id="seo_description"
                  name="seo_description"
                  value={formData.seo_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter SEO-optimized description (or use AI generator)"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Optimized description improves search engine rankings (150-160 characters ideal)
                </p>
              </div>
              
              {/* SEO Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Keywords
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={seoKeywordInput}
                    onChange={(e) => setSeoKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeoKeyword())}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add SEO keyword and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddSeoKeyword}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {formData.seo_keywords && formData.seo_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.seo_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{keyword}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSeoKeyword(keyword)}
                          className="hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Keywords help search engines understand your content (5-10 keywords recommended)
                </p>
              </div>
            </div>
            
            {/* Featured */}
            <div className="flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                Mark as featured content
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/admin"
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{loading ? 'Saving...' : (isEdit ? 'Update Video' : 'Add Video')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}