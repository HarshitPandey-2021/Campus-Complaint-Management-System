export default function Skeleton({ variant = 'text', width = 'w-full', height = 'h-4', className = '' }) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variants = {
    text: `${height} ${width}`,
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
    card: 'h-48 w-full rounded-lg'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}></div>
  );
}

// Preset Skeletons for common use cases
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circle" width="w-12" height="h-12" />
        <Skeleton width="w-16" height="h-6" />
      </div>
      <Skeleton width="w-20" height="h-8" className="mb-2" />
      <Skeleton width="w-32" height="h-4" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4"><Skeleton width="w-12" /></td>
      <td className="px-4 py-4"><Skeleton width="w-12" height="h-12" variant="circle" /></td>
      <td className="px-4 py-4"><Skeleton width="w-48" /></td>
      <td className="px-4 py-4"><Skeleton width="w-24" /></td>
      <td className="px-4 py-4"><Skeleton width="w-32" /></td>
      <td className="px-4 py-4"><Skeleton width="w-20" /></td>
      <td className="px-4 py-4"><Skeleton width="w-20" /></td>
      <td className="px-4 py-4"><Skeleton width="w-28" /></td>
      <td className="px-4 py-4"><Skeleton width="w-32" /></td>
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <Skeleton width="w-32" height="h-6" />
        <Skeleton width="w-20" height="h-6" />
      </div>
      <Skeleton width="w-full" height="h-6" className="mb-3" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Skeleton width="w-full" height="h-16" />
        <Skeleton width="w-full" height="h-16" />
        <Skeleton width="w-full" height="h-16" className="col-span-2" />
      </div>
      <Skeleton width="w-full" height="h-12" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      <Skeleton width="w-48" height="h-6" className="mb-4" />
      <Skeleton width="w-full" height="h-64" />
    </div>
  );
}