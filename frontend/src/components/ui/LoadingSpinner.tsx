import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  fullScreen = false 
}) => {
  // Define sizes
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  // Define colors
  const spinnerColors = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  // Animation variants for the spinner
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // Animation variants for the dots
  const dotVariants = {
    initial: { scale: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.2
      }
    })
  };

  // Choose spinner type based on fullScreen
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            className={`inline-block ${spinnerSizes[size]} ${spinnerColors[color]}`}
            animate="animate"
            variants={spinnerVariants}
          >
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <motion.path
                d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                fill="currentColor"
                opacity="0.25"
              />
              <motion.path
                d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>
          <div className="mt-4 flex space-x-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                className={`h-2 w-2 rounded-full bg-blue-500`}
              />
            ))}
          </div>
          <motion.p 
            className="mt-4 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading...
          </motion.p>
        </div>
      </div>
    );
  }

  // Regular spinner for in-content loading
  return (
    <motion.div
      className={`inline-block ${spinnerSizes[size]} ${spinnerColors[color]}`}
      animate="animate"
      variants={spinnerVariants}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <motion.path
          d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
          fill="currentColor"
          opacity="0.25"
        />
        <motion.path
          d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
          fill="currentColor"
        />
      </svg>
    </motion.div>
  );
};

export default LoadingSpinner; 