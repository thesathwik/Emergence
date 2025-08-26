import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Agent, AgentsResponse } from '../types';
import AgentCard from '../components/AgentCard';
import CategoryFilter from '../components/CategoryFilter';
import { useCategoryCounts } from '../hooks/useCategoryCounts';

const HomePage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { categoryCounts, updateCategoryCounts } = useCategoryCounts();

  const fetchAgents = useCallback(async (category?: string) => {
    console.log('fetchAgents called with category:', category);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Making API call to getAgents...');
      const response: AgentsResponse = await apiService.getAgents(category);
      console.log('API response received:', response);
      setAgents(response.agents);
      
      // Update category counts when fetching all agents
      if (!category) {
        updateCategoryCounts(response.agents);
      }
    } catch (err: any) {
      console.error('Error in fetchAgents:', err);
      setError(err.userMessage || err.message || 'Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      console.log('Setting loading to false');
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
    <div className="min-h-screen bg-white antialiased">
      {/* Hero Section - Perfect Typography & Spacing */}
      <div className="relative overflow-hidden">
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
              className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-5 rounded-2xl font-light hover:bg-gray-800 transition-all duration-300 no-underline shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Explore Marketplace
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-10 py-5 rounded-2xl font-light hover:bg-gray-50 hover:shadow-sm transition-all duration-300 no-underline"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Agent
            </Link>
          </div>

          {/* Perfect divider - Apple-style */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
        </div>
      </div>

      {/* Featured Agents Section - Clean Design */}
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

          {/* Filter Controls - Minimal Design */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12 space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <div className="text-3xl font-extralight text-gray-900 mb-2">
                {agents.length} Agent{agents.length !== 1 ? 's' : ''}
              </div>
              {selectedCategory && (
                <p className="text-gray-500 font-light">in {selectedCategory}</p>
              )}
            </div>
            
            {/* Category Filter */}
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

          {/* Active Filter - Minimal Display */}
          {selectedCategory && (
            <div className="flex items-center justify-center mb-12">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-light bg-gray-100 text-gray-700">
                {selectedCategory}
                <button
                  onClick={handleClearFilter}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}

          {/* Error Display - Minimal & Elegant */}
          {error && (
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-red-50/30 border border-red-100/50 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 bg-red-100/50 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-extralight text-gray-900 text-center mb-3 tracking-wide">
                  Unable to Load Agents
                </h3>
                <p className="text-gray-600 text-center font-light mb-8">
                  {error}
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => fetchAgents(selectedCategory || undefined)}
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl font-light hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Try Again
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex items-center px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl font-light hover:bg-gray-50 transition-all duration-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State - Clean & Minimal */}
          {loading && (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="mb-8">
                <div className="inline-flex h-16 w-16 bg-gray-50/50 rounded-3xl items-center justify-center mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
                </div>
                <h3 className="text-3xl font-extralight text-gray-900 mb-4 tracking-wide">
                  Loading Agents
                </h3>
                <p className="text-gray-500 font-light text-lg">
                  Discovering the latest intelligent agents
                </p>
              </div>
              
              {/* Elegant Skeleton Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-16">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-100/50 rounded-3xl aspect-[4/3] mb-6"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100/50 rounded-full w-3/4 mx-auto"></div>
                      <div className="h-3 bg-gray-100/50 rounded-full w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agents Grid - Perfect Spacing */}
          {!loading && agents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {agents.map((agent) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  onDownloadSuccess={() => fetchAgents(selectedCategory || undefined)}
                />
              ))}
            </div>
          )}

          {/* Empty State - Elegant & Inspiring */}
          {!loading && agents.length === 0 && !error && (
            <div className="max-w-2xl mx-auto text-center py-24">
              <div className="mb-12">
                <div className="mx-auto h-24 w-24 bg-gray-50/50 rounded-3xl flex items-center justify-center mb-8">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-4xl font-extralight text-gray-900 mb-6 tracking-wide">
                  {selectedCategory ? `No ${selectedCategory} Agents` : 'No Agents Yet'}
                </h3>
                <p className="text-xl text-gray-500 font-light leading-relaxed mb-12">
                  {selectedCategory 
                    ? `We haven't found any agents in the ${selectedCategory} category. Try exploring other categories or be the first to contribute.`
                    : 'Be the first to contribute an intelligent agent to our marketplace and help shape the future of AI collaboration.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-2xl font-light hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02] no-underline"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Your Agent
                  </Link>
                  {selectedCategory && (
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="inline-flex items-center px-8 py-4 border border-gray-200 text-gray-700 rounded-2xl font-light hover:bg-gray-50 hover:shadow-sm transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-13.5-7.5h21" />
                      </svg>
                      Browse All Categories
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
