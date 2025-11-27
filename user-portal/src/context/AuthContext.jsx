// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auth data in URL first
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    
    console.log('🔍 Checking auth...');
    console.log('Auth param in URL:', !!authParam);
    
    if (authParam) {
      try {
        // Decode and save auth data from URL
        const authData = JSON.parse(decodeURIComponent(authParam));
        console.log('✅ Auth data from URL:', authData);
        
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        setUser(authData.user);
        setIsAuthenticated(true);
        
        // Remove auth param from URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('✅ Auth saved, URL cleaned');
        setLoading(false);
        return;
      } catch (error) {
        console.error('❌ Failed to parse auth from URL:', error);
      }
    }
    
    // If no URL param, check localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Checking localStorage:', { hasToken: !!token, hasUser: !!storedUser });
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ User loaded from localStorage:', parsedUser.name);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('❌ Failed to parse user:', error);
        localStorage.clear();
        setLoading(false);
        window.location.href = 'http://localhost:5174';
      }
    } else {
      console.log('❌ No auth found, redirecting...');
      setLoading(false);
      window.location.href = 'http://localhost:5174';
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
    window.location.href = 'http://localhost:5174';
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
