import { useState } from 'react';
import { useAppData } from '../../hooks';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TaskList from '../../components/task/TaskList';

type TabType = 'assignedTasks' | 'pendingApprovals' | 'completedTasks' | 'approvalsToReview';

// Tab configuration
const TABS: {id: TabType, label: string}[] = [
  { id: 'assignedTasks', label: 'Assigned Tasks' },
  { id: 'pendingApprovals', label: 'Pending Approval' },
  { id: 'completedTasks', label: 'Completed' },
  { id: 'approvalsToReview', label: 'Approvals to Review' }
];

// Tab empty state messages
const EMPTY_MESSAGES = {
  assignedTasks: 'You have no assigned tasks to complete.',
  pendingApprovals: 'You have no tasks waiting for approval.',
  completedTasks: 'You have not completed any tasks yet.',
  approvalsToReview: 'You have no pending task approvals to review.'
};

const TaskManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('assignedTasks');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Use the unified data hook
  const { 
    isLoading, 
    error, 
    getTasksByStatus,
    getTasksToReview,
    completeTask,
    approveTask
  } = useAppData();

  // Show success message and clear after delay
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  // Handle task completion
  const handleCompleteTask = async (taskId: number) => {
    const success = await completeTask(taskId);
    showSuccessMessage(success 
      ? 'Task marked as completed and sent for approval' 
      : 'Failed to complete task. Please try again.');
  };

  // Handle task approval
  const handleApproveTask = async (taskId: number) => {
    const success = await approveTask(taskId);
    showSuccessMessage(success 
      ? 'Task approved successfully' 
      : 'Failed to approve task. Please try again.');
  };

  // Get tasks to display based on active tab
  const getTasksForTab = () => {
    switch (activeTab) {
      case 'assignedTasks': 
        return getTasksByStatus('notStarted');
      case 'pendingApprovals': 
        return getTasksByStatus('pending');
      case 'completedTasks': 
        return getTasksByStatus('completed');
      case 'approvalsToReview': 
        return getTasksToReview();
      default:
        return [];
    }
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Task Management</h1>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{successMessage}</div>
      )}
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-4 md:space-x-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`py-2 px-1 font-medium text-sm border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Task List */}
      <TaskList
        tasks={getTasksForTab()}
        title={TABS.find(t => t.id === activeTab)?.label || ''}
        emptyMessage={EMPTY_MESSAGES[activeTab]}
        onComplete={activeTab === 'assignedTasks' ? handleCompleteTask : undefined}
        onApprove={activeTab === 'approvalsToReview' ? handleApproveTask : undefined}
      />
    </div>
  );
};

export default TaskManagementPage; 