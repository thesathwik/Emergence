import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      name: 'Browse',
      path: '/agents',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      name: 'Upload',
      path: '/upload',
      icon: 'M12 4v16m8-8H4'
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg
              className={`w-6 h-6 mb-1 ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
