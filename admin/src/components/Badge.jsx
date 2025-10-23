// src/components/Badge.jsx

import React from 'react';

const Badge = ({ status }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-400 text-white';
      case 'In Progress':
        return 'bg-yellow-500 text-gray-900';
      case 'Resolved':
        return 'bg-green-500 text-white';
      case 'Rejected':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses()}`}>
      {status}
    </span>
  );
};

export default Badge;