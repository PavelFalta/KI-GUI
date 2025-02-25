import { useState, useEffect } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');
  const [animation, setAnimation] = useState(false);
  const [hue, setHue] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Rainbow effect for the title
  useEffect(() => {
    const interval = setInterval(() => {
      setHue((prevHue) => (prevHue + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setAnimation(true);
    setTimeout(() => {
      setTheme(theme === 'light' ? 'dark' : 'light');
      setAnimation(false);
    }, 300);
  };

  const cardVariants = [
    'bg-gradient-to-r from-blue-500 to-purple-500',
    'bg-gradient-to-r from-green-400 to-cyan-500',
    'bg-gradient-to-r from-yellow-400 to-orange-500',
    'bg-gradient-to-r from-pink-500 to-red-500',
  ];
  
  const [activeCardVariant, setActiveCardVariant] = useState(0);
  
  const rotateCardStyle = () => {
    setActiveCardVariant((prev) => (prev + 1) % cardVariants.length);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500 ${
      animation ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
    } ${
      theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'
    }`}>
      <h1 className="text-5xl font-bold text-center mb-8 transition-transform hover:scale-110 duration-300">
        <span style={{ color: `hsl(${hue}, 80%, 60%)` }} className="transition-colors duration-300">
          React
        </span> + <span className="text-teal-500">Tailwind CSS</span> 
        <span className="block mt-2 text-3xl">Visual Showcase</span>
      </h1>
      
      <div className={`${cardVariants[activeCardVariant]} shadow-2xl rounded-lg p-8 max-w-md w-full transition-all duration-500 transform hover:rotate-1 hover:scale-105`}>
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Interactive Counter</h2>
            <span className="font-mono bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full text-sm">{count}</span>
          </div>
          
          <div className="flex gap-3 justify-center mb-4">
            <button 
              onClick={() => setCount(count - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-all hover:shadow-lg hover:-translate-y-1">
              Decrease
            </button>
            
            <button 
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-all hover:shadow-lg hover:-translate-y-1">
              Increase
            </button>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(Math.max(count * 5 + 50, 5), 100)}%` }}>
            </div>
          </div>
        </div>
        
        <button
          onClick={rotateCardStyle}
          className="mt-4 w-full py-2 bg-white/30 hover:bg-white/40 text-white rounded transition-all text-sm">
          Change Card Style
        </button>
      </div>
      
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button 
          onClick={toggleTheme}
          className="px-5 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 active:bg-purple-700 transition-all hover:shadow-lg">
          Toggle Theme {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <button 
          onClick={() => setShowModal(!showModal)}
          className="px-5 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 active:bg-cyan-700 transition-all hover:shadow-lg">
          Show Modal 💫
        </button>
      </div>
      
      {/* Floating elements */}
      <div className="fixed top-10 right-10 animate-bounce bg-yellow-400 p-2 rounded-full shadow-lg">
        ✨
      </div>
      <div className="fixed bottom-10 left-10 animate-pulse bg-pink-400 p-2 rounded-full shadow-lg">
        🚀
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeIn" 
            onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">React + Tailwind Magic</h2>
            <p className="mb-6">This showcase demonstrates dynamic transitions, animations, and responsive design patterns.</p>
            <div className="flex justify-end">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add keyframes animation for the modal */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
