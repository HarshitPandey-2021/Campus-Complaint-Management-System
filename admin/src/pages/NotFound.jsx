import { Link } from 'react-router-dom';
import { RiHome5Line, RiArrowLeftLine, RiErrorWarningLine } from 'react-icons/ri';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/20 rounded-full animate-ping opacity-20"></div>
          </div>
          <RiErrorWarningLine className="h-32 w-32 text-indigo-600 dark:text-indigo-400 mx-auto relative z-10" />
        </div>

        {/* 404 Text */}
        <h1 className="text-9xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
          404
        </h1>
        
        {/* Heading */}
        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Oops! Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
          <br />
          <span className="text-sm">Let's get you back on track!</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg"
          >
            <RiHome5Line className="h-6 w-6" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all hover:scale-105"
          >
            <RiArrowLeftLine className="h-6 w-6" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Dashboard
            </Link>
            <Link to="/complaints" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Complaints
            </Link>
            <Link to="/analytics" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Analytics
            </Link>
            <Link to="/profile" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}