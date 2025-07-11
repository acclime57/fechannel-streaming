import React from 'react';
import { FeaturedHero } from '../components/FeaturedHero';
import { CategoryRow } from '../components/CategoryRow';
import { useFeaturedVideos, useVideosByCategory } from '../hooks/useVideos';
import { useCategories } from '../hooks/useCategories';
import { Loader2, Play } from 'lucide-react';

export function HomePage() {
  const { videos: featuredVideos, loading: featuredLoading } = useFeaturedVideos();
  const { categories, loading: categoriesLoading } = useCategories();
  const { videos: documentaries, loading: docLoading } = useVideosByCategory('documentaries');
  const { videos: interviews, loading: interviewLoading } = useVideosByCategory('interviews');
  const { videos: educational, loading: eduLoading } = useVideosByCategory('educational');

  if (featuredLoading && categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading FEChannel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Featured Hero Section - Netflix Style */}
      {featuredVideos.length > 0 && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 mb-8">
          <FeaturedHero videos={featuredVideos} />
        </div>
      )}

      {/* Content Rows - Netflix Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Featured Content */}
        {featuredVideos.length > 0 && (
          <CategoryRow
            title="Featured Videos"
            videos={featuredVideos}
            categoryId="featured"
            loading={featuredLoading}
          />
        )}

        {/* Documentaries */}
        <CategoryRow
          title="Documentaries"
          videos={documentaries}
          categoryId="documentaries"
          loading={docLoading}
        />

        {/* Interviews */}
        <CategoryRow
          title="Interviews"
          videos={interviews}
          categoryId="interviews"
          loading={interviewLoading}
        />

        {/* Educational */}
        <CategoryRow
          title="Educational Content"
          videos={educational}
          categoryId="educational"
          loading={eduLoading}
        />

        {/* All Content Categories */}
        {categories.map((category) => {
          // Skip categories we've already shown
          if (['featured', 'documentaries', 'interviews', 'educational'].includes(category.id)) {
            return null;
          }
          
          return (
            <CategoryRowWrapper
              key={category.id}
              categoryId={category.id}
              title={category.name}
            />
          );
        })}
      </div>
    </div>
  );
}

// Helper component to load category videos
function CategoryRowWrapper({ categoryId, title }: { categoryId: string; title: string }) {
  const { videos, loading } = useVideosByCategory(categoryId);
  
  if (videos.length === 0 && !loading) {
    return null;
  }
  
  return (
    <CategoryRow
      title={title}
      videos={videos}
      categoryId={categoryId}
      loading={loading}
    />
  );
}