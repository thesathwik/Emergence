import React from 'react';
import Navigation from './Navigation';

const Header: React.FC = () => {

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Main navigation */}
      <Navigation />
    </header>
  );
};

export default Header;
