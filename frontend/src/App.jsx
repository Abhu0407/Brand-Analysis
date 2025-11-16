// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SentimentAnalysis from './pages/SentimentAnalysis';
import TopicClustering from './pages/TopicClustering';
import SpikeAlerts from './pages/SpikeAlerts';
import Reports from './pages/Reports';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import Layout from './components/layout/Layout';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading App</h1>
            <p className="text-gray-700 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={currentUser ? <Layout /> : <Navigate to="/login" />} 
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sentiment" element={<SentimentAnalysis />} />
        <Route path="topics" element={<TopicClustering />} />
        <Route path="alerts" element={<SpikeAlerts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="search" element={<Search />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
      
      <Route 
        path="/register" 
        element={!currentUser ? <Register /> : <Navigate to="/" />} 
      />
      
      <Route 
        path="/login" 
        element={!currentUser ? <Login /> : <Navigate to="/" />} 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;