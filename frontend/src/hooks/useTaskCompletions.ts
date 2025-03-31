import { useState, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { TaskCompletionResponse, TaskCompletionCreate } from '../api/models';
import { useAuth } from '../context/AuthContext';

// Extend TaskCompletionResponse with additional details for internal use
interface ExtendedTaskCompletionResponse extends TaskCompletionResponse {
  studentId?: number;
  assignerId?: number;
  studentName?: string;
}

interface UseTaskCompletionsResult {
  taskCompletions: ExtendedTaskCompletionResponse[];
  loading: boolean;
  error: string | null;
  fetchTaskCompletions: (userId?: number) => Promise<void>;
  fetchUserTaskCompletions: () => Promise<void>;
  requestTaskApproval: (enrollmentId: number, taskId: number) => Promise<void>;
  approveTask: (taskCompletionId: number) => Promise<void>;
  getPendingApprovalsByAssigner: () => ExtendedTaskCompletionResponse[];
  getPendingApprovalsByStudent: () => ExtendedTaskCompletionResponse[];
}

/**
 * Custom hook for managing task completions
 */
export const useTaskCompletions = (): UseTaskCompletionsResult => {
  const [taskCompletions, setTaskCompletions] = useState<ExtendedTaskCompletionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();
  const { user } = useAuth();

  // Fetch task completions with optional filtering by user ID
  const fetchTaskCompletions = useCallback(async (userId?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const completions = await apiClient.taskCompletions.getTaskCompletions();
      
      // For each task completion, fetch the associated enrollment to get student and assigner info
      const completionsWithDetails = await Promise.all(
        completions
          // Filter by userId if provided
          .filter(completion => {
            if (!userId) return true; // Return all if no filter
            // We'll need to fetch the enrollment to check if this task is related to the user
            return true; // Initially return all, we'll filter after getting enrollments
          })
          .map(async (completion) => {
            try {
              const enrollment = await apiClient.enrollments.getEnrollment({
                enrollmentId: completion.enrollmentId
              });
              
              // If filtering by userId, check if this completion is related to the user
              if (userId && enrollment.studentId !== userId && enrollment.assignerId !== userId) {
                return null; // Skip this completion if it's not related to the user
              }
              
              // Get student name
              let studentName = 'Unknown Student';
              try {
                const student = await apiClient.users.getUser({
                  userId: enrollment.studentId
                });
                studentName = `${student.firstName} ${student.lastName}`;
              } catch (err) {
                console.error(`Error fetching student details for student ID ${enrollment.studentId}:`, err);
              }
              
              return {
                ...completion,
                studentId: enrollment.studentId,
                assignerId: enrollment.assignerId,
                studentName: studentName
              } as ExtendedTaskCompletionResponse;
            } catch (err) {
              console.error(`Error fetching enrollment for task completion ${completion.taskCompletionId}:`, err);
              return null; // Skip this completion if we can't get enrollment details
            }
          })
      );
      
      // Filter out any null results (failed fetches or filtered items)
      const filteredCompletions = completionsWithDetails.filter(
        (completion): completion is ExtendedTaskCompletionResponse => completion !== null
      ) as ExtendedTaskCompletionResponse[];
      
      setTaskCompletions(filteredCompletions);
    } catch (err) {
      console.error('Error fetching task completions:', err);
      setError('Failed to load task completions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiClient.taskCompletions, apiClient.enrollments, apiClient.users]);

  // Convenience method to fetch only the current user's task completions
  const fetchUserTaskCompletions = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    await fetchTaskCompletions(user.userId);
  }, [fetchTaskCompletions, user]);

  // Request approval for a completed task
  const requestTaskApproval = async (enrollmentId: number, taskId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const taskCompletionData: TaskCompletionCreate = {
        enrollmentId,
        taskId,
        // Start with isActive=false to indicate pending approval
        isActive: false,
        // completedAt will be set when approved
        completedAt: null
      };
      
      await apiClient.taskCompletions.createTaskCompletion({
        taskCompletionCreate: taskCompletionData
      });
      
      // Refresh the user's task completions list only
      if (user) {
        await fetchUserTaskCompletions();
      }
    } catch (err) {
      console.error('Error requesting task approval:', err);
      setError('Failed to request task approval. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve a task completion
  const approveTask = async (taskCompletionId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Find the existing task completion
      const existingCompletion = taskCompletions.find(tc => tc.taskCompletionId === taskCompletionId);
      
      if (!existingCompletion) {
        throw new Error('Task completion not found');
      }
      
      // Update the task completion to mark it as active (approved) and set completion date
      const taskCompletionData: TaskCompletionCreate = {
        enrollmentId: existingCompletion.enrollmentId,
        taskId: existingCompletion.taskId,
        isActive: true,
        completedAt: new Date()
      };
      
      await apiClient.taskCompletions.updateTaskCompletion({
        taskCompletionId,
        taskCompletionCreate: taskCompletionData
      });
      
      // Refresh the user's task completions list only
      if (user) {
        await fetchUserTaskCompletions();
      }
    } catch (err) {
      console.error('Error approving task:', err);
      setError('Failed to approve task. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Get task completions pending approval where the current user is the assigner
  const getPendingApprovalsByAssigner = useCallback(() => {
    if (!user) return [];
    // Filter task completions where isActive is false (pending approval)
    // and the current user is the assigner
    return taskCompletions.filter(tc => 
      tc.isActive === false && 
      tc.assignerId === user.userId
    );
  }, [taskCompletions, user]);

  // Get task completions pending approval for the current user as a student
  const getPendingApprovalsByStudent = useCallback(() => {
    if (!user) return [];
    // Filter task completions where the current user is the student
    // and isActive is false (pending approval)
    return taskCompletions.filter(tc => 
      tc.studentId === user.userId && 
      tc.isActive === false
    );
  }, [taskCompletions, user]);

  return {
    taskCompletions,
    loading,
    error,
    fetchTaskCompletions,
    fetchUserTaskCompletions,
    requestTaskApproval,
    approveTask,
    getPendingApprovalsByAssigner,
    getPendingApprovalsByStudent
  };
}; 