// src/context/DarkModeContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext(undefined);

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const initialMode = saved === 'true';
    setIsDarkMode(initialMode);
    
    if (initialMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update when state changes
  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
}