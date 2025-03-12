import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    // for demo
    setUser({ username });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AnimatePresence exitBeforeEnter>
        {user ? (
          <Dashboard key="dashboard" user={user} onLogout={handleLogout} />
        ) : (
          <Login key="login" onLogin={handleLogin} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
