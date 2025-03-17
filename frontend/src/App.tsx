import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'; // Ensure Tailwind is imported

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import Unauthorized from './components/Unauthorized';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <div className="flex flex-col items-center justify-center py-12">
                    <h1 className="text-3xl font-bold mt-4">KI-GUI Application</h1>
                    <div className="p-6 bg-white shadow-lg rounded-lg mt-4 max-w-md">
                      <h2 className="text-xl font-semibold mb-4">Welcome to KI-GUI</h2>
                      <p className="text-gray-700 mb-4">
                        This application provides a platform for managing courses, tasks, and user enrollments.
                      </p>
                      <p className="text-gray-700">
                        Please sign in to access the full features of the application.
                      </p>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
