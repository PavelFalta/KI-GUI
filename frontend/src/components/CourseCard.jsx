import React from 'react';

const CourseCard = ({ title, totalTasks, completedTasks, pendingApproval, taskLabels = [] }) => {
  const labels = taskLabels.length === totalTasks
    ? taskLabels
    : [...taskLabels, ...Array(Math.max(0, totalTasks - taskLabels.length)).fill("Additional Task")].slice(0, totalTasks);

  const progress = Math.round((completedTasks / totalTasks) * 100);

  const renderTaskIndicators = () => {
    const indicators = [];
    for (let i = 0; i < totalTasks; i++) {
      let className = "h-3 w-3 rounded-full mx-1";
      
      if (completedTasks === totalTasks && pendingApproval) {
        className += " bg-yellow-500 animate-pulse";
        indicators.push(
          <div 
            key={i} 
            className={className}
            style={{ animationDelay: `${i * 0.15}s` }}
          ></div>
        );
      } else if (i < completedTasks) {
        className += " bg-green-500";
        indicators.push(<div key={i} className={className}></div>);
      } else if (i === completedTasks) {
        className += " bg-blue-600 animate-pulse h-4 w-4";
        indicators.push(<div key={i} className={className}></div>);
      } else {
        className += " bg-gray-300 dark:bg-gray-600";
        indicators.push(<div key={i} className={className}></div>);
      }
    }
    return indicators;
  };

  const renderTaskLabels = () => {
    return labels.map((task, index) => {
      let className = "text-sm py-1";
      
      if (index < completedTasks) {
        className += " text-gray-400 dark:text-gray-500 line-through";
      } else if (index === completedTasks) {
        className += " text-green-600 dark:text-green-400 font-semibold text-base";
      } else {
        className += " text-gray-400 dark:text-gray-500";
      }
      
      return (
        <div key={index} className={className}>
          {index + 1}. {task}
        </div>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition transform relative">
      {completedTasks === totalTasks && pendingApproval && (
        <div className="absolute top-2 right-2">
          <span className="bg-yellow-100 text-yellow-600 text-xs font-medium px-2 py-1 rounded-md dark:bg-yellow-900 dark:text-yellow-300 animate-pulse">
            Pending Approval
          </span>
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-3">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-center my-3">
        {renderTaskIndicators()}
      </div>
      
      <div className="mt-4 mb-2">
        {renderTaskLabels()}
      </div>
      
      <div className="text-right mt-2">
        <span className="text-gray-600 dark:text-gray-300 text-sm">
          {completedTasks} of {totalTasks} tasks
        </span>
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
          {progress}%
        </span>
      </div>
    </div>
  );
};

export default CourseCard;
