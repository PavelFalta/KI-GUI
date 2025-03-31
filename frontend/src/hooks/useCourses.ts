import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { CourseResponse, CourseCreate, CourseUpdate } from '../api/models';

interface UseCoursesResult {
  courses: CourseResponse[];
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  createCourse: (courseData: CourseCreate) => Promise<CourseResponse>;
  updateCourse: (courseId: number, courseData: CourseUpdate) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  getCourseById: (courseId: number) => CourseResponse | undefined;
}

/**
 * Custom hook for managing courses
 */
export const useCourses = (): UseCoursesResult => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const courseList = await apiClient.courses.getCourses();
      setCourses(courseList);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiClient.courses]);

  // Create a new course
  const createCourse = useCallback(async (courseData: CourseCreate): Promise<CourseResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const newCourse = await apiClient.courses.createCourses({
        courseCreate: courseData
      });
      
      // Update the courses list
      setCourses(prevCourses => [...prevCourses, newCourse]);
      return newCourse;
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient.courses]);

  // Update an existing course
  const updateCourse = useCallback(async (courseId: number, courseData: CourseUpdate): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.courses.updateCourse({
        courseId,
        courseUpdate: courseData
      });
      
      // Fetch the updated course
      const updatedCourse = await apiClient.courses.getCourse({ courseId });
      
      // Update the courses list
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.courseId === courseId 
            ? updatedCourse
            : course
        )
      );
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient.courses]);

  // Delete a course
  const deleteCourse = useCallback(async (courseId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.courses.deleteCourse({
        courseId
      });
      
      // Update the courses list
      setCourses(prevCourses => prevCourses.filter(course => course.courseId !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient.courses]);

  // Get a course by ID
  const getCourseById = useCallback((courseId: number): CourseResponse | undefined => {
    return courses.find(course => course.courseId === courseId);
  }, [courses]);

  // Initialize by fetching courses
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById
  };
}; 