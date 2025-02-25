import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'
    }`}>
      <h1 className="text-4xl font-bold text-center mb-6">
        <span className="text-blue-600">React</span> + <span className="text-teal-500">Tailwind CSS</span> Demo
      </h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full dark:bg-gray-800">
        <p className="mb-4 text-center">
          Counter: <span className="font-bold text-2xl text-purple-600">{count}</span>
        </p>
        
        <div className="flex gap-2 justify-center">
          <button 
            onClick={() => setCount(count - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 active:bg-red-700 transition-colors">
            Decrease
          </button>
          
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:bg-green-700 transition-colors">
            Increase
          </button>
        </div>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="mt-6 px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 active:bg-purple-700 transition-colors">
        Toggle Theme: {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
