import React, { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { CourseResponse, CourseCreate, TaskCreate, TaskResponse } from '../../api/models';

// Props for CourseCard component
interface CourseCardProps {
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

// Add TaskModification type
interface TaskModification {
  added: TaskCreate[];
  deleted: number[];
}

const CourseCard = ({ 
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
}: CourseCardProps) => {
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
    clearTaskForm();
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
      // Create the category using the passed prop function
      const newCategory = await handleCreateCategory(
        newCategoryName,
        newCategoryDescription || null
      );
      
      // Update the category ID in the edit form
      setEditCategoryId(newCategory.categoryId);
      
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
      {/* Course Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          {isEditing ? (
            <div className="mb-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Course title"
              />
            </div>
          ) : (
            <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
          )}
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500">
              {isEditing ? (
                <div className="flex items-center mt-2">
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    + New
                  </button>
                </div>
              ) : (
                <>Category: {categoryName}</>
              )}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Course Description */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Course description"
            rows={3}
          />
          <div className="flex items-center mt-2">
            <label className="text-sm text-gray-700 mr-2">Deadline (days):</label>
            <input
              type="number"
              value={editDeadline}
              onChange={(e) => setEditDeadline(parseInt(e.target.value) || 30)}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={1}
              max={365}
            />
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-sm mb-4">
          {course.description || 'No description provided.'}
          {course.deadlineInDays && (
            <span className="block mt-1 text-xs text-gray-500">
              Task deadline: {course.deadlineInDays} days
            </span>
          )}
        </p>
      )}

      {/* Task List Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-medium text-gray-700">Tasks</h3>
          {isEditing && (
            <button
              onClick={clearTaskForm}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              + Add Task
            </button>
          )}
        </div>

        {/* Task List */}
        <ul className="divide-y divide-gray-100">
          {currentTasks.length === 0 && !isEditing && (
            <li className="py-2 text-sm text-gray-500 italic">No tasks yet.</li>
          )}
          
          {currentTasks.map((task) => (
            <li key={task.taskId} className="py-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-800">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                  )}
                </div>
                {isEditing && (
                  <div>
                    {confirmingDeleteTaskId === task.taskId ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleConfirmTaskDelete(task.taskId)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteTaskId(null)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInitiateTaskDelete(task.taskId)}
                        className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}

          {/* Task modifications - added tasks */}
          {taskModifications.added.map((task, index) => (
            <li key={`added-${index}`} className="py-2 bg-green-50 rounded mt-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-800">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                  )}
                  <div className="text-xs text-green-600 mt-1">New task (unsaved)</div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => {
                      setTaskModifications(prev => ({
                        ...prev,
                        added: prev.added.filter((_, i) => i !== index)
                      }));
                    }}
                    className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Add Task Form - Only show in edit mode */}
        {isEditing && (
          <form onSubmit={handleTaskSubmit} className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
            <div className="mb-3">
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter task title"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
                Task Description (optional)
              </label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter task description"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={clearTaskForm}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this course? This action cannot be undone, and all associated tasks will be deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmDelete(false);
                  await deleteCourse(course.courseId);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Category</h3>
            <div className="mb-4">
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                id="category-name"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
                Category Description (optional)
              </label>
              <textarea
                id="category-description"
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

export default CourseCard; 