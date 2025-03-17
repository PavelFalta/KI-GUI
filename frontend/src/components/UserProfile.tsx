import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-700">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium">{user.first_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium">{user.last_name}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-700">Role Information</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Role</p>
            <div className="flex items-center mt-1">
              <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                {user.role.name}
              </span>
            </div>
            {user.role.description && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{user.role.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 