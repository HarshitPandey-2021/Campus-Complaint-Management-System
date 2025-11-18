// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mock user data (Student example)
  const [user, setUser] = useState({
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@college.edu",
    role: "student", // or "faculty"
    rollNo: "2021CS101",
    department: "Computer Science",
    phone: "+91 9876543210",
    avatar: null
  });

  // For testing Faculty role, uncomment this:
  // const [user, setUser] = useState({
  //   id: 2,
  //   name: "Dr. Priya Patel",
  //   email: "priya@college.edu",
  //   role: "faculty",
  //   employeeId: "FAC2019042",
  //   department: "Computer Science",
  //   designation: "Assistant Professor",
  //   phone: "+91 9876543211",
  //   avatar: null
  // });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to login (when implemented)
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};