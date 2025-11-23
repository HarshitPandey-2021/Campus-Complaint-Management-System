// src/components/common/RoleBadge.jsx
import React from 'react';
import { RiUserLine, RiGraduationCapLine } from 'react-icons/ri';

const RoleBadge = ({ role }) => {
  const isStudent = role === 'student';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
        isStudent
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      }`}
    >
      {isStudent ? (
        <RiGraduationCapLine className="h-4 w-4" />
      ) : (
        <RiUserLine className="h-4 w-4" />
      )}
      {isStudent ? 'Student' : 'Faculty'}
    </span>
  );
};

export default RoleBadge;