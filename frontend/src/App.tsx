import { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useStudents } from './hooks/useStudents';
import { useTasks } from './hooks/useTasks';
import { useCourses } from './hooks/useCourses';
import { useTaskCompletions } from './hooks/useTaskCompletions';
import { motion, AnimatePresence } from 'framer-motion';

// New imports for course and task management components
import CourseManagement from './components/CourseManagement';
import CourseAssignment from './components/CourseAssignment';
import TaskManagement from './components/TaskManagement';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import SignUpPage from './pages/auth/SignUpPage';

// Dynamic content section components
const Dashboard = () => {
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
        <DashboardCard 
          title="Students" 
          description="View and manage other students" 
          icon="👥" 
          linkTo="/students"
        />
        <DashboardCard 
          title="My Profile" 
          description="View and edit your profile information" 
          icon="👤" 
          linkTo="/profile"
        />
      </motion.div>
    </div>
  );
};

const Tasks = () => {
  const { tasks, loading, error, fetchTasks } = useTasks();
  const { user } = useAuth();
  const [completeTaskId, setCompleteTaskId] = useState<number | null>(null);

  const handleCompleteTask = async (taskId: number) => {
    setCompleteTaskId(taskId);
    // In a real implementation, you would call the API to mark the task as completed
    console.log(`Marking task ${taskId} as completed`);
    await new Promise(resolve => setTimeout(resolve, 800));
    setCompleteTaskId(null);
    await fetchTasks(); // Refresh the task list
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter tasks based on status (using isActive as a proxy for completion status)
  // In a real app, you might have a different field for completion status
  const pendingTasks = tasks.filter(task => task.isActive !== false);
  const completedTasks = tasks.filter(task => task.isActive === false);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tasks</h1>
      <p className="text-lg text-gray-700 mb-8">Manage and complete your assigned tasks</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Tasks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <div key={task.taskId} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{task.title || "Untitled Task"}</h3>
                    <div className="mt-1 flex flex-col md:flex-row md:items-center text-sm text-gray-500">
                      <span className="mr-2">ID: {task.taskId}</span>
                      <span className="mr-2">Course ID: {task.courseId || 'None'}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{task.description || "No description provided."}</p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center">
                    <div className="flex space-x-2">
                      <button 
                        className={`py-1 px-3 text-sm border border-blue-500 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors ${completeTaskId === task.taskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleCompleteTask(task.taskId)}
                        disabled={completeTaskId === task.taskId}
                      >
                        {completeTaskId === task.taskId ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Completing...</span>
                          </div>
                        ) : (
                          'Complete'
                        )}
                      </button>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-gray-500">
              No upcoming tasks. All caught up!
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Completed Tasks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <div key={task.taskId} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{task.title || "Untitled Task"}</h3>
                    <div className="mt-1 flex flex-col md:flex-row md:items-center text-sm text-gray-500">
                      <span className="mr-2">ID: {task.taskId}</span>
                      <span className="mr-2">Course ID: {task.courseId || 'None'}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{task.description || "No description provided."}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-gray-500">
              No completed tasks yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Updated Students component to use modern square tile layout
const Students = () => {
  const { students, loading, error, fetchStudents } = useStudents();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students.filter(student => student.isActive !== false);
    }
    
    const query = searchQuery.toLowerCase().trim();
    return students.filter(student => {
      return (
        student.isActive !== false &&
        (
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.username && student.username.toLowerCase().includes(query))
        )
      );
    });
  }, [students, searchQuery]);

  // Handle key press anywhere on the page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setIsSearchVisible(true);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      
      if (e.key === 'Escape' && isSearchVisible) {
        setIsSearchVisible(false);
        setSearchQuery('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchVisible]);

  // Handle search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value === '') {
      setIsSearchVisible(false);
    } else {
      setIsSearchVisible(true);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Students</h1>
      <p className="text-lg text-gray-700 mb-6">View and manage connections with other students</p>
      
      {/* Search Tray */}
      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mb-6 sticky top-4 z-10"
          >
            <div className="bg-white rounded-xl shadow-md p-3 flex items-center">
              <div className="text-gray-400 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 border-none focus:ring-0 py-2 text-gray-700 placeholder-gray-400 text-lg bg-transparent"
                placeholder="Search students by name, email, or username..."
                autoFocus
              />
            </div>
            {searchQuery && filteredStudents.length === 0 && (
              <div className="bg-blue-50 p-4 rounded-lg mt-4 text-center">
                <p className="text-blue-700">No students found matching "{searchQuery}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredStudents.map(student => (
          <motion.div 
            key={student.userId}
            className="aspect-square cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/profile/${student.userId}`)}
          >
            <div className="w-full h-full bg-white rounded-2xl shadow-sm overflow-hidden relative group">
              {/* Large Profile Picture */}
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <div className="text-4xl font-bold text-blue-800">
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </div>
              </div>
              
              {/* Overlay with name on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="text-white">
                  <h3 className="font-semibold text-lg leading-tight">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-white/80">@{student.username}</p>
                </div>
              </div>
              
              {/* Active Status Indicator */}
              <div className="absolute top-2 right-2">
                <span className="h-3 w-3 rounded-full bg-green-500 ring-2 ring-white block"></span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// UI Components for the Dashboard
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

interface CourseCardProps {
  title: string;
  description: string;
  instructor: string;
  progress: number;
}

const CourseCard = ({ title, description, instructor, progress }: CourseCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
        <span className="text-white text-4xl font-bold">📚</span>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>Instructor: {instructor}</span>
        </div>
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

// Unauthorized access page
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gray-50 rounded-xl">
      <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
        <div className="text-6xl text-red-500 mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700 mb-6">
          You do not have permission to access this section.
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

// Not Found page
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gray-50 rounded-xl">
      <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
        <div className="text-6xl text-gray-400 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-700 mb-6">
          The page you are looking for does not exist.
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

// Main Layout for the single-page app
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get pending approval count for notification badge
  const { getPendingApprovalsByAssigner } = useTaskCompletions();
  const pendingApprovals = getPendingApprovalsByAssigner();
  const pendingApprovalCount = pendingApprovals ? pendingApprovals.length : 0;
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const menuItems = [
    { name: 'My Tasks', path: '/tasks', icon: '✅', notificationCount: pendingApprovalCount > 0 },
    { name: 'Course Management', path: '/course-management', icon: '📋' },
    { name: 'Course Assignment', path: '/course-assignment', icon: '🎓' },
    { name: 'Students', path: '/students', icon: '👥' },
    { name: 'Profile', path: '/profile', icon: '👤' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-sm transform transition-all duration-300 fixed md:static inset-y-0 left-0 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'} md:flex flex-col w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span 
              onClick={() => navigate('/dashboard')} 
              className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
            >
              {isSidebarOpen ? 'EduPlatform' : 'E'}
            </span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700 focus:outline-none hidden md:block"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group flex items-center py-2 px-3 rounded-lg cursor-pointer ${location.pathname === item.path ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="relative mr-3">
                  <span className="text-lg">{item.icon}</span>
                  {item.notificationCount && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
                  )}
                </div>
                {isSidebarOpen && <span>{item.name}</span>}
              </a>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-200 p-4">
          {isSidebarOpen ? (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden mr-4"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span 
                onClick={() => {
                  navigate('/dashboard');
                  setIsMobileMenuOpen(false);
                }} 
                className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors md:hidden"
              >
                EduPlatform
              </span>
            </div>
            <div className="flex-1 flex justify-end items-center">
              <span className="hidden md:inline text-sm text-gray-500 mr-4">
                Welcome, {user?.firstName}
              </span>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold md:hidden">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Home route that redirects based on auth status
const HomeRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Redirect root based on auth status */}
        <Route path="/" element={<HomeRoute />} />
        
        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            </ProtectedRoute>
          } 
        />

        {/* Add individual student profile view */}
        <Route 
          path="/profile/:userId" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <ProfilePage viewMode={true} />
              </PageTransition>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <TaskManagement />
              </PageTransition>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/students" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Students />
              </PageTransition>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/assign-tasks" 
          element={
            <Navigate to="/course-assignment" replace />
          } 
        />

        {/* New routes for course and task management */}
        <Route
          path="/course-management"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CourseManagement />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-assignment"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CourseAssignment />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        
        {/* Redirect old task approvals path to new tasks path */}
        <Route
          path="/task-approvals"
          element={
            <Navigate to="/tasks" replace />
          }
        />

        {/* Redirect old courses path to dashboard */}
        <Route
          path="/courses"
          element={
            <Navigate to="/dashboard" replace />
          }
        />

        {/* Unauthorized access page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

// Page transition component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
