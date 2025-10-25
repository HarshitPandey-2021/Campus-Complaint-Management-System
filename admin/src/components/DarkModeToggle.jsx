// src/components/DarkModeToggle.jsx

import { RiMoonFill, RiSunFill } from 'react-icons/ri';
import { useDarkMode } from '../context/DarkModeContext';

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <RiSunFill className="h-5 w-5 text-yellow-400" />
      ) : (
        <RiMoonFill className="h-5 w-5 text-indigo-600" />
      )}
    </button>
  );
}

export default DarkModeToggle;