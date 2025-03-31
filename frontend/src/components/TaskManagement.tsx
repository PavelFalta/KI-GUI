import React, { useState, useEffect, useCallback } from 'react';
import { useTaskCompletions } from '../hooks/useTaskCompletions';
import { useEnrollments } from '../hooks/useEnrollments';
import { useCourses } from '../hooks/useCourses';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../hooks/useStudents';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { TaskResponse, CourseResponse } from '../api/models';
import { motion, AnimatePresence } from 'framer-motion';

// Define interfaces for task items with status
interface TaskItem {
  task: TaskResponse;
  course: CourseResponse;
  status: 'pending' | 'completed' | 'notStarted';
  assignerId?: number;
  assignerName?: string;
}

const TaskManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignedTasks' | 'pendingApprovals' | 'completedTasks' | 'approvalsToReview'>('assignedTasks');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [completeTaskId, setCompleteTaskId] = useState<number | null>(null);

  const { 
    taskCompletions,
    loading: loadingTaskCompletions,
    error: taskCompletionsError,
    fetchUserTaskCompletions,
    requestTaskApproval,
    approveTask,
    getPendingApprovalsByAssigner,
    getPendingApprovalsByStudent
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
  const { students } = useStudents();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchUserTaskCompletions();
    fetchEnrollments();
    fetchCourses();
    fetchTasks();
  }, [fetchUserTaskCompletions, fetchEnrollments, fetchCourses, fetchTasks]);

  const loading = loadingTaskCompletions || loadingEnrollments || loadingCourses || loadingTasks;
  
  // Handle task approval request
  const handleRequestApproval = async (enrollmentId: number, taskId: number) => {
    try {
      await requestTaskApproval(enrollmentId, taskId);
      setSuccessMessage('Task approval requested successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error requesting task approval:', error);
      alert('Failed to request task approval. Please try again.');
    }
  };
  
  // Handle task approval
  const handleApproveTask = async (taskCompletionId: number) => {
    try {
      await approveTask(taskCompletionId);
      setSuccessMessage('Task approved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error approving task:', error);
      alert('Failed to approve task. Please try again.');
    }
  };

  // Handle completing a task directly (from Tasks component)
  const handleCompleteTask = async (taskId: number) => {
    setCompleteTaskId(taskId);
    
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
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    } finally {
      setCompleteTaskId(null);
    }
  };
  
  // Get task title by ID
  const getTaskTitle = (taskId: number): string => {
    const task = tasks.find(t => t.taskId === taskId);
    return task?.title || 'Unknown Task';
  };
  
  // Get course title by ID
  const getCourseTitle = (courseId: number | undefined): string => {
    if (!courseId) return 'No Course';
    const course = courses.find(c => c.courseId === courseId);
    return course?.title || 'Unknown Course';
  };
  
  // Get student's active tasks based on enrollments
  const getStudentActiveTasks = () => {
    if (!user) return [];
    
    // Get enrollments for the current user as a student
    const studentEnrollments = enrollments.filter(e => e.studentId === user.userId);
    
    // Create a list of available tasks from these enrollments
    const availableTasks: { enrollmentId: number; taskId: number; taskTitle: string; courseTitle: string }[] = [];
    
    studentEnrollments.forEach(enrollment => {
      // Get the course for this enrollment
      const course = courses.find(c => c.courseId === enrollment.courseId);
      if (!course || !course.title) return;
      
      // Get tasks for this course
      const courseTasks = tasks.filter(t => t.courseId === course.courseId);
      
      // For each task, check if it's already completed or approval requested
      courseTasks.forEach(task => {
        // Check if this task already has a completion record
        const isCompletionRequested = taskCompletions.some(tc => 
          tc.enrollmentId === enrollment.enrollmentId && 
          tc.taskId === task.taskId
        );
        
        // If no completion record exists, add to available tasks
        if (!isCompletionRequested && task.title) {
          availableTasks.push({
            enrollmentId: enrollment.enrollmentId,
            taskId: task.taskId,
            taskTitle: task.title,
            courseTitle: course.title
          });
        }
      });
    });
    
    return availableTasks;
  };

  // Get all the user's assigned tasks
  const getUserAssignedTasks = (): TaskItem[] => {
    if (!user) return [];
    
    // Get tasks assigned to the user through enrollments
    const userEnrollments = enrollments.filter(e => e.studentId === user.userId && e.isActive !== false);
    const assignedTasks: TaskItem[] = [];
    
    userEnrollments.forEach(enrollment => {
      const course = courses.find(c => c.courseId === enrollment.courseId && c.isActive !== false);
      if (!course) return;
      
      // Get assigner name
      const assignerId = enrollment.assignerId;
      const assigner = students.find(s => s.userId === assignerId);
      const assignerName = assigner ? `${assigner.firstName} ${assigner.lastName}` : 'Unknown';
      
      // Get tasks for this course
      const courseTasks = tasks.filter(t => t.courseId === course.courseId && t.isActive !== false);
      
      courseTasks.forEach(task => {
        // Check status from task completions
        const completion = taskCompletions.find(tc => 
          tc.taskId === task.taskId && 
          tc.enrollmentId === enrollment.enrollmentId
        );
        
        let status: 'pending' | 'completed' | 'notStarted' = 'notStarted';
        if (completion) {
          status = completion.isActive ? 'completed' : 'pending';
        }
        
        assignedTasks.push({
          task,
          course,
          status,
          assignerId,
          assignerName
        });
      });
    });
    
    return assignedTasks;
  };

  // Filter tasks by status
  const assignedTasks = getUserAssignedTasks();
  const notStartedTasks = assignedTasks.filter(item => item.status === 'notStarted');
  const pendingTasks = assignedTasks.filter(item => item.status === 'pending');
  const completedTasks = assignedTasks.filter(item => item.status === 'completed');
  
  // Get tasks pending approval for the current student
  const studentPendingApprovals = getPendingApprovalsByStudent();
  
  // Get tasks pending approval by the current user as an assigner
  const assignerPendingApprovals = getPendingApprovalsByAssigner();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading task information...</p>
      </div>
    );
  }
  
  if (taskCompletionsError || enrollmentsError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
        <p className="text-red-700">{taskCompletionsError || enrollmentsError}</p>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Task Management</h1>
      <p className="text-lg text-gray-700 mb-8">View, complete, and approve tasks</p>
      
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 flex items-center"
          >
            <div className="text-green-500 mr-3">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-700">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modern Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'assignedTasks'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('assignedTasks')}
        >
          <div className="flex items-center justify-center">
            <span>Assigned Tasks</span>
            {notStartedTasks.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {notStartedTasks.length}
              </span>
            )}
          </div>
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'pendingApprovals'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('pendingApprovals')}
        >
          <div className="flex items-center justify-center">
            <span>Pending</span>
            {pendingTasks.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {pendingTasks.length}
              </span>
            )}
          </div>
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'completedTasks'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('completedTasks')}
        >
          <div className="flex items-center justify-center">
            <span>Completed</span>
            {completedTasks.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                {completedTasks.length}
              </span>
            )}
          </div>
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'approvalsToReview'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('approvalsToReview')}
        >
          <div className="flex items-center justify-center">
            <span>To Review</span>
            {assignerPendingApprovals.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                {assignerPendingApprovals.length}
              </span>
            )}
          </div>
        </button>
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'assignedTasks' && (
          <motion.div
            key="assignedTasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {notStartedTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">All Caught Up!</h3>
                <p className="text-gray-500">You have no pending tasks to complete.</p>
              </div>
            ) : (
              Object.values(
                notStartedTasks.reduce((acc, item) => {
                  const courseId = item.course.courseId;
                  if (!acc[courseId]) {
                    acc[courseId] = {
                      course: item.course,
                      tasks: []
                    };
                  }
                  acc[courseId].tasks.push(item);
                  return acc;
                }, {} as Record<number, { course: CourseResponse; tasks: typeof notStartedTasks }>)
              ).map((group) => (
                <motion.div
                  key={group.course.courseId}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                    <h2 className="text-xl font-semibold text-blue-900">{group.course.title}</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {group.tasks.map((item) => (
                      <div key={item.task.taskId} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-grow">
                            <h3 className="text-lg font-medium text-gray-900">{item.task.title}</h3>
                            {item.task.description && (
                              <p className="mt-1 text-gray-600">{item.task.description}</p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">Assigned by {item.assignerName}</p>
                          </div>
                          <div className="mt-4 md:mt-0 md:ml-6">
                            <button
                              onClick={() => handleCompleteTask(item.task.taskId)}
                              disabled={completeTaskId === item.task.taskId}
                              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                            >
                              {completeTaskId === item.task.taskId ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                'Complete Task'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        
        {activeTab === 'pendingApprovals' && (
          <motion.div
            key="pendingApprovals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {pendingTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Approvals</h3>
                <p className="text-gray-500">All your completed tasks have been approved.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {pendingTasks.map((item) => (
                    <div key={item.task.taskId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">{item.task.title}</h3>
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Awaiting Approval
                            </span>
                          </div>
                          {item.task.description && (
                            <p className="mt-1 text-gray-600">{item.task.description}</p>
                          )}
                          <p className="mt-2 text-sm text-gray-500">
                            From course: {item.course.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'completedTasks' && (
          <motion.div
            key="completedTasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {completedTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Completed Tasks Yet</h3>
                <p className="text-gray-500">Complete some tasks to see them here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {completedTasks.map((item) => {
                    const completion = taskCompletions.find(tc => 
                      tc.taskId === item.task.taskId && 
                      tc.isActive === true
                    );
                    
                    return (
                      <div key={item.task.taskId} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{item.task.title}</h3>
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </div>
                            {item.task.description && (
                              <p className="mt-1 text-gray-600">{item.task.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                              <span>Course: {item.course.title}</span>
                              {completion?.completedAt && (
                                <>
                                  <span>•</span>
                                  <span>Completed on {new Date(completion.completedAt).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'approvalsToReview' && (
          <motion.div
            key="approvalsToReview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {assignerPendingApprovals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-4xl mb-3">👍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Tasks to Review</h3>
                <p className="text-gray-500">You have no pending tasks to approve.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {assignerPendingApprovals.map((approval) => {
                    const task = tasks.find(t => t.taskId === approval.taskId);
                    const enrollment = enrollments.find(e => e.enrollmentId === approval.enrollmentId);
                    const course = enrollment ? courses.find(c => c.courseId === enrollment.courseId) : null;
                    
                    return (
                      <div key={approval.taskCompletionId} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{task?.title}</h3>
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Needs Review
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                              <span>Student: {approval.studentName}</span>
                              <span>•</span>
                              <span>Course: {course?.title}</span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 md:ml-6">
                            <button
                              onClick={() => handleApproveTask(approval.taskCompletionId)}
                              disabled={loadingTaskCompletions}
                              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                            >
                              {loadingTaskCompletions ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                'Approve Task'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagement; 