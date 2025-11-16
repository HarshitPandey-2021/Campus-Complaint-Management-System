import { StatCardSkeleton, TableRowSkeleton, CardSkeleton, ChartSkeleton } from './Skeleton';

export default function Loading({ type = 'page' }) {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Image</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Category</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Location</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (type === 'chart') {
    return <ChartSkeleton />;
  }

  // Default page loader
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}