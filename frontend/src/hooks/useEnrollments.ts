import { useState, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { EnrollmentResponse, EnrollmentCreate } from '../api/models';

interface UseEnrollmentsResult {
  enrollments: EnrollmentResponse[];
  loading: boolean;
  error: string | null;
  fetchEnrollments: () => Promise<void>;
  getEnrollmentsByStudent: (studentId: number) => EnrollmentResponse[];
  getEnrollmentsByCourse: (courseId: number) => EnrollmentResponse[];
  createEnrollment: (enrollmentData: EnrollmentCreate) => Promise<EnrollmentResponse>;
  deleteEnrollment: (enrollmentId: number) => Promise<void>;
}

/**
 * Custom hook for managing course enrollments
 */
export const useEnrollments = (): UseEnrollmentsResult => {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Fetch all enrollments
  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const enrollmentList = await apiClient.enrollments.getEnrollments();
      setEnrollments(enrollmentList);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to load enrollments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiClient.enrollments]);

  // Get enrollments by student ID
  const getEnrollmentsByStudent = useCallback((studentId: number): EnrollmentResponse[] => {
    return enrollments.filter(enrollment => enrollment.studentId === studentId);
  }, [enrollments]);

  // Get enrollments by course ID
  const getEnrollmentsByCourse = useCallback((courseId: number): EnrollmentResponse[] => {
    return enrollments.filter(enrollment => enrollment.courseId === courseId);
  }, [enrollments]);

  // Create a new enrollment (assign a course to a student)
  const createEnrollment = useCallback(async (enrollmentData: EnrollmentCreate): Promise<EnrollmentResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const newEnrollment = await apiClient.enrollments.createEnrollment({
        enrollmentCreate: enrollmentData
      });
      
      // Update the enrollments list
      setEnrollments(prevEnrollments => [...prevEnrollments, newEnrollment]);
      return newEnrollment;
    } catch (err) {
      console.error('Error creating enrollment:', err);
      setError('Failed to assign course to student. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient.enrollments]);

  // Delete an enrollment
  const deleteEnrollment = useCallback(async (enrollmentId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.enrollments.deleteEnrollment({
        enrollmentId
      });
      
      // Update the enrollments list
      setEnrollments(prevEnrollments => prevEnrollments.filter(enrollment => enrollment.enrollmentId !== enrollmentId));
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      setError('Failed to remove course assignment. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient.enrollments]);

  return {
    enrollments,
    loading,
    error,
    fetchEnrollments,
    getEnrollmentsByStudent,
    getEnrollmentsByCourse,
    createEnrollment,
    deleteEnrollment
  };
}; 