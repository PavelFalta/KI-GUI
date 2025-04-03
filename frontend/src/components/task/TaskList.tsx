import React from 'react';
import TaskItem from './TaskItem';
import { TaskResponse, CourseResponse } from '../../api/models';

interface TaskItem {
  task: TaskResponse;
  course: CourseResponse;
  status: 'pending' | 'completed' | 'notStarted';
  assignerId?: number;
  assignerName?: string;
}

interface TaskListProps {
  tasks: TaskItem[];
  title: string;
  emptyMessage: string;
  onRequestApproval?: (taskId: number) => Promise<void>;
  onApprove?: (taskId: number) => Promise<void>;
  onComplete?: (taskId: number) => Promise<void>;
}

const TaskList = ({
  tasks,
  title,
  emptyMessage,
  onRequestApproval,
  onApprove,
  onComplete
}: TaskListProps) => {
  // Determine if the list is empty
  const isEmpty = tasks.length === 0;
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      
      {isEmpty ? (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div>
          {tasks.map((taskItem, index) => (
            <TaskItem
              key={`${taskItem.task.taskId}-${index}`}
              task={taskItem.task}
              course={taskItem.course}
              status={taskItem.status}
              assignerId={taskItem.assignerId}
              assignerName={taskItem.assignerName}
              onRequestApproval={
                onRequestApproval ? () => onRequestApproval(taskItem.task.taskId) : undefined
              }
              onApprove={
                onApprove ? () => onApprove(taskItem.task.taskId) : undefined
              }
              onComplete={
                onComplete ? () => onComplete(taskItem.task.taskId) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList; 