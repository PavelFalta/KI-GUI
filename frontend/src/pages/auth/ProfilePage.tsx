import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApiClient } from '../../hooks/useApiClient';
import { useCourses } from '../../hooks/useCourses';
import { useEnrollments } from '../../hooks/useEnrollments';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { UserResponse, CourseResponse, UserUpdate } from '../../api/models';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePageProps {
  viewMode?: boolean;
}

const ProfilePage = ({ viewMode = false }: ProfilePageProps) => {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'courses'
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  const apiClient = useApiClient();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  
  // Use courses and enrollments hooks to fetch data
  const { courses, loading: loadingCourses, error: coursesError, fetchCourses } = useCourses();
  const { enrollments, loading: loadingEnrollments, error: enrollmentsError, fetchEnrollments } = useEnrollments();
  
  // Use a ref to track if we've already fetched data to prevent duplicate requests
  const dataFetchedRef = useRef<boolean>(false);

  // Handle fetching the user data only once
  useEffect(() => {
    // Reset ref when dependencies change
    dataFetchedRef.current = false;
    
    const fetchUserData = async () => {
      // Don't fetch if we're still loading auth or if we've already fetched
      if (authLoading || dataFetchedRef.current) return;
      
      dataFetchedRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        if (viewMode && userId) {
          // In view mode, fetch the specific user by ID
          const userData = await apiClient.users.getUser({ userId: parseInt(userId) });
          setUser(userData);
        } else if (currentUser) {
          // Use the current user from auth context when not in viewMode
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    
    // Clean up function to reset state when unmounting
    return () => {
      dataFetchedRef.current = false;
    };
  }, [viewMode, userId, currentUser, authLoading, apiClient]);

  // Ensure courses and enrollments are loaded
  useEffect(() => {
    // Make sure data is loaded when component mounts or when user changes
    if (user) {
      fetchCourses();
      fetchEnrollments();
    }
  }, [user, fetchCourses, fetchEnrollments]);

  // Get user's enrolled courses
  const getUserCourses = useCallback(() => {
    if (!user || !user.userId) return [];
    
    // Find enrollments for this user as a student
    const userEnrollments = enrollments.filter(e => 
      e.studentId === user.userId && e.isActive !== false
    );
    
    console.log(`Found ${userEnrollments.length} enrollments for user ID ${user.userId}`);
    
    // Find courses for these enrollments
    const userCoursesResult = userEnrollments.map(enrollment => {
      const course = courses.find(c => c.courseId === enrollment.courseId && c.isActive !== false);
      if (!course) {
        console.log(`Could not find course with ID ${enrollment.courseId}`);
        return null;
      }
      
      console.log(`Found course: ${course.title}`);
      return {
        ...course,
        enrollmentId: enrollment.enrollmentId
      };
    }).filter(Boolean); // Filter out null values
    
    console.log(`Returning ${userCoursesResult.length} courses`);
    return userCoursesResult;
  }, [user, enrollments, courses]);

  // Handle password change
  const handleChangePassword = async () => {
    // Reset error and success messages
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validate password
    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    try {
      if (user && user.userId) {
        // Create update data with only the password
        const userUpdate: UserUpdate = {
          passwordHash: newPassword
        };
        
        // Call API to update user
        await apiClient.users.updateUser({
          userId: user.userId,
          userUpdate: userUpdate
        });
        
        setPasswordSuccess("Password changed successfully");
        setNewPassword('');
        setConfirmPassword('');
        
        // Close modal after a delay
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  const userCourses = getUserCourses();
  const isLoadingCourseData = loadingCourses || loadingEnrollments;

  if (isLoading || authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gray-50 rounded-xl">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
          <div className="text-6xl text-red-500 mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Profile</h1>
          <p className="text-lg text-gray-700 mb-6">
            {error}
          </p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gray-50 rounded-xl">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
          <div className="text-6xl text-gray-400 mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-lg text-gray-700 mb-6">
            The user you're looking for couldn't be found.
          </p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Now we know we have a valid user
  return (
    <motion.div 
      className="animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {viewMode && (
        <motion.div 
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Students
          </button>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column - user info */}
        <motion.div 
          className="w-full lg:w-1/3"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6"
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex flex-col items-center text-center">
              <motion.div 
                className="h-28 w-28 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
              >
                <span className="text-3xl font-bold text-white">
                  {user?.firstName?.[0] || '?'}{user?.lastName?.[0] || '?'}
                </span>
              </motion.div>
              <motion.h2 
                className="text-xl font-bold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {user?.firstName || 'Unknown'} {user?.lastName || ''}
              </motion.h2>
              <motion.p 
                className="text-gray-500 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {user?.email || 'No email available'}
              </motion.p>
              <motion.span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Student
              </motion.span>
              
              {viewMode && (
                <motion.button 
                  className="w-full py-2 px-4 border border-blue-500 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    if (user && user.userId) {
                      // Create a state object with the selected student info to pass to the assign course page
                      const assignState = {
                        preSelectedStudentId: user.userId,
                        preSelectedStudentName: `${user.firstName} ${user.lastName}`
                      };
                      navigate('/course-assignment', { state: assignState });
                    }
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Assign Course
                </motion.button>
              )}
            </div>
          </motion.div>
          
          {/* Navigation Tabs */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="space-y-1 p-2">
              <motion.button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Profile Information
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('courses')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Courses
              </motion.button>
            </div>
          </motion.div>
      
          {/* Account Status */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">User ID</span>
              <span className="text-gray-900">
                {user?.userId || 'Not available'}
              </span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Right column - profile details */}
        <motion.div 
          className="w-full lg:w-2/3"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-6"
                  whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div 
                        className="bg-gray-50 p-4 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-sm font-medium text-gray-500">First Name</p>
                        <p className="text-base text-gray-900">{user?.firstName || 'Not available'}</p>
                      </motion.div>
                      <motion.div 
                        className="bg-gray-50 p-4 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm font-medium text-gray-500">Last Name</p>
                        <p className="text-base text-gray-900">{user?.lastName || 'Not available'}</p>
                      </motion.div>
                    </div>
                    <motion.div 
                      className="bg-gray-50 p-4 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-base text-gray-900">{user?.email || 'Not available'}</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gray-50 p-4 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-base text-gray-900">{user?.username || 'Not available'}</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gray-50 p-4 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="text-base text-gray-900">Student</p>
                    </motion.div>
                  </div>
                </motion.div>
              
                {!viewMode && (
                  <motion.div 
                    className="bg-white rounded-xl shadow-sm p-6 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                    <motion.button 
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mb-3"
                      whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Change Password
                    </motion.button>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>For security purposes, please remember to log out when you're finished using the platform on shared devices.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          
            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-6"
                  whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h3>
                  
                  {isLoadingCourseData ? (
                    <div className="flex justify-center items-center py-10">
                      <LoadingSpinner />
                    </div>
                  ) : coursesError || enrollmentsError ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
                      <p className="text-red-700">{coursesError || enrollmentsError}</p>
                    </div>
                  ) : userCourses.length > 0 ? (
                    <div className="space-y-4">
                      {userCourses.map((course: any) => (
                        <motion.div 
                          key={course.courseId} 
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ 
                            y: -5,
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{course.description || 'No description available'}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>No courses found.</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {passwordError && (
                <motion.div 
                  className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" 
                  role="alert"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-red-700">{passwordError}</p>
                </motion.div>
              )}
              
              {passwordSuccess && (
                <motion.div 
                  className="bg-green-50 border-l-4 border-green-500 p-4 mb-6" 
                  role="alert"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-green-700">{passwordSuccess}</p>
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <motion.input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <motion.input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <motion.button 
                    type="button" 
                    onClick={() => setShowPasswordModal(false)}
                    className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="button" 
                    onClick={handleChangePassword}
                    className="py-2 px-4 bg-blue-600 border border-transparent rounded-lg text-white hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Change Password
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePage; 