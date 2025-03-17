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
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 ${
                activeTab === 'assignedTasks'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assignedTasks')}
            >
              Assigned Tasks
              {notStartedTasks.length > 0 && (
                <motion.span 
                  className="ml-2 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  {notStartedTasks.length}
                </motion.span>
              )}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 ${
                activeTab === 'pendingApprovals'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('pendingApprovals')}
            >
              Pending Approvals
              {pendingTasks.length > 0 && (
                <motion.span 
                  className="ml-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  {pendingTasks.length}
                </motion.span>
              )}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 ${
                activeTab === 'completedTasks'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('completedTasks')}
            >
              Completed Tasks
              {completedTasks.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">
                  {completedTasks.length}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              className={`inline-block py-2 px-4 ${
                activeTab === 'approvalsToReview'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('approvalsToReview')}
            >
              Approvals to Review
              {assignerPendingApprovals.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">
                  {assignerPendingApprovals.length}
                </span>
              )}
            </button>
          </li>
        </ul>
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
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <h3 className="text-lg font-semibold mb-4">Tasks Assigned to You</h3>
              {notStartedTasks.length > 0 ? (
                <div className="space-y-6">
                  {/* Group tasks by course */}
                  {(() => {
                    // Group tasks by courseId
                    const tasksByCoursesMap = notStartedTasks.reduce((acc, item) => {
                      const courseId = item.course.courseId;
                      if (!acc[courseId]) {
                        acc[courseId] = {
                          course: item.course,
                          tasks: []
                        };
                      }
                      acc[courseId].tasks.push(item);
                      return acc;
                    }, {} as Record<number, { course: CourseResponse, tasks: typeof notStartedTasks }>);

                    // Convert the map to an array for rendering
                    return Object.values(tasksByCoursesMap).map((group) => (
                      <div key={group.course.courseId} className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                          <h2 className="text-xl font-semibold text-blue-800">{group.course.title}</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {group.tasks.map((item, index) => (
                            <div key={`${item.task.taskId}-${index}`} className="px-6 py-4 hover:bg-gray-50">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-800">{item.task.title || "Untitled Task"}</h3>
                                  <p className="mt-1 text-sm text-gray-600">{item.task.description || "No description provided."}</p>
                                  <p className="mt-1 text-xs text-gray-500">Assigned by: {item.assignerName}</p>
                                </div>
                                <div className="mt-3 md:mt-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteTask(item.task.taskId);
                                    }}
                                    disabled={completeTaskId === item.task.taskId}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                                      'Mark as Complete'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-gray-500">No active tasks assigned to you.</p>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'pendingApprovals' && (
          <motion.div
            key="pendingApprovals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <h3 className="text-lg font-semibold mb-4">Your Submitted Tasks Awaiting Approval</h3>
              {pendingTasks.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {pendingTasks.map((item, index) => (
                      <div key={`${item.task.taskId}-${index}`} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{item.task.title || "Untitled Task"}</h3>
                            <div className="mt-1 flex flex-col md:flex-row md:items-center text-sm text-gray-500">
                              <span className="mr-2">Course: {item.course.title}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{item.task.description || "No description provided."}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No tasks pending approval.</p>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'completedTasks' && (
          <motion.div
            key="completedTasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <h3 className="text-lg font-semibold mb-4">Your Completed Tasks</h3>
              {completedTasks.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {completedTasks.map((item, index) => {
                      // Find the task completion to get the completion date
                      const completion = taskCompletions.find(tc => 
                        tc.taskId === item.task.taskId && 
                        tc.isActive === true
                      );
                      
                      return (
                        <div key={`${item.task.taskId}-${index}`} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-800">{item.task.title || "Untitled Task"}</h3>
                              <div className="mt-1 flex flex-col md:flex-row md:items-center text-sm text-gray-500">
                                <span className="mr-2">Course: {item.course.title}</span>
                                {completion?.completedAt && (
                                  <>
                                    <span className="mr-2 text-gray-400">•</span>
                                    <span>Completed: {new Date(completion.completedAt).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-gray-600">{item.task.description || "No description provided."}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No completed tasks yet.</p>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'approvalsToReview' && (
          <motion.div
            key="approvalsToReview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Tasks Awaiting Your Approval</h3>
              {assignerPendingApprovals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Student</th>
                        <th className="py-2 px-4 text-left">Task</th>
                        <th className="py-2 px-4 text-left">Course</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignerPendingApprovals.map((approval, index) => {
                        const task = tasks.find(t => t.taskId === approval.taskId);
                        const enrollment = enrollments.find(e => e.enrollmentId === approval.enrollmentId);
                        const course = enrollment ? courses.find(c => c.courseId === enrollment.courseId) : null;
                        
                        return (
                          <tr key={approval.taskCompletionId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-4">{approval.studentName || 'Unknown Student'}</td>
                            <td className="py-2 px-4">{task?.title || 'Unknown Task'}</td>
                            <td className="py-2 px-4">{course?.title || 'Unknown Course'}</td>
                            <td className="py-2 px-4">
                              <button
                                onClick={() => handleApproveTask(approval.taskCompletionId)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                disabled={loadingTaskCompletions}
                              >
                                {loadingTaskCompletions ? 'Processing...' : 'Approve'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No tasks waiting for your approval.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagement; 