// src/components/ComplaintTable/SortIcon.jsx
import React from 'react';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

const SortIcon = ({ sortConfig, columnKey }) => {
  if (sortConfig.key !== columnKey) {
    return <RiArrowUpLine className="ml-1 text-gray-400 opacity-50" />;
  }
  return sortConfig.direction === 'asc' ? (
    <RiArrowUpLine className="ml-1 text-blue-500" />
  ) : (
    <RiArrowDownLine className="ml-1 text-blue-500" />
  );
};

export default SortIcon;
