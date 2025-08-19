import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/agents?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Main navigation */}
      <Navigation />
    </header>
  );
};

export default Header;
