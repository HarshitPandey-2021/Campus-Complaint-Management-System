import { RiInboxLine, RiSearchLine, RiFilterLine, RiRefreshLine } from 'react-icons/ri';

export default function EmptyState({ 
  type = 'complaints', 
  onAction, 
  actionLabel = 'Clear Filters',
  searchTerm = ''
}) {
  const configs = {
    complaints: {
      icon: RiInboxLine,
      title: 'No Complaints Yet',
      description: 'There are currently no complaints in the system.',
      suggestion: 'New complaints will appear here once students submit them.',
      showAction: false
    },
    search: {
      icon: RiSearchLine,
      title: 'No Results Found',
      description: `We couldn't find any complaints matching "${searchTerm}".`,
      suggestion: 'Try different keywords, check your spelling, or adjust your filters.',
      showAction: true
    },
    filter: {
      icon: RiFilterLine,
      title: 'No Matching Complaints',
      description: 'No complaints match your selected filters.',
      suggestion: 'Try selecting different filter options or clear all filters to see all complaints.',
      showAction: true
    },
    error: {
      icon: RiRefreshLine,
      title: 'Unable to Load Complaints',
      description: 'Something went wrong while loading the complaints.',
      suggestion: 'Please try refreshing the page or check your internet connection.',
      showAction: true,
      actionLabel: 'Retry'
    }
  };

  const config = configs[type] || configs.complaints;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      {/* Icon with Animation */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-ping opacity-20"></div>
        </div>
        <Icon className="h-24 w-24 text-gray-400 dark:text-gray-600 relative z-10" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        {config.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-center mb-2 max-w-md">
        {config.description}
      </p>

      {/* Suggestion */}
      <p className="text-sm text-gray-500 dark:text-gray-500 text-center mb-8 max-w-md">
        {config.suggestion}
      </p>

      {/* Action Button */}
      {config.showAction && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 font-semibold shadow-md"
        >
          <RiRefreshLine className="h-5 w-5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}