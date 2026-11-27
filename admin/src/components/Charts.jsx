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

const Charts = ({ type = "bar", data = [], categoryData = [], statusData = [], trendData = [] }) => {
  const { isDarkMode } = useDarkMode();

  // Colors for pie chart (status)
  const STATUS_COLORS = {
    Pending: '#3B82F6',      // blue-500
    'In Progress': '#F59E0B', // yellow-500
    Resolved: '#10B981',      // green-500
    Rejected: '#EF4444'       // red-500
  };

  const GENERIC_COLORS = [
    '#6366f1',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#06b6d4',
    '#ef4444',
  ];

  // Theme colors based on dark mode
  const chartTheme = {
    text: isDarkMode ? '#E5E7EB' : '#374151',        // gray-200 : gray-700
    grid: isDarkMode ? '#374151' : '#E5E7EB',        // gray-700 : gray-200
    tooltip: isDarkMode ? '#1F2937' : '#FFFFFF',     // gray-800 : white
    tooltipBorder: isDarkMode ? '#4B5563' : '#D1D5DB' // gray-600 : gray-300
  };

  // Transform trendData
  const transformedTrendData = trendData && Array.isArray(trendData) 
    ? trendData.map(item => ({
        date: item.name || item.date || 'Unknown',
        complaints: item.value || 0
      }))
    : [];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border"
          style={{
            backgroundColor: chartTheme.tooltip,
            borderColor: chartTheme.tooltipBorder,
          }}
        >
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

  // Safety check: ensure data exists
  const validateData = (dataArray) => {
    return Array.isArray(dataArray) && dataArray.length > 0;
  };

  // Generic chart renderer (for analytics page)
  const renderGenericChart = () => {
    if (!validateData(data)) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No data available to display</p>
        </div>
      );
    }

    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
              <Bar 
                dataKey="Complaints" 
                fill="#4F46E5" 
                name="Complaints"
                radius={[8, 8, 0, 0]} 
              />
              <Bar 
                dataKey="value" 
                fill="#EC4899" 
                name="Count"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name] || GENERIC_COLORS[index % GENERIC_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: chartTheme.text }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ fill: '#4F46E5', r: 4 }}
                activeDot={{ r: 6 }}
                name="Value"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Unknown chart type: {type}</p>
          </div>
        );
    }
  };

  // Dashboard mode (detailed charts with specific data)
  if (categoryData.length > 0 || statusData.length > 0 || trendData.length > 0) {
    return (
      <div className="space-y-6">
        {/* Complaints by Category - Bar Chart */}
        {validateData(categoryData) && (
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
                <Bar dataKey="Complaints" fill="#4F46E5" name="Complaints" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Complaints by Status - Pie Chart */}
        {validateData(statusData) && (
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
        )}

        {/* Complaints Trend - Line Chart */}
        {validateData(transformedTrendData) && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Complaints Trend (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transformedTrendData}>
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
        )}

        {!validateData(categoryData) && !validateData(statusData) && !validateData(transformedTrendData) && (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No data available to display</p>
          </div>
        )}
      </div>
    );
  }

  // Analytics mode (generic chart with type prop)
  return renderGenericChart();
};

export default Charts;
