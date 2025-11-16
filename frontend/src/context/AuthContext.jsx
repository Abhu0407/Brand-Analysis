// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      axios
        .get('http://localhost:4000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setCurrentUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrToken, password) => {
    // If password is provided, it's email/password login
    // Otherwise, it's a token from registration/login
    if (password !== undefined) {
      const res = await axios.post('http://localhost:4000/api/auth/login', {
        email: emailOrToken,
        password
      });
      localStorage.setItem('token', res.data.token);
      // Fetch user data
      const userRes = await axios.get('http://localhost:4000/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      setCurrentUser(userRes.data);
      return res.data.token;
    } else {
      // Token provided directly (from login/register pages)
      const token = emailOrToken;
      localStorage.setItem('token', token);
      // Fetch user data
      const userRes = await axios.get('http://localhost:4000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(userRes.data);
      return token;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};