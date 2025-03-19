import React, { useState, ChangeEvent, FormEvent, useRef, useCallback } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import models from individual files rather than the barrel file
import { CourseCreate } from '../api/models/CourseCreate';
import { CourseResponse } from '../api/models/CourseResponse';
import { TaskCreate } from '../api/models/TaskCreate';
import { TaskResponse } from '../api/models/TaskResponse';
import { CategoryCreate } from '../api/models/CategoryCreate';

// Item types for drag and drop
const ItemTypes = {
  COURSE: 'course'
};

// Props for DraggableCourse component
interface DraggableCourseProps {
  course: CourseResponse;
  courseTasks: TaskResponse[];
  handleEditCourse: (course: CourseResponse) => void;
  handleAddTask: (course: CourseResponse, taskTitle: string, taskDescription: string) => Promise<boolean>;
  setIsDragging: (isDragging: boolean) => void;
  setConfirmDelete: (isConfirming: boolean) => void;
  setDeleteCourseId: (courseId: number | null) => void;
}

// Props for TrashBin component
interface TrashBinProps {
  visible: boolean;
}

// Draggable Course Component
const DraggableCourse = ({ 
  course, 
  courseTasks, 
  handleEditCourse, 
  handleAddTask, 
  setIsDragging, 
  setConfirmDelete, 
  setDeleteCourseId 
}: DraggableCourseProps) => {
  const [expandedTaskForm, setExpandedTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  
  // Dragging functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COURSE,
    item: () => {
      // Set dragging state when drag starts (replaces begin)
      setIsDragging(true);
      return { courseId: course.courseId };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    end: (item, monitor) => {
      setIsDragging(false);
      const didDrop = monitor.didDrop();
      const dropResult = monitor.getDropResult() as { dropEffect?: string } | null;
      
      if (didDrop && dropResult?.dropEffect === 'delete') {
        setConfirmDelete(true);
        setDeleteCourseId(course.courseId);
      }
    }
  }));

  // Handle task form submission within the course
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || taskTitle.trim().length < 3) return;
    
    try {
      await handleAddTask(course, taskTitle, taskDescription);
      setTaskTitle('');
      setTaskDescription('');
      setExpandedTaskForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };
  
  return (
    <motion.div 
      ref={drag as any} // Type assertion to fix the ref typing issue
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      style={{ touchAction: 'none' }}
    >
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleEditCourse(course)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{course.description || 'No description provided.'}</p>
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
        
        {/* Expandable Task Form */}
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
                    onClick={() => setExpandedTaskForm(false)}
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
    </motion.div>
  );
};

// Trash Bin component where courses can be dropped for deletion
const TrashBin = ({ visible }: TrashBinProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.COURSE,
    drop: () => ({ dropEffect: 'delete' }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  if (!visible) return null;

  return (
    <motion.div
      ref={drop as any} // Type assertion to fix the ref typing issue
      className={`fixed bottom-8 right-8 p-6 rounded-full ${isOver ? 'bg-red-100' : 'bg-gray-100'} transition-colors shadow-lg z-50`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-10 w-10 ${isOver ? 'text-red-600' : 'text-gray-600'}`}
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </motion.div>
  );
};

const CourseManagement = () => {
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
  
  // State for category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  // Drag-and-drop related state
  const [isDragging, setIsDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);
  
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
      setShowCreateForm(false);
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
  
  // Handle course deletion
  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return;
    
    try {
      await deleteCourse(deleteCourseId);
      setDeleteCourseId(null);
    } catch (err) {
      console.error('Error deleting course:', err);
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
    <DndProvider backend={HTML5Backend}>
      <div className="animate-fade-in relative">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Management</h1>
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg text-gray-700">Create and manage courses with tasks</p>
          <motion.button 
            onClick={handleCreateCourse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create New Course
          </motion.button>
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
                <DraggableCourse 
                  key={course.courseId}
                  course={course}
                  courseTasks={courseTasks}
                  handleEditCourse={handleEditCourse}
                  handleAddTask={handleAddTask}
                  setIsDragging={setIsDragging}
                  setConfirmDelete={setConfirmDelete}
                  setDeleteCourseId={setDeleteCourseId}
                />
              );
            })}
          </div>
        )}
        
        {/* Trash Bin - appears only while dragging */}
        <AnimatePresence>
          {isDragging && <TrashBin visible={isDragging} />}
        </AnimatePresence>
        
        {/* Course Create/Edit Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
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
                    className={`py-2 px-3 block w-full border ${title.trim().length > 0 && title.trim().length < 3 ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {title.trim().length > 0 && title.trim().length < 3 && (
                    <p className="mt-1 text-sm text-red-600">Title must be at least 3 characters long</p>
                  )}
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
                    className={`py-2 px-4 border rounded-lg transition-colors ${
                      (!categoryId || !title.trim() || title.trim().length < 3) 
                        ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 border-transparent text-white hover:bg-blue-700'
                    }`}
                    disabled={!categoryId || !title.trim() || title.trim().length < 3}
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </motion.div>
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
        
        {/* Delete confirmation dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this course? This will also delete all associated tasks.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteCourse();
                    setConfirmDelete(false);
                  }}
                  className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default CourseManagement; 