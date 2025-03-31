import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { TaskResponse, TaskCreate, TaskUpdate } from '../api/models';

interface UseTasksResult {
  tasks: TaskResponse[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: TaskCreate) => Promise<TaskResponse>;
  updateTask: (taskId: number, taskData: TaskUpdate) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  getTasksByCourse: (courseId: number) => TaskResponse[];
  getTaskById: (taskId: number) => TaskResponse | undefined;
}

/**
 * Custom hook for managing tasks
 */
export const useTasks = (): UseTasksResult => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const taskList = await apiClient.tasks.getTasks();
      setTasks(taskList);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiClient.tasks]);

  // Initialize by fetching tasks
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task
  const createTask = async (taskData: TaskCreate): Promise<TaskResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const newTask = await apiClient.tasks.createTasks({ taskCreate: taskData });
      
      // Update the tasks list
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing task
  const updateTask = async (taskId: number, taskData: TaskUpdate): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.tasks.updateTask({
        taskId,
        taskUpdate: taskData
      });
      
      // Fetch the updated task
      const updatedTask = await apiClient.tasks.getTask({ taskId });
      
      // Update the tasks list
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.taskId === taskId 
            ? updatedTask
            : task
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.tasks.deleteTask({
        taskId
      });
      
      // Update the tasks list
      setTasks(prevTasks => prevTasks.filter(task => task.taskId !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get tasks by course ID
  const getTasksByCourse = useCallback((courseId: number): TaskResponse[] => {
    return tasks.filter(task => task.courseId === courseId);
  }, [tasks]);

  // Get a task by ID
  const getTaskById = useCallback((taskId: number): TaskResponse | undefined => {
    return tasks.find(task => task.taskId === taskId);
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByCourse,
    getTaskById
  };
}; 