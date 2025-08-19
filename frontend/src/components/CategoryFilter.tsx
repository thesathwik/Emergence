import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

export interface Category {
  value: string;
  label: string;
  color: string;
  count?: number;
}

interface CategoryFilterProps {
  variant?: 'dropdown' | 'buttons' | 'tabs' | 'mobile';
  showCount?: boolean;
  className?: string;
  onCategoryChange?: (category: string) => void;
  categories?: Category[];
  selectedCategory?: string;
  categoryCounts?: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  variant = 'dropdown',
  showCount = true,
  className = '',
  onCategoryChange,
  categories: customCategories,
  selectedCategory: externalSelectedCategory,
  categoryCounts
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Default categories
  const defaultCategories: Category[] = [
    { value: '', label: 'All', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'Marketing', label: 'Marketing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'Sales', label: 'Sales', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'Customer Support', label: 'Customer Support', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'Content Creation', label: 'Content Creation', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { value: 'Data Analysis', label: 'Data Analysis', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { value: 'Research', label: 'Research', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { value: 'Education', label: 'Education', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { value: 'Healthcare', label: 'Healthcare', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'Finance', label: 'Finance', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'E-commerce', label: 'E-commerce', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  const categories = customCategories || defaultCategories;
  
  // Get selected category from URL params or external prop
  const getSelectedCategory = (): string => {
    if (externalSelectedCategory !== undefined) {
      return externalSelectedCategory;
    }
    return searchParams.get('category') || '';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(getSelectedCategory());

  // Update selected category when URL params change
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams, selectedCategory]);

  // Update selected category when external prop changes
  useEffect(() => {
    if (externalSelectedCategory !== undefined && externalSelectedCategory !== selectedCategory) {
      setSelectedCategory(externalSelectedCategory);
    }
  }, [externalSelectedCategory, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    if (category) {
      newSearchParams.set('category', category);
    } else {
      newSearchParams.delete('category');
    }
    
    // Preserve other URL parameters
    setSearchParams(newSearchParams);
    
    // Call external callback if provided
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const getCategoryCount = (categoryValue: string): number => {
    if (categoryCounts && categoryCounts[categoryValue] !== undefined) {
      return categoryCounts[categoryValue];
    }
    const category = categories.find(cat => cat.value === categoryValue);
    return category?.count || 0;
  };

  const getCategoryColor = (categoryValue: string): string => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Dropdown Variant
  const renderDropdown = () => (
    <div className={`relative ${className}`}>
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
      >
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
            {showCount && ` (${getCategoryCount(category.value)})`}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  // Buttons Variant
  const renderButtons = () => (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => handleCategoryChange(category.value)}
          className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm ${
            selectedCategory === category.value
              ? `${category.color} shadow-md transform scale-105`
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>{category.label}</span>
            {showCount && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedCategory === category.value
                  ? 'bg-white bg-opacity-20'
                  : 'bg-gray-100'
              }`}>
                {getCategoryCount(category.value)}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );

  // Tabs Variant
  const renderTabs = () => (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryChange(category.value)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedCategory === category.value
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{category.label}</span>
                          {showCount && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedCategory === category.value
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getCategoryCount(category.value)}
              </span>
            )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );

  // Mobile-friendly buttons variant
  const renderMobileButtons = () => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => handleCategoryChange(category.value)}
          className={`p-3 rounded-lg border transition-all duration-200 text-center ${
            selectedCategory === category.value
              ? `${category.color} shadow-md`
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="text-sm font-medium">{category.label}</div>
          {showCount && (
            <div className="text-xs text-gray-500 mt-1">{getCategoryCount(category.value)} agents</div>
          )}
        </button>
      ))}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'dropdown':
      return renderDropdown();
    case 'buttons':
      return renderButtons();
    case 'tabs':
      return renderTabs();
    case 'mobile':
      return renderMobileButtons();
    default:
      return renderDropdown();
  }
};

// Hook for easy category filter usage
export const useCategoryFilter = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  
  const updateCategory = (category: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (category) {
      newSearchParams.set('category', category);
    } else {
      newSearchParams.delete('category');
    }
    return newSearchParams;
  };

  return {
    selectedCategory,
    updateCategory
  };
};

// Preset category configurations
export const categoryPresets = {
  business: [
    { value: '', label: 'All', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'Marketing', label: 'Marketing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'Sales', label: 'Sales', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'Customer Support', label: 'Customer Support', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'Content Creation', label: 'Content Creation', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { value: 'Data Analysis', label: 'Data Analysis', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { value: 'Research', label: 'Research', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { value: 'Education', label: 'Education', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { value: 'Healthcare', label: 'Healthcare', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'Finance', label: 'Finance', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'E-commerce', label: 'E-commerce', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ],
  technical: [
    { value: '', label: 'All', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'AI', label: 'AI', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'Automation', label: 'Automation', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'Testing', label: 'Testing', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'Data Processing', label: 'Data Processing', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'Web Scraping', label: 'Web Scraping', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ]
};

export default CategoryFilter;
