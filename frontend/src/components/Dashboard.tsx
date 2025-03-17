import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Welcome, {user.first_name}!</h3>
            <p className="text-blue-600">
              You are logged in as <span className="font-semibold">{user.role.name}</span>
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Courses</p>
                <p className="text-xl font-bold">0</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Tasks</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg md:col-span-2">
            <h3 className="text-lg font-medium text-green-800 mb-2">Recent Activity</h3>
            <p className="text-green-600">
              No recent activity to display.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 