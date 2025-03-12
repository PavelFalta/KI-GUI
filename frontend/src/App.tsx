import React, { useState, JSX } from 'react';
import { AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

interface User {
  username: string;
}

function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (username: string): void => {
    // for demo
    setUser({ username });
  };

  const handleLogout = (): void => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AnimatePresence mode="wait">
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
