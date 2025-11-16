// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Sentiment Analysis', path: '/sentiment', icon: '😊' },
    { name: 'Topic Clustering', path: '/topics', icon: '🏷️' },
    { name: 'Spike Alerts', path: '/alerts', icon: '🔔' },
    { name: 'Reports', path: '/reports', icon: '📈' },
    { name: 'Search', path: '/search', icon: '🔍' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-indigo-600">Brand Monitor</h1>
      </div>
      <nav className="mt-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              location.pathname === item.path ? 'bg-gray-100 border-r-4 border-indigo-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;