import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  linkTo: string;
}

const DashboardCard = ({ title, description, icon, linkTo }: DashboardCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative"
      onClick={() => navigate(linkTo)}
      style={{ cursor: 'pointer' }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const DashboardPage = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <motion.h1 
        className="text-3xl font-bold text-gray-900 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard
      </motion.h1>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <DashboardCard 
          title="My Tasks" 
          description="View, complete, and approve tasks" 
          icon="✅" 
          linkTo="/tasks"
        />
        <DashboardCard 
          title="Course Management" 
          description="Create and manage courses with tasks" 
          icon="📋" 
          linkTo="/course-management"
        />
        <DashboardCard 
          title="Course Assignment" 
          description="Assign courses to students" 
          icon="🎓" 
          linkTo="/course-assignment"
        />
      </motion.div>
    </div>
  );
};

export default DashboardPage; 