import React from 'react';
import CourseCard from './CourseCard';
import { motion } from 'framer-motion';

const Dashboard = ({ user, onLogout }) => {

const coursesData = [
    { 
        title: 'Medical Ethics 101', 
        totalTasks: 10, 
        completedTasks: 8, 
        pendingApproval: false ,
        taskLabels: [
            'Introduction to Medical Ethics',
            'The Hippocratic Oath',
            'The Nuremberg Code',
            'The Declaration of Geneva',
            'The Belmont Report',
            'The Helsinki Declaration',
            'The Declaration of Istanbul',
            'The Declaration of Taipei',
            'The Declaration of Sydney',
            'The Declaration of Montreal'
        ]
    },
    { 
        title: 'Anatomy & Physiology', 
        totalTasks: 8, 
        completedTasks: 8, 
        pendingApproval: true,
        taskLabels: [
            'Introduction to Anatomy',
            'The Skeletal System',
            'The Muscular System',
            'The Nervous System',
            'The Cardiovascular System',
            'The Respiratory System',
            'The Digestive System',
            'The Endocrine System'
        ]
    },
    { 
        title: 'Clinical Diagnosis', 
        totalTasks: 12, 
        completedTasks: 5, 
        pendingApproval: false ,
        taskLabels: [
            'Introduction to Clinical Diagnosis',
            'The Diagnostic Process',
            'The Medical History',
            'The Physical Examination',
            'The Differential Diagnosis',
            'The Diagnostic Tests',
            'The Diagnostic Imaging',
            'The Laboratory Tests',
            'The Biopsy',
            'The Endoscopy',
            'The Electrocardiogram',
            'The Ultrasound'
        ]
    },
];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-100 dark:bg-gray-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.header 
        className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center"
        variants={itemVariants}
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard - Welcome, {user.username}
        </h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
        >
          Logout
        </button>
      </motion.header>
      <motion.main 
        className="container mx-auto p-6"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Your Courses
        </h2>
        <motion.div 
          className="grid gap-4 md:grid-cols-3"
          variants={itemVariants}
        >
          {coursesData.map((course, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <CourseCard {...course} />
            </motion.div>
          ))}
        </motion.div>
      </motion.main>
    </motion.div>
  );
};

export default Dashboard;
