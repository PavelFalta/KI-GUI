import React, { useState, ChangeEvent, FormEvent, useRef, useCallback, useEffect, useMemo } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

// Import models from individual files rather than the barrel file
import { CourseCreate } from '../api/models/CourseCreate';
import { CourseResponse } from '../api/models/CourseResponse';
import { TaskCreate } from '../api/models/TaskCreate';
import { TaskResponse } from '../api/models/TaskResponse';
import { CategoryCreate } from '../api/models/CategoryCreate';

// Add TaskModification type
interface TaskModification {
  added: TaskCreate[];
  deleted: number[];
}

// Props for DraggableCourse component
interface DraggableCourseProps {
  course: CourseResponse;
  courseTasks: TaskResponse[];
  handleEditCourse: (course: CourseResponse) => void;
  handleAddTask: (course: CourseResponse, taskTitle: string, taskDescription: string) => Promise<boolean>;
  categoryName: string;
  updateCourse: (courseId: number, courseData: CourseCreate) => Promise<void>;
  categories: { categoryId: number; name: string }[];
  deleteTask: (taskId: number) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  handleCreateCategory: (name: string, description: string | null) => Promise<any>;
}

// Add new interface for empty course state
interface NewCourseState {
  title: string;
  description: string;
  categoryId: number | null;
  deadlineInDays: number;
}

// Draggable Course Component
const DraggableCourse = ({ 
  course, 
  courseTasks, 
  handleEditCourse, 
  handleAddTask, 
  categoryName,
  updateCourse,
  categories,
  deleteTask,
  deleteCourse,
  handleCreateCategory
}: DraggableCourseProps) => {
  const [expandedTaskForm, setExpandedTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskModifications, setTaskModifications] = useState<TaskModification>({ added: [], deleted: [] });
  const [confirmingDeleteTaskId, setConfirmingDeleteTaskId] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { createCategory, fetchCategories } = useCategories();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const [editDescription, setEditDescription] = useState(course.description || '');
  const [editCategoryId, setEditCategoryId] = useState(course.categoryId);
  const [editDeadline, setEditDeadline] = useState(course.deadlineInDays || 30);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  
  // Fetch categories when the modal is opened or component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Additional effect to refresh categories when modal opens
  useEffect(() => {
    if (showCategoryModal) {
      fetchCategories();
    }
  }, [showCategoryModal, fetchCategories]);

  // Clear task form
  const clearTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
  };

  // Handle closing task form
  const handleCloseTaskForm = () => {
    setExpandedTaskForm(false);
    clearTaskForm();
  };

  // Handle task form submission within the course
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || taskTitle.trim().length < 3) return;
    
    const newTask: TaskCreate = {
      title: taskTitle,
      description: taskDescription || null,
      courseId: course.courseId,
      isActive: true
    };

    setTaskModifications(prev => ({
      ...prev,
      added: [...prev.added, newTask]
    }));

    clearTaskForm();
      setExpandedTaskForm(false);
  };
  
  // Handle saving course edits
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle.trim().length < 3 || !editCategoryId) return;
    
    try {
      // First update the course
      await updateCourse(course.courseId, {
        title: editTitle,
        description: editDescription || null,
        categoryId: editCategoryId,
        teacherId: course.teacherId,
        deadlineInDays: editDeadline,
        isActive: true
      });

      // Then apply task modifications
      for (const taskId of taskModifications.deleted) {
        await deleteTask(taskId);
      }
      for (const task of taskModifications.added) {
        if (task.title) {
          await handleAddTask(course, task.title, task.description ?? '');
        }
      }

      setTaskModifications({ added: [], deleted: [] });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating course:', err);
    }
  };
  
  // Cancel editing and reset form values
  const handleCancelEdit = () => {
    setEditTitle(course.title);
    setEditDescription(course.description || '');
    setEditCategoryId(course.categoryId);
    setEditDeadline(course.deadlineInDays || 30);
    setTaskModifications({ added: [], deleted: [] });
    setIsEditing(false);
  };

  // Handle initiating task deletion
  const handleInitiateTaskDelete = (taskId: number) => {
    setConfirmingDeleteTaskId(taskId);
  };

  // Handle confirming task deletion
  const handleConfirmTaskDelete = (taskId: number) => {
    setTaskModifications(prev => ({
      ...prev,
      deleted: [...prev.deleted, taskId]
    }));
    setConfirmingDeleteTaskId(null);
  };

  // Get the current tasks list considering modifications
  const currentTasks = courseTasks.filter(task => !taskModifications.deleted.includes(task.taskId));

  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Handle category creation
  const handleCreateCategoryLocal = async () => {
    if (newCategoryName.trim().length < 3) return;
    
    try {
      const newCategory = await handleCreateCategory(newCategoryName, newCategoryDescription || null);
      
      // Update the selected category
      setEditCategoryId(newCategory.categoryId);
      
      // Close modal and reset form
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden h-full"
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="relative">
        {/* Edit button positioned absolutely in the top-right corner */}
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 z-10 px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors bg-white"
          >
            Edit
          </button>
        )}
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center">
        <div className="flex-grow">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={`py-2 px-3 block w-full border ${editTitle.trim().length > 0 && editTitle.trim().length < 3 ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold`}
              placeholder="Course title"
            />
          ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{course.title}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {categoryName}
          </span>
              </>
            )}
        </div>
          {isEditing && (
            <div className="flex space-x-2 ml-4">
              <button 
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  (!editTitle.trim() || editTitle.trim().length < 3 || !editCategoryId) 
                    ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 border-transparent text-white hover:bg-blue-700'
                }`}
                disabled={!editTitle.trim() || editTitle.trim().length < 3 || !editCategoryId}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Course description (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={editCategoryId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'new') {
                    setShowCategoryModal(true);
                  } else {
                    setEditCategoryId(value ? parseInt(value) : 0);
                  }
                }}
                className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
                <option value="new" className="font-medium text-blue-600">+ Create new category</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (in days)</label>
              <input
                type="number"
                value={editDeadline}
                onChange={(e) => setEditDeadline(parseInt(e.target.value) || 30)}
                className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
        
            {/* Tasks section in edit mode */}
            <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-800">Tasks ({courseTasks.length})</h3>
            <button 
              onClick={() => setExpandedTaskForm(!expandedTaskForm)}
              className="h-8 w-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
        </div>
        
              {/* Task Form */}
        <AnimatePresence>
                {expandedTaskForm && (
            <motion.div 
              className="mb-4 bg-gray-50 p-4 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleTaskSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className={`py-2 px-3 block w-full border ${taskTitle.trim().length > 0 && taskTitle.trim().length < 3 ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter task title"
                    required
                  />
                  {taskTitle.trim().length > 0 && taskTitle.trim().length < 3 && (
                    <p className="mt-1 text-sm text-red-600">Task title must be at least 3 characters long</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                  <textarea
                    rows={2}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                          onClick={handleCloseTaskForm}
                    className="py-1 px-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`py-1 px-3 text-sm border rounded-lg transition-colors ${
                      (!taskTitle.trim() || taskTitle.trim().length < 3) 
                        ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 border-transparent text-white hover:bg-blue-700'
                    }`}
                    disabled={!taskTitle.trim() || taskTitle.trim().length < 3}
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
              {/* Task List in edit mode */}
              {currentTasks.length === 0 && taskModifications.added.length === 0 ? (
                <p className="text-gray-500">No tasks assigned to this course.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {currentTasks.map(task => (
                    <div key={task.taskId} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">{task.title}</div>
                        <p className="text-sm text-gray-500">{task.description || 'No description'}</p>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleInitiateTaskDelete(task.taskId)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {/* Show newly added tasks that haven't been saved yet */}
                  {taskModifications.added.map((task, index) => (
                    <div key={`new-${index}`} className="py-3 flex justify-between items-center bg-blue-50">
                      <div>
                        <div className="font-medium text-gray-800">{task.title}</div>
                        <p className="text-sm text-gray-500">{task.description || 'No description'}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add delete button at the bottom */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2 px-4 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Course
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">{course.description || 'No description provided.'}</p>
            
            {/* Task List in view mode */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Tasks ({courseTasks.length})</h3>
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
              </div>
            ))}
          </div>
              )}
            </div>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-sm text-gray-500">
          Deadline: {course.deadlineInDays} days
        </div>
      )}

      {/* Task deletion confirmation modal */}
      {confirmingDeleteTaskId !== null && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Task Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this task? This will be applied when you save the course.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmingDeleteTaskId(null)}
                className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmTaskDelete(confirmingDeleteTaskId)}
                className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Course deletion confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Course Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this course? This will also delete all associated tasks. This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteCourse(course.courseId);
                  setConfirmDelete(false);
                  setIsEditing(false);
                }}
                className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Category Create Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Create New Category</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category description"
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategoryLocal}
                  disabled={newCategoryName.trim().length < 3}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    newCategoryName.trim().length < 3
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Category
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// Update EmptyCourse component props
interface EmptyCourseProps {
  onCreateCourse: (courseData: CourseCreate) => Promise<any>;
  handleCreateCategory: (name: string, description: string | null) => Promise<any>;
  categories: { categoryId: number; name: string }[];
}

// Update EmptyCourse component to handle inline creation
const EmptyCourse = ({ onCreateCourse, handleCreateCategory, categories }: EmptyCourseProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCourse, setNewCourse] = useState<NewCourseState>({
    title: '',
    description: '',
    categoryId: null,
    deadlineInDays: 30
  });
  const { user } = useAuth();
  
  const handleCreate = async () => {
    if (!user || !newCourse.categoryId || !newCourse.title.trim() || newCourse.title.trim().length < 3) return;

    try {
      await onCreateCourse({
        title: newCourse.title,
        description: newCourse.description || null,
        categoryId: newCourse.categoryId,
        teacherId: user.userId,
        deadlineInDays: newCourse.deadlineInDays,
        isActive: true
      });
      setIsCreating(false);
      setNewCourse({
        title: '',
        description: '',
        categoryId: null,
        deadlineInDays: 30
      });
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  // Handle category creation in EmptyCourse
  const handleCreateCategoryLocal = async () => {
    if (newCategoryName.trim().length < 3) return;
    
    try {
      const newCategory = await handleCreateCategory(newCategoryName, newCategoryDescription || null);
      
      // Update the selected category
      setNewCourse(prev => ({ ...prev, categoryId: newCategory.categoryId }));
      
      // Close modal and reset form
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  if (!isCreating) {
  return (
    <motion.div
        className="bg-white/50 rounded-xl shadow-sm overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-white/80 transition-all cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsCreating(true)}
      >
        <div className="flex flex-col items-center justify-center p-12 text-gray-400 group-hover:text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-lg font-medium">Create New Course</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <input
          type="text"
          value={newCourse.title}
          onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
          className={`py-2 px-3 block w-full border ${newCourse.title.trim().length > 0 && newCourse.title.trim().length < 3 ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold`}
          placeholder="Course title"
        />
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={2}
            value={newCourse.description}
            onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
            className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Course description (optional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={newCourse.categoryId || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'new') {
                setShowCategoryModal(true);
              } else {
                setNewCourse(prev => ({ ...prev, categoryId: value ? parseInt(value) : null }));
              }
            }}
            className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
            <option value="new" className="font-medium text-blue-600">+ Create new category</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (in days)</label>
          <input
            type="number"
            value={newCourse.deadlineInDays}
            onChange={(e) => setNewCourse(prev => ({ ...prev, deadlineInDays: parseInt(e.target.value) || 30 }))}
            className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="pt-2 flex justify-end space-x-2">
          <button
            onClick={() => setIsCreating(false)}
            className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!newCourse.title.trim() || newCourse.title.trim().length < 3 || !newCourse.categoryId}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              !newCourse.title.trim() || newCourse.title.trim().length < 3 || !newCourse.categoryId
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Create Course
          </button>
        </div>
      </div>

      {/* Category Create Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Create New Category</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category description"
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategoryLocal}
                  disabled={newCategoryName.trim().length < 3}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    newCategoryName.trim().length < 3
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Category
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const CourseManagement = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError, createCourse, updateCourse, deleteCourse, fetchCourses } = useCourses();
  const { createTask, getTasksByCourse, deleteTask } = useTasks();
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory, fetchCategories } = useCategories();
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // State to force update when categories or courses change
  const [categoriesVersion, setCategoriesVersion] = useState(0);
  const [coursesVersion, setCoursesVersion] = useState(0);
  
  // Reference to the search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Enhanced function to create category and refresh list
  const handleCreateCategory = useCallback(async (name: string, description: string | null) => {
    try {
      const newCategory = await createCategory({
        name,
        description,
        isActive: true
      });
      await fetchCategories();
      // Force a re-render of this component
      setCategoriesVersion(prev => prev + 1);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }, [createCategory, fetchCategories]);
  
  // Enhanced function to create a course and refresh list
  const handleCreateCourse = useCallback(async (courseData: CourseCreate) => {
    try {
      const newCourse = await createCourse(courseData);
      await fetchCourses();
      // Force a re-render
      setCoursesVersion(prev => prev + 1);
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }, [createCourse, fetchCourses]);
  
  // Fetch categories on mount or when version changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, categoriesVersion]);
  
  // Fetch courses on mount or when version changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, coursesVersion]);
  
  // State for the create/edit course form
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [deadlineInDays, setDeadlineInDays] = useState<number>(30);
  
  // State for category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId(null);
    setDeadlineInDays(30);
    setEditingCourse(null);
  };
  
  // Handle opening the edit course form
  const handleEditCourse = (course: CourseResponse) => {
    setTitle(course.title);
    setDescription(course.description || '');
    setCategoryId(course.categoryId);
    setDeadlineInDays(course.deadlineInDays || 30);
    setEditingCourse(course);
  };
  
  // Handle category form submission
  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    
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
      resetForm();
    } catch (err) {
      console.error('Error saving course:', err);
    }
  };
  
  // Handle task creation directly from within the course
  const handleAddTask = async (course: CourseResponse, taskTitle: string, taskDescription: string) => {
    const taskData: TaskCreate = {
      title: taskTitle,
      description: taskDescription || null,
      courseId: course.courseId,
      isActive: true
    };
    
    try {
      await createTask(taskData);
      return true;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };
  
  // Handle key press anywhere on the page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in an input or textarea
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      
      // Only handle alphanumeric keys
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setIsSearchVisible(true);
        // Focus and set the search input
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          // We don't need to set the value directly here as the input will capture the keypress
        }
      }
      
      // Handle Escape key to close search
      if (e.key === 'Escape' && isSearchVisible) {
        setIsSearchVisible(false);
        setSearchQuery('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchVisible]);
  
  // Handle search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Hide search if the query is empty
    if (value === '') {
      setIsSearchVisible(false);
    } else {
      setIsSearchVisible(true);
    }
  };
  
  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses.filter(course => course.isActive !== false);
    }
    
    const query = searchQuery.toLowerCase().trim();
    return courses.filter(course => {
      // Filter by course title, description, or category name
      const category = categories.find(c => c.categoryId === course.categoryId);
      const categoryName = category ? category.name.toLowerCase() : '';
      
      return (
        course.isActive !== false &&
        (
          course.title.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query)) ||
          categoryName.includes(query)
        )
      );
    });
  }, [courses, categories, searchQuery]);
  
  const loading = coursesLoading || categoriesLoading;
  const error = coursesError || categoriesError;
  
  if (loading && courses.length === 0 && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Filter out inactive courses (now handled in filteredCourses)
  const activeCourses = filteredCourses;
  
  return (
      <div className="animate-fade-in relative">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Management</h1>
        <p className="text-lg text-gray-700 mb-6">Create and manage courses with tasks</p>
        
        {/* Search Tray */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mb-6 sticky top-4 z-10"
            >
              <div className="bg-white rounded-xl shadow-md p-3 flex items-center">
                <div className="text-gray-400 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
        </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex-1 border-none focus:ring-0 py-2 text-gray-700 placeholder-gray-400 text-lg bg-transparent"
                  placeholder="Search courses by title, description, or category..."
                  autoFocus
                />
              </div>
              {searchQuery && activeCourses.length === 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4 text-center">
                  <p className="text-blue-700">No courses found matching "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {activeCourses.length === 0 && !loading ? (
          <div className="columns-1 md:columns-2 gap-6">
            <div className="break-inside-avoid mb-6">
              <EmptyCourse 
                onCreateCourse={handleCreateCourse} 
                handleCreateCategory={handleCreateCategory}
                categories={categories}
              />
            </div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6">
            {activeCourses.map(course => {
              const courseTasks = getTasksByCourse(course.courseId);
              const category = categories.find(c => c.categoryId === course.categoryId);
              const categoryName = category ? category.name : "Uncategorized";
              
              return (
                <div key={course.courseId} className="break-inside-avoid mb-6">
                <DraggableCourse 
                  course={course}
                  courseTasks={courseTasks}
                  handleEditCourse={handleEditCourse}
                  handleAddTask={handleAddTask}
                  categoryName={categoryName}
                  updateCourse={updateCourse}
                  categories={categories}
                    deleteTask={deleteTask}
                    deleteCourse={deleteCourse}
                    handleCreateCategory={handleCreateCategory}
                />
                </div>
              );
            })}
            <div className="break-inside-avoid mb-6">
              <EmptyCourse 
                onCreateCourse={handleCreateCourse} 
                handleCreateCategory={handleCreateCategory}
                categories={categories}
              />
                </div>
                </div>
        )}
        
        {/* Category Create Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Create New Category</h3>
                <button onClick={() => setShowCategoryForm(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                    className={`py-2 px-3 block w-full border ${categoryName.trim().length > 0 && categoryName.trim().length < 3 ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {categoryName.trim().length > 0 && categoryName.trim().length < 3 && (
                    <p className="mt-1 text-sm text-red-600">Category name must be at least 3 characters long</p>
                  )}
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
                    className={`py-2 px-4 border rounded-lg transition-colors ${
                      (!categoryName.trim() || categoryName.trim().length < 3) 
                        ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 border-transparent text-white hover:bg-blue-700'
                    }`}
                    disabled={!categoryName.trim() || categoryName.trim().length < 3}
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
              </div>
  );
};

export default CourseManagement; 