import { Link, useLocation } from 'react-router-dom';
import { RiHomeLine, RiArrowRightSLine } from 'react-icons/ri';

export default function Breadcrumb() {
  const location = useLocation();
  
  const breadcrumbNames = {
    '': 'Dashboard',
    'complaints': 'Complaints',
    'analytics': 'Analytics',
    'profile': 'Profile'
  };

  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumb on homepage
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm px-4 sm:px-6 lg:px-8 pt-6 pb-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Home */}
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
      >
        <RiHomeLine className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = breadcrumbNames[pathname] || pathname;

        return (
          <div key={pathname} className="flex items-center space-x-2">
            <RiArrowRightSLine className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            {isLast ? (
              <span className="font-semibold text-gray-800 dark:text-gray-200 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                {name}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:underline"
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}