// src/components/Badge.jsx

import React from 'react';

const Badge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Pending': {
        className: 'bg-blue-400 text-white dark:bg-blue-500',
        label: 'Pending'
      },
      'In Progress': {
        className: 'bg-yellow-500 text-gray-900 dark:bg-yellow-500 dark:text-gray-900',
        label: 'In Progress'
      },
      'Resolved': {
        className: 'bg-green-500 text-white dark:bg-green-600',
        label: 'Resolved'
      },
      'Rejected': {
        className: 'bg-red-600 text-white dark:bg-red-700',
        label: 'Rejected'
      }
    };
    return configs[status] || {
      className: 'bg-gray-400 text-white dark:bg-gray-500',
      label: status
    };
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold shadow-sm ${config.className}`}
      style={{ minWidth: '100px', height: '28px' }}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {config.label}
    </span>
  );
};

export default Badge;