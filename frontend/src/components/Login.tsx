import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white dark:bg-gray-800 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <motion.h2 
            className="text-4xl font-bold mb-6 text-gray-800 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Welcome Back
          </motion.h2>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800 dark:text-white"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800 dark:text-white"
                placeholder="Enter your password"
                required
              />
            </div>
            <motion.button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors duration-300"
              whileHover={{ backgroundColor: "#2563EB" }}
              whileTap={{ scale: 0.99 }}
            >
              Log In
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
      <motion.div 
        className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 m-8 bg-white dark:bg-gray-700 rounded-lg shadow-2xl opacity-20"></div>
        <motion.div 
          className="z-10 text-white text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Welcome to DocLearn
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
