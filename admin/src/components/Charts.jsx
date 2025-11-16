// src/components/Charts.jsx

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { useDarkMode } from '../context/DarkModeContext';

const Charts = ({ categoryData, statusData, trendData }) => {
  const { isDarkMode } = useDarkMode();

  // Colors for pie chart (status)
  const STATUS_COLORS = {
    Pending: '#3B82F6',      // blue-500
    'In Progress': '#F59E0B', // yellow-500
    Resolved: '#10B981',      // green-500
    Rejected: '#EF4444'       // red-500
  };

  // Theme colors based on dark mode
  const chartTheme = {
    text: isDarkMode ? '#E5E7EB' : '#374151',        // gray-200 : gray-700
    grid: isDarkMode ? '#374151' : '#E5E7EB',        // gray-700 : gray-200
    tooltip: isDarkMode ? '#1F2937' : '#FFFFFF',     // gray-800 : white
    tooltipBorder: isDarkMode ? '#4B5563' : '#D1D5DB' // gray-600 : gray-300
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}: <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Complaints by Category - Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
          Complaints by Category
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              stroke={chartTheme.grid}
            />
            <YAxis 
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              stroke={chartTheme.grid}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: chartTheme.text }} />
            <Bar dataKey="count" fill="#4F46E5" name="Complaints" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Complaints by Status - Pie Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
          Complaints by Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#6B7280'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: chartTheme.text }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Complaints Trend - Line Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
          Complaints Trend (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              stroke={chartTheme.grid}
            />
            <YAxis 
              tick={{ fill: chartTheme.text, fontSize: 12 }}
              stroke={chartTheme.grid}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: chartTheme.text }} />
            <Line 
              type="monotone" 
              dataKey="complaints" 
              stroke="#4F46E5" 
              strokeWidth={2}
              dot={{ fill: '#4F46E5', r: 4 }}
              activeDot={{ r: 6 }}
              name="Complaints"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;