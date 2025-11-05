import React from "react";

const Button = ({ label, onClick, type = "button", color = "primary" }) => {
  const colorClasses =
    color === "primary"
      ? "bg-teal-700 hover:bg-teal-800 text-white"
      : color === "secondary"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-magenta-600 hover:bg-magenta-700 text-white";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${colorClasses} px-5 py-2 rounded-lg font-medium shadow-md transition duration-200`}
    >
      {label}
    </button>
  );
};

export default Button;
