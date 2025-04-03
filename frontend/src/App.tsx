import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Layout components
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Page components
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import { NotFoundPage, UnauthorizedPage } from './pages/ErrorPages';
import CourseManagementPage from './pages/course/CourseManagementPage';
import CourseAssignmentPage from './pages/course/CourseAssignmentPage';
import TaskManagementPage from './pages/task/TaskManagementPage';

// Define a home route to redirect to dashboard
const HomeRoute = () => <Navigate to="/dashboard" replace />;

// Wrap page content with transition animation
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

// Main App component with routes
function App() {
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          } />
          <Route path="/signup" element={
            <PageTransition>
              <SignUpPage />
            </PageTransition>
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <HomeRoute />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <TaskManagementPage />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/course-management" element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <CourseManagementPage />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/course-assignment" element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <CourseAssignmentPage />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Error routes */}
          <Route path="/unauthorized" element={
            <PageTransition>
              <UnauthorizedPage />
            </PageTransition>
          } />
          
          <Route path="*" element={
            <PageTransition>
              <NotFoundPage />
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
