import React, { useState } from 'react';
import { CourseCreate } from '../../api/models/CourseCreate';
import { useAuth } from '../../context/AuthContext';

interface NewCourseCardProps {
  onCreateCourse: (courseData: CourseCreate) => Promise<any>;
  handleCreateCategory: (name: string, description: string | null) => Promise<any>;
  categories: { categoryId: number; name: string }[];
}

const NewCourseCard = ({ onCreateCourse, handleCreateCategory, categories }: NewCourseCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [deadlineInDays, setDeadlineInDays] = useState(30);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user for teacherId
  const { user } = useAuth();

  // Handle course creation
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) return;
    if (!categoryId) return;
    if (!user || !user.userId) {
      setError('User information is missing. Please log in again.');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      await onCreateCourse({
        title,
        description: description || null,
        categoryId,
        teacherId: user.userId,
        deadlineInDays,
        isActive: true
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId(null);
      setDeadlineInDays(30);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Handle category creation
  const handleCreateCategoryLocal = async () => {
    if (newCategoryName.trim().length < 3) return;
    
    try {
      // Create the category
      const newCategory = await handleCreateCategory(
        newCategoryName,
        newCategoryDescription || null
      );
      
      // Update the selected category
      setCategoryId(newCategory.categoryId);
      
      // Close the modal
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all">
      {!showForm ? (
        <div className="flex flex-col items-center justify-center h-40 cursor-pointer" onClick={() => setShowForm(true)}>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700">Create New Course</h3>
          <p className="text-sm text-gray-500 mt-1">Click to add a new course</p>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Course</h3>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleCreateCourse}>
            <div className="mb-4">
              <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </label>
              <input
                id="course-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course title"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 mb-1">
                Course Description
              </label>
              <textarea
                id="course-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course description"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="course-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <div className="flex items-center">
                <select
                  id="course-category"
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="ml-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  + New
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="course-deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Task Deadline (days)
              </label>
              <input
                id="course-deadline"
                type="number"
                value={deadlineInDays}
                onChange={(e) => setDeadlineInDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                max={365}
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* New Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h3>
            <div className="mb-4">
              <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                id="new-category-name"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="new-category-description" className="block text-sm font-medium text-gray-700 mb-1">
                Category Description
              </label>
              <textarea
                id="new-category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category description"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategoryLocal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCourseCard; 