import { useState, useEffect } from 'react';
import { Category } from '../types';
import { dataService } from '../services/dataService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await dataService.getCategories();
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: loadCategories
  };
}

export function useCategory(id: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const categoryData = await dataService.getCategoryById(id);
      setCategory(categoryData);
      setError(null);
    } catch (err) {
      setError('Failed to load category');
      console.error('Error loading category:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    category,
    loading,
    error,
    refetch: loadCategory
  };
}