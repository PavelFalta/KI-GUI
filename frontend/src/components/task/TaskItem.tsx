import React from 'react';
import { TaskResponse, CourseResponse } from '../../api/models';

interface TaskItemProps {
  task: TaskResponse;
  course: CourseResponse;
  status: 'pending' | 'completed' | 'notStarted';
  assignerId?: number;
  assignerName?: string;
  onRequestApproval?: () => Promise<void>;
  onApprove?: () => Promise<void>;
  onComplete?: () => Promise<void>;
}

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-600';
  
  switch (status) {
    case 'notStarted':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-600';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    default:
      break;
  }
  
  const statusText = {
    notStarted: 'Not Started',
    pending: 'Pending Approval',
    completed: 'Completed'
  }[status] || status;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  );
};

const TaskItem = ({
  task,
  course,
  status,
  assignerId,
  assignerName,
  onRequestApproval,
  onApprove,
  onComplete
}: TaskItemProps) => {
  // Determine which action button to show based on status
  const renderActionButton = () => {
    if (status === 'notStarted' && onComplete) {
      return (
        <button
          onClick={onComplete}
          className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Mark Complete
        </button>
      );
    }
    
    if (status === 'pending' && onApprove) {
      return (
        <button
          onClick={onApprove}
          className="ml-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
        >
          Approve
        </button>
      );
    }
    
    return null;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-sm text-gray-500">Course: {course.title}</span>
            <StatusBadge status={status} />
          </div>
          {assignerName && (
            <div className="text-xs text-gray-500 mt-1">
              Assigned by: {assignerName}
            </div>
          )}
          {task.description && (
            <div className="text-sm text-gray-600 mt-2">{task.description}</div>
          )}
        </div>
        <div className="flex">
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 