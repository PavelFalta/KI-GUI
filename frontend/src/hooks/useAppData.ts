import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { useAuth } from '../context/AuthContext';
import { 
  CourseResponse, 
  TaskResponse, 
  TaskCompletionResponse,
  EnrollmentResponse,
  UserResponse
} from '../api/models';

// Combined result type for the unified data hook
interface UseAppDataResult {
  // Data states
  courses: CourseResponse[];
  tasks: TaskResponse[];
  taskCompletions: TaskCompletionResponse[];
  enrollments: EnrollmentResponse[];
  students: UserResponse[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Data fetch functions
  refreshAllData: () => Promise<void>;
  
  // Specialized functions
  getTasksByStatus: (status: 'notStarted' | 'pending' | 'completed') => any[];
  getTasksToReview: () => any[];
  completeTask: (taskId: number) => Promise<boolean>;
  approveTask: (taskCompletionId: number) => Promise<boolean>;
}

export const useAppData = (): UseAppDataResult => {
  const apiClient = useApiClient();
  const { user } = useAuth();
  
  // Data states
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletionResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [students, setStudents] = useState<UserResponse[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiClient.courses.getCourses();
      setCourses(data);
      return data;
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
      return [];
    }
  }, [apiClient.courses]);
  
  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      const data = await apiClient.tasks.getTasks();
      setTasks(data);
      return data;
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      return [];
    }
  }, [apiClient.tasks]);
  
  // Fetch all task completions
  const fetchTaskCompletions = useCallback(async () => {
    if (!user) return [];
    
    try {
      const data = await apiClient.taskCompletions.getTaskCompletions();
      setTaskCompletions(data);
      return data;
    } catch (err) {
      console.error('Error fetching task completions:', err);
      setError('Failed to load task completions');
      return [];
    }
  }, [apiClient.taskCompletions, user]);
  
  // Fetch all enrollments
  const fetchEnrollments = useCallback(async () => {
    try {
      const data = await apiClient.enrollments.getEnrollments();
      setEnrollments(data);
      return data;
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to load enrollments');
      return [];
    }
  }, [apiClient.enrollments]);
  
  // Fetch all students
  const fetchStudents = useCallback(async () => {
    try {
      const data = await apiClient.users.getUsers();
      const filteredStudents = data.filter(user => 
        user.role && typeof user.role === 'object' && 'name' in user.role && 
        user.role.name === 'student'
      );
      setStudents(filteredStudents);
      return filteredStudents;
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
      return [];
    }
  }, [apiClient.users]);
  
  // Fetch all data at once
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchCourses(),
        fetchTasks(),
        fetchTaskCompletions(),
        fetchEnrollments(),
        fetchStudents()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh application data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCourses, fetchTasks, fetchTaskCompletions, fetchEnrollments, fetchStudents]);
  
  // Initial data loading
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);
  
  // Get tasks based on their completion status
  const getTasksByStatus = useCallback((status: 'notStarted' | 'pending' | 'completed') => {
    if (!user) return [];
    
    // Get user enrollments
    const userEnrollments = enrollments.filter(e => e.studentId === user.userId);
    
    const result = [];
    
    for (const enrollment of userEnrollments) {
      const course = courses.find(c => c.courseId === enrollment.courseId);
      if (!course) continue;
      
      // Get tasks for this course
      const courseTasks = tasks.filter(t => t.courseId === course.courseId);
      
      for (const task of courseTasks) {
        // Find task completion status
        const completion = taskCompletions.find(tc => 
          tc.taskId === task.taskId && tc.enrollmentId === enrollment.enrollmentId
        );
        
        // Determine if this task matches the requested status
        let taskStatus = 'notStarted';
        if (completion) {
          taskStatus = completion.isActive ? 'completed' : 'pending';
        }
        
        if (taskStatus !== status) continue;
        
        // Get assigner info
        const assigner = students.find(s => s.userId === enrollment.assignerId);
        const assignerName = assigner ? `${assigner.firstName} ${assigner.lastName}` : 'Unknown';
        
        result.push({
          task,
          course,
          status: taskStatus,
          assignerId: enrollment.assignerId,
          assignerName,
          enrollmentId: enrollment.enrollmentId,
          taskCompletionId: completion?.taskCompletionId
        });
      }
    }
    
    return result;
  }, [user, enrollments, courses, tasks, taskCompletions, students]);
  
  // Get tasks that need review from the current user
  const getTasksToReview = useCallback(() => {
    if (!user) return [];
    
    const result = [];
    
    // Find task completions awaiting approval (isActive = false)
    for (const tc of taskCompletions) {
      if (tc.isActive) continue; // Skip already approved tasks
      
      // Get the corresponding enrollment to check if current user is the assigner
      const enrollment = enrollments.find(e => e.enrollmentId === tc.enrollmentId);
      if (!enrollment || enrollment.assignerId !== user.userId) continue;
      
      // Get the task and course details
      const task = tasks.find(t => t.taskId === tc.taskId);
      if (!task) continue;
      
      const course = courses.find(c => c.courseId === task.courseId);
      if (!course) continue;
      
      // Get student info
      const student = students.find(s => s.userId === enrollment.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
      
      result.push({
        task,
        course,
        status: 'pending',
        assignerName: studentName,
        taskCompletionId: tc.taskCompletionId,
        studentId: enrollment.studentId
      });
    }
    
    return result;
  }, [user, taskCompletions, enrollments, tasks, courses, students]);
  
  // Mark a task as complete
  const completeTask = useCallback(async (taskId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Find the task
      const task = tasks.find(t => t.taskId === taskId);
      if (!task || !task.courseId) return false;
      
      // Find the enrollment
      const enrollment = enrollments.find(e => 
        e.courseId === task.courseId && e.studentId === user.userId
      );
      if (!enrollment) return false;
      
      // Create task completion request
      await apiClient.taskCompletions.createTaskCompletion({
        taskCompletionCreate: {
          enrollmentId: enrollment.enrollmentId,
          taskId,
          isActive: false,
          completedAt: null
        }
      });
      
      // Refresh data
      await fetchTaskCompletions();
      return true;
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
      return false;
    }
  }, [user, tasks, enrollments, apiClient.taskCompletions, fetchTaskCompletions]);
  
  // Approve a task completion
  const approveTask = useCallback(async (taskCompletionId: number): Promise<boolean> => {
    try {
      // Find the existing task completion
      const completion = taskCompletions.find(tc => tc.taskCompletionId === taskCompletionId);
      if (!completion) return false;
      
      // Approve the task
      await apiClient.taskCompletions.updateTaskCompletion({
        taskCompletionId,
        taskCompletionCreate: {
          enrollmentId: completion.enrollmentId,
          taskId: completion.taskId,
          isActive: true,
          completedAt: new Date()
        }
      });
      
      // Refresh data
      await fetchTaskCompletions();
      return true;
    } catch (err) {
      console.error('Error approving task:', err);
      setError('Failed to approve task');
      return false;
    }
  }, [taskCompletions, apiClient.taskCompletions, fetchTaskCompletions]);
  
  return {
    // Data
    courses,
    tasks,
    taskCompletions,
    enrollments,
    students,
    
    // Status
    isLoading,
    error,
    
    // Actions
    refreshAllData,
    getTasksByStatus,
    getTasksToReview,
    completeTask,
    approveTask
  };
}; 