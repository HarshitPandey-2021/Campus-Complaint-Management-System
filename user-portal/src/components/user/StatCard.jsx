// src/components/user/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'indigo', onClick }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    green: 'bg-green-500 text-white',
  };

  return (
    <div
      onClick={onClick}
      className={`group p-4 sm:p-6 rounded-xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 ${
        onClick ? 'cursor-pointer' : ''
      } ${colorClasses[color] || 'bg-white dark:bg-gray-800'}`}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-white/20 backdrop-blur-sm'} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'}`} />
        </div>
      </div>
      <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wide mb-1 sm:mb-2 ${
        color === 'indigo' ? 'text-gray-600 dark:text-gray-400' : 'text-white/90'
      }`}>
        {label}
      </p>
      <p className={`text-2xl sm:text-4xl font-extrabold ${
        color === 'indigo' ? 'text-gray-800 dark:text-gray-200' : 'text-white'
      }`}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;