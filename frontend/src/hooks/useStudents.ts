import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { UserResponse } from '../api/models';

interface UseStudentsResult {
  students: UserResponse[];
  loading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  assignTask: (studentId: number, taskTitle: string) => Promise<void>;
}

/**
 * Custom hook for managing student data
 */
export const useStudents = (): UseStudentsResult => {
  const [students, setStudents] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Fetch all students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const users = await apiClient.users.getUsers();
      // For now, we don't filter by role since we're implementing a student-only model
      // In a real app with multiple roles, you might filter: users.filter(user => user.role.name === 'student')
      setStudents(users);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
      setLoading(false);
    }
  }, [apiClient.users]);

  // Initialize by fetching students
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Placeholder for task assignment functionality
  // In a real app, this would call the task creation API
  const assignTask = async (studentId: number, taskTitle: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // This is a placeholder - in a real implementation, you would call the API to create a task
      console.log(`Assigning task "${taskTitle}" to student with ID ${studentId}`);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoading(false);
      // After successful assignment, you might want to refresh the student list
      // await fetchStudents();
    } catch (err) {
      console.error('Error assigning task:', err);
      setError('Failed to assign task. Please try again.');
      setLoading(false);
    }
  };

  return {
    students,
    loading,
    error,
    fetchStudents,
    assignTask
  };
}; 