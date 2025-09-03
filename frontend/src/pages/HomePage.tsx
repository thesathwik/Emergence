import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryFilter from '../components/CategoryFilter';
import { useCategoryCounts } from '../hooks/useCategoryCounts';
import { apiService } from '../services/api';
import { Agent, AgentsResponse } from '../types';

const HomePage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { categoryCounts, updateCategoryCounts } = useCategoryCounts();

  const fetchAgents = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: AgentsResponse = await apiService.getAgents(category);
      setAgents(response.agents);
      if (!category) updateCategoryCounts(response.agents);
    } catch (err: any) {
      setError(err.userMessage || err.message || 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, [updateCategoryCounts]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchAgents(category || undefined);
  };

  const handleClearFilter = () => {
    setSelectedCategory('');
    fetchAgents();
  };

  return (
    <div className="min-h-screen bg-white antialiased pt-24">
      {/* Hero Section (disable pointer events so dropdown can be clicked over it) */}
      <div className="relative overflow-hidden z-0 pointer-events-none">
        <div className="max-w-6xl mx-auto px-8 pt-32 pb-20 text-center">
          <h1 className="text-8xl font-extralight text-gray-900 mb-8 tracking-tight leading-none">
            Emergence
          </h1>
          <p className="text-2xl text-gray-500 font-light max-w-4xl mx-auto leading-relaxed mb-4">
            The definitive marketplace for intelligent agents.
          </p>
          <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed mb-16">
            Discover, deploy, and connect AI agents that work together to solve complex problems.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
            <Link
              to="/agents"
              className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-5 rounded-2xl font-light hover:bg-gray-800 transition-all duration-300 no-underline shadow-sm hover:shadow-md transform hover:scale-[1.02] pointer-events-auto"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Explore Marketplace
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-10 py-5 rounded-2xl font-light hover:bg-gray-50 hover:shadow-sm transition-all duration-300 no-underline pointer-events-auto"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Agent
            </Link>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
        </div>
      </div>

      {/* Featured Agents Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extralight text-gray-900 mb-8 tracking-tight leading-tight">
              Featured Agents
            </h2>
            <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
              Handpicked intelligent agents ready to enhance your workflow
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12 space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <div className="text-3xl font-extralight text-gray-900 mb-2">
                {agents.length} Agent{agents.length !== 1 ? 's' : ''}
              </div>
              {selectedCategory && (
                <p className="text-gray-500 font-light">in {selectedCategory}</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-500 font-light">Category</span>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                <CategoryFilter
                  variant="dropdown"
                  showCount={true}
                  onCategoryChange={handleCategoryChange}
                  selectedCategory={selectedCategory}
                  categoryCounts={categoryCounts}
                  className="border-none focus:ring-0 bg-transparent px-4 py-3 font-light text-gray-900 min-w-[180px]"
                />
              </div>
            </div>
          </div>

          {/* TODO: keep your existing error/loading/grid blocks here */}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
