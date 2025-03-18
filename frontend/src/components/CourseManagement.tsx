import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { CourseCreate, CourseResponse, TaskCreate, CategoryCreate } from '../api/models';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CourseManagement: React.FC = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError, createCourse, updateCourse, deleteCourse } = useCourses();
  const { createTask, getTasksByCourse } = useTasks();
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory } = useCategories();
  
  // State for the create/edit course form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [deadlineInDays, setDeadlineInDays] = useState<number>(30);
  
  // State for the task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  
  // State for category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  
  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId(null);
    setDeadlineInDays(30);
    setEditingCourse(null);
  };
  
  // Handle opening the create course form
  const handleCreateCourse = () => {
    resetForm();
    setShowCreateForm(true);
  };
  
  // Handle opening the edit course form
  const handleEditCourse = (course: CourseResponse) => {
    setTitle(course.title);
    setDescription(course.description || '');
    setCategoryId(course.categoryId);
    setDeadlineInDays(course.deadlineInDays || 30);
    setEditingCourse(course);
    setShowCreateForm(true);
  };
  
  // Handle category form submission
  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCategoryFormError(null);
    
    if (!categoryName.trim()) {
      setCategoryFormError("Category name is required");
      return;
    }
    
    try {
      const newCategory = await createCategory({
        name: categoryName,
        description: categoryDescription || null,
        isActive: true
      });
      
      // Select the newly created category in the dropdown
      setCategoryId(newCategory.categoryId);
      
      // Close the category form
      setShowCategoryForm(false);
      
      // Reset the form fields
      setCategoryName('');
      setCategoryDescription('');
    } catch (err) {
      console.error('Error creating category:', err);
      setCategoryFormError("Failed to create category. Please try again.");
    }
  };
  
  // Handle course form submission
  const handleCourseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user || !categoryId) return;
    
    const courseData: CourseCreate = {
      title,
      description: description || null,
      categoryId,
      teacherId: user.userId,
      deadlineInDays,
      isActive: true
    };
    
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.courseId, courseData);
      } else {
        await createCourse(courseData);
      }
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Error saving course:', err);
    }
  };
  
  // Handle opening the add task form
  const handleAddTask = (course: CourseResponse) => {
    setSelectedCourse(course);
    setTaskTitle('');
    setTaskDescription('');
    setShowTaskForm(true);
  };
  
  // Handle task form submission
  const handleTaskSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;
    
    const taskData: TaskCreate = {
      title: taskTitle,
      description: taskDescription || null,
      courseId: selectedCourse.courseId,
      isActive: true
    };
    
    try {
      await createTask(taskData);
      setShowTaskForm(false);
      setTaskTitle('');
      setTaskDescription('');
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };
  
  // Handle course deletion
  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all associated tasks.')) {
      try {
        await deleteCourse(courseId);
      } catch (err) {
        console.error('Error deleting course:', err);
      }
    }
  };
  
  const loading = coursesLoading || categoriesLoading;
  const error = coursesError || categoriesError;
  
  if (loading && courses.length === 0 && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Filter out inactive courses
  const activeCourses = courses.filter(course => course.isActive !== false);
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Management</h1>
      <div className="flex justify-between items-center mb-6">
        <p className="text-lg text-gray-700">Create and manage courses with tasks</p>
        <button 
          onClick={handleCreateCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create New Course
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {activeCourses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-gray-500 mb-2">No courses found</p>
          <p className="text-sm text-gray-400">Create your first course to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCourses.map(course => {
            const courseTasks = getTasksByCourse(course.courseId);
            
            return (
              <div key={course.courseId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAddTask(course)}
                      className="px-3 py-1 text-sm border border-blue-500 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                      Add Task
                    </button>
                    <button 
                      onClick={() => handleEditCourse(course)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.courseId)}
                      className="px-3 py-1 text-sm border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{course.description || 'No description provided.'}</p>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Tasks ({courseTasks.length})</h3>
                  {courseTasks.length === 0 ? (
                    <p className="text-gray-500">No tasks assigned to this course.</p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {courseTasks.map(task => (
                        <div key={task.taskId} className="py-3 flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">{task.title}</div>
                            <p className="text-sm text-gray-500">{task.description || 'No description'}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {task.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-sm text-gray-500">
                  Deadline: {course.deadlineInDays} days
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Course Create/Edit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Create New Category
                  </button>
                </div>
                
                <select
                  value={categoryId || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && !categoriesLoading && (
                  <p className="mt-1 text-xs text-red-500">
                    No categories available. Please create a category first.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (in days)</label>
                <input
                  type="number"
                  value={deadlineInDays}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDeadlineInDays(parseInt(e.target.value) || 30)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 border border-transparent rounded-lg text-white hover:bg-blue-700 transition-colors"
                  disabled={!categoryId}
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Task Create Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Task to {selectedCourse?.title}</h3>
              <button onClick={() => setShowTaskForm(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTaskTitle(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTaskDescription(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 border border-transparent rounded-lg text-white hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Category Create Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Create New Category</h3>
              <button onClick={() => setShowCategoryForm(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {categoryFormError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
                <p className="text-red-700">{categoryFormError}</p>
              </div>
            )}
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Description</label>
                <textarea
                  rows={3}
                  value={categoryDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCategoryDescription(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 border border-transparent rounded-lg text-white hover:bg-blue-700 transition-colors"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement; 