import React, { useState, useEffect, useCallback } from 'react';
import { useTaskCompletions } from '../../hooks/useTaskCompletions';
import { useEnrollments } from '../../hooks/useEnrollments';
import { useCourses } from '../../hooks/useCourses';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../hooks/useStudents';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TaskList from '../../components/task/TaskList';
import { motion } from 'framer-motion';
import { TaskResponse, CourseResponse } from '../../api/models';

// Define interface for task items with status
interface TaskItem {
  task: TaskResponse;
  course: CourseResponse;
  status: 'pending' | 'completed' | 'notStarted';
  assignerId?: number;
  assignerName?: string;
  enrollmentId?: number;
  taskCompletionId?: number;
}

const TaskManagementPage = () => {
  const [activeTab, setActiveTab] = useState<'assignedTasks' | 'pendingApprovals' | 'completedTasks' | 'approvalsToReview'>('assignedTasks');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Get data from hooks
  const { 
    taskCompletions,
    loading: loadingTaskCompletions,
    error: taskCompletionsError,
    fetchUserTaskCompletions,
    requestTaskApproval,
    approveTask,
    getPendingApprovalsByAssigner
  } = useTaskCompletions();
  
  const {
    enrollments,
    loading: loadingEnrollments,
    error: enrollmentsError,
    fetchEnrollments
  } = useEnrollments();
  
  const {
    courses,
    loading: loadingCourses,
    fetchCourses
  } = useCourses();
  
  const {
    tasks,
    loading: loadingTasks,
    fetchTasks
  } = useTasks();
  
  const { user } = useAuth();
  const { students, fetchStudents } = useStudents();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchUserTaskCompletions();
    fetchEnrollments();
    fetchCourses();
    fetchTasks();
    fetchStudents();
  }, [fetchUserTaskCompletions, fetchEnrollments, fetchCourses, fetchTasks, fetchStudents]);

  // Check if data is loading
  const isLoading = loadingTaskCompletions || loadingEnrollments || loadingCourses || loadingTasks;
  const hasErrors = taskCompletionsError || enrollmentsError;
  
  // Handle task approval
  const handleApproveTask = async (taskId: number) => {
    try {
      // Find the task completion record by task ID
      const taskCompletion = taskCompletions.find(tc => 
        tc.taskId === taskId && tc.isActive === false
      );
      
      if (!taskCompletion) {
        throw new Error('Task completion not found');
      }
      
      await approveTask(taskCompletion.taskCompletionId);
      setSuccessMessage('Task approved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchUserTaskCompletions();
    } catch (error) {
      console.error('Error approving task:', error);
      setSuccessMessage('Failed to approve task. Please try again.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Handle completing a task directly
  const handleCompleteTask = async (taskId: number) => {
    try {
      // Find an enrollment for this task
      const task = tasks.find(t => t.taskId === taskId);
      if (!task || !task.courseId) {
        throw new Error('Task or course not found');
      }
      
      // Find an enrollment for this course
      const enrollment = enrollments.find(e => e.courseId === task.courseId && e.studentId === user?.userId);
      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }
      
      // Request approval for this task
      await requestTaskApproval(enrollment.enrollmentId, taskId);
      setSuccessMessage('Task marked as completed and sent for approval');
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchUserTaskCompletions();
    } catch (error) {
      console.error('Error completing task:', error);
      setSuccessMessage('Failed to complete task. Please try again.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  // Get student tasks that are not started or pending approval
  const getStudentTasks = useCallback((): TaskItem[] => {
    if (!user) return [];
    
    // Get enrollments for the current user as a student
    const studentEnrollments = enrollments.filter(e => e.studentId === user.userId);
    
    // Create a list of all tasks from these enrollments
    const studentTasks: TaskItem[] = [];
    
    studentEnrollments.forEach(enrollment => {
      // Get the course for this enrollment
      const course = courses.find(c => c.courseId === enrollment.courseId);
      if (!course) return;
      
      // Get tasks for this course
      const courseTasks = tasks.filter(t => t.courseId === course.courseId);
      
      // For each task, create a task item with appropriate status
      courseTasks.forEach(task => {
        // Check if this task already has a completion record
        const completion = taskCompletions.find(tc => 
          tc.taskId === task.taskId && 
          tc.enrollmentId === enrollment.enrollmentId
        );
        
        const assigner = students.find(s => s.userId === enrollment.assignerId);
        const assignerName = assigner ? `${assigner.firstName} ${assigner.lastName}` : 'Unknown';
        
        if (completion) {
          // Task is either pending or completed
          studentTasks.push({
            task,
            course,
            status: completion.isActive ? 'completed' : 'pending',
            assignerId: enrollment.assignerId,
            assignerName,
            enrollmentId: enrollment.enrollmentId
          });
        } else {
          // Task is not started
          studentTasks.push({
            task,
            course,
            status: 'notStarted',
            assignerId: enrollment.assignerId,
            assignerName,
            enrollmentId: enrollment.enrollmentId
          });
        }
      });
    });
    
    return studentTasks;
  }, [courses, enrollments, taskCompletions, tasks, user, students]);
  
  // Get tasks pending approval by the current user
  const getTasksToReview = useCallback((): TaskItem[] => {
    if (!user) return [];
    
    const pendingApprovals = getPendingApprovalsByAssigner();
    if (!pendingApprovals) return [];
    
    return pendingApprovals
      .filter(approval => {
        const task = tasks.find(t => t.taskId === approval.taskId);
        const course = task ? courses.find(c => c.courseId === task.courseId) : null;
        return !!task && !!course;
      })
      .map(approval => {
        const task = tasks.find(t => t.taskId === approval.taskId)!;
        const course = courses.find(c => c.courseId === task.courseId)!;
        const student = students.find(s => s.userId === approval.studentId);
        
        return {
          task,
          course,
          status: 'pending',
          assignerName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
          taskCompletionId: approval.taskCompletionId
        };
      });
  }, [courses, getPendingApprovalsByAssigner, students, tasks, user]);
  
  // Get not started tasks
  const getNotStartedTasks = useCallback((): TaskItem[] => {
    return getStudentTasks().filter(task => task.status === 'notStarted');
  }, [getStudentTasks]);
  
  // Get tasks pending approval (by others)
  const getPendingApprovalTasks = useCallback((): TaskItem[] => {
    return getStudentTasks().filter(task => task.status === 'pending');
  }, [getStudentTasks]);
  
  // Get completed tasks
  const getCompletedTasks = useCallback((): TaskItem[] => {
    return getStudentTasks().filter(task => task.status === 'completed');
  }, [getStudentTasks]);

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Show error message if there was an error
  if (hasErrors) {
    return (
      <div className="text-center p-8 text-red-600">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="mb-4">
          There was an error loading the task data. Please try refreshing the page.
        </p>
        <button
          onClick={() => {
            fetchUserTaskCompletions();
            fetchEnrollments();
            fetchCourses();
            fetchTasks();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <motion.h1 
        className="text-3xl font-bold text-gray-900 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Task Management
      </motion.h1>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
          {successMessage}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('assignedTasks')}
            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'assignedTasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assigned Tasks
          </button>
          <button
            onClick={() => setActiveTab('pendingApprovals')}
            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'pendingApprovals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Approvals
          </button>
          <button
            onClick={() => setActiveTab('completedTasks')}
            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'completedTasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed Tasks
          </button>
          <button
            onClick={() => setActiveTab('approvalsToReview')}
            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'approvalsToReview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Approvals to Review
            {getTasksToReview().length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                {getTasksToReview().length}
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'assignedTasks' && (
          <TaskList
            tasks={getNotStartedTasks()}
            title="Assigned Tasks"
            emptyMessage="You don't have any assigned tasks to complete."
            onComplete={handleCompleteTask}
          />
        )}
        
        {activeTab === 'pendingApprovals' && (
          <TaskList
            tasks={getPendingApprovalTasks()}
            title="Tasks Pending Approval"
            emptyMessage="You don't have any tasks pending approval."
          />
        )}
        
        {activeTab === 'completedTasks' && (
          <TaskList
            tasks={getCompletedTasks()}
            title="Completed Tasks"
            emptyMessage="You haven't completed any tasks yet."
          />
        )}
        
        {activeTab === 'approvalsToReview' && (
          <TaskList
            tasks={getTasksToReview()}
            title="Tasks to Review and Approve"
            emptyMessage="You don't have any tasks to review and approve."
            onApprove={handleApproveTask}
          />
        )}
      </div>
    </div>
  );
};

export default TaskManagementPage; 