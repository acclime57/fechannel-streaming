import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { VideoGrid } from '../components/VideoGrid';
import { useVideosByCategory } from '../hooks/useVideos';
import { useCategory } from '../hooks/useCategories';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { videos, loading, error } = useVideosByCategory(categoryId!);
  const { category, loading: categoryLoading } = useCategory(categoryId!);

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-gray-400 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link
          to="/"
          className="text-white hover:text-red-500 inline-flex items-center space-x-2 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-gray-300 text-lg max-w-3xl">
              {category.description}
            </p>
          )}
          
          {videos.length > 0 && (
            <p className="text-gray-400 mt-4">
              {videos.length} video{videos.length === 1 ? '' : 's'} in this category
            </p>
          )}
        </div>

        {/* Videos Grid */}
        <VideoGrid
          videos={videos}
          loading={loading}
          error={error}
          cardSize="medium"
          emptyMessage={`No videos found in the ${category.name} category.`}
        />
      </div>
    </div>
  );
}