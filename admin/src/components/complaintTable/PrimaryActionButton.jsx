// src/components/ComplaintTable/PrimaryActionButton.jsx
import React from 'react';
import { RiPlayFill, RiCheckFill } from 'react-icons/ri';

const PrimaryActionButton = ({ status, onActionClick }) => {
  if (status === 'Resolved' || status === 'Rejected') return null;

  const handleClick = () => {
    const action = status === 'Pending' ? 'start' : 'resolve';
    onActionClick?.(action);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
        status === 'Pending'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'
      }`}
    >
      {status === 'Pending' ? (
        <>
          <RiPlayFill size={14} /> Start
        </>
      ) : (
        <>
          <RiCheckFill size={14} /> Resolve
        </>
      )}
    </button>
  );
};

export default PrimaryActionButton;
