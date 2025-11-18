import React from "react";

const Card = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition duration-200">
      {title && (
        <h2 className="text-lg font-semibold text-teal-700 mb-3 border-b border-gray-200 pb-2">
          {title}
        </h2>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
