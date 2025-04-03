import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  title: string;
  message: string;
  icon: string;
}

// Reusable error page component
const ErrorPage = ({ title, message, icon }: ErrorPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gray-50 rounded-xl">
      <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-700 mb-6">{message}</p>
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

export const UnauthorizedPage = () => (
  <ErrorPage 
    title="Access Denied" 
    message="You do not have permission to access this section." 
    icon="⚠️" 
  />
);

export const NotFoundPage = () => (
  <ErrorPage 
    title="Page Not Found" 
    message="The page you are looking for does not exist." 
    icon="404" 
  />
); 