// @ts-nocheck
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Generate breadcrumb items from pathname
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Don't show breadcrumbs on home page or login/register
  if (pathnames.length === 0 || pathnames[0] === 'login' || pathnames[0] === 'register') {
    return null;
  }

  // Format breadcrumb label
  const formatLabel = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4 px-6 pt-4">
      {/* Home link */}
      <Link 
        to="/" 
        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="Home"
      >
        <Home size={16} />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <React.Fragment key={routeTo}>
            <ChevronRight size={16} className="text-neutral-400" />
            {isLast ? (
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                {formatLabel(name)}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {formatLabel(name)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
