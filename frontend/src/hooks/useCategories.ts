import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { CategoryResponse, CategoryCreate, CategoryUpdate } from '../api/models';

interface UseCategoriesResult {
  categories: CategoryResponse[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: CategoryCreate) => Promise<CategoryResponse>;
  updateCategory: (categoryId: number, categoryData: CategoryUpdate) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  getCategoryById: (categoryId: number) => CategoryResponse | undefined;
}

/**
 * Custom hook for managing categories
 */
export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const categoryList = await apiClient.categories.getCategories();
      setCategories(categoryList);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiClient.categories]);

  // Create a new category
  const createCategory = useCallback(async (categoryData: CategoryCreate): Promise<CategoryResponse> => {
    try {
      // Create the category first without setting loading state
      const newCategory = await apiClient.categories.createCategories({
        categoryCreate: categoryData
      });
      
      // Add the new category to the local state immediately
      setCategories(prevCategories => {
        // Add the new category if it doesn't already exist
        if (!prevCategories.some(c => c.categoryId === newCategory.categoryId)) {
          return [...prevCategories, newCategory];
        }
        return prevCategories;
      });
      
      // Return the category immediately without fetching all categories
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category. Please try again.');
      throw err;
    }
  }, [apiClient.categories]);

  // Update an existing category
  const updateCategory = useCallback(async (categoryId: number, categoryData: CategoryUpdate): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.categories.updateCategory({
        categoryId,
        categoryUpdate: categoryData
      });
      
      // Fetch the updated category
      const updatedCategory = await apiClient.categories.getCategory({ categoryId });
      
      // Update the categories list
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.categoryId === categoryId 
            ? updatedCategory
            : category
        )
      );
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient.categories]);

  // Delete a category
  const deleteCategory = useCallback(async (categoryId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.categories.deleteCategory({
        categoryId
      });
      
      // Update the categories list
      setCategories(prevCategories => prevCategories.filter(category => category.categoryId !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient.categories]);

  // Get a category by ID
  const getCategoryById = useCallback((categoryId: number): CategoryResponse | undefined => {
    return categories.find(category => category.categoryId === categoryId);
  }, [categories]);

  // Initialize by fetching categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  };
}; 