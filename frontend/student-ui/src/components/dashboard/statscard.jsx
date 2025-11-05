import React from "react";

const StatsCard = ({ title, value, color = "teal" }) => {
  const colorClasses = {
    teal: "from-teal-500 to-teal-700",
    blue: "from-blue-500 to-blue-700",
    magenta: "from-pink-500 to-pink-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl shadow-lg p-5 flex flex-col justify-center items-center hover:shadow-xl transition duration-300`}
    >
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;
