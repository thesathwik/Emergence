import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Agent, AgentsResponse } from '../types';
import AgentCard from '../components/AgentCard';
import CategoryFilter from '../components/CategoryFilter';
import ErrorDisplay from '../components/ErrorDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { SkeletonCard } from '../components/Skeleton';
import { useCategoryCounts } from '../hooks/useCategoryCounts';

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
      
      // Update category counts when fetching all agents
      if (!category) {
        updateCategoryCounts(response.agents);
      }
    } catch (err: any) {
      setError(err.userMessage || err.message || 'Failed to fetch agents');
      console.error('Error fetching agents:', err);
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
    <div>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-wide">
            AI Agents
          </h1>
          <p className="text-xl text-gray-500 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
            Discover intelligent agents designed to enhance your workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="inline-flex items-center px-8 py-4 border border-gray-200 text-base font-light rounded-2xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Upload Agent
            </Link>
            <Link
              to="/agents"
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-base font-light rounded-2xl text-white hover:bg-gray-800 shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Browse All
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-light text-gray-900 tracking-wide">AI Agents</h2>
            <p className="text-base text-gray-500 mt-2 font-light">
              {agents.length > 0 ? `${agents.length} agent${agents.length !== 1 ? 's' : ''} available` : 'Discover amazing AI agents'}
              {selectedCategory && (
                <span className="ml-2 text-gray-600 font-light">
                  • Filtered by: {selectedCategory}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <CategoryFilter
              variant="dropdown"
              showCount={true}
              onCategoryChange={handleCategoryChange}
              selectedCategory={selectedCategory}
              categoryCounts={categoryCounts}
              className="min-w-[200px]"
            />

          </div>
        </div>

        {/* Active Filter Display */}
        {selectedCategory && (
          <div className="mt-6 bg-gray-50/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span className="text-sm font-light text-gray-700">
                  Active Filter: <span className="font-medium">{selectedCategory}</span>
                </span>
                <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-light">
                  {agents.length} result{agents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={handleClearFilter}
                className="text-sm text-gray-500 hover:text-gray-700 font-light flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filter</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={{ message: error }}
          title="Error loading agents"
          onRetry={() => fetchAgents(selectedCategory || undefined)}
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600 text-lg">Loading agents</p>
            <p className="text-gray-500 text-sm mt-1">Please wait while we fetch the latest data</p>
          </div>
          
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      )}

      {/* Agents Grid */}
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

      {/* Empty State */}
      {!loading && agents.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="mx-auto h-20 w-20 bg-gray-50/50 rounded-3xl flex items-center justify-center mb-8">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-3 tracking-wide">
              {selectedCategory ? `No agents in ${selectedCategory}` : 'No agents found'}
            </h3>
            <p className="text-gray-500 mb-10 font-light">
              {selectedCategory 
                ? `Try selecting a different category or upload a new agent.`
                : 'Get started by uploading your first AI agent.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center px-6 py-3 border border-gray-200 text-sm font-light rounded-2xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Upload Agent
              </Link>
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange('')}
                  className="inline-flex items-center px-6 py-3 border border-gray-200 text-sm font-light rounded-2xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  View All Categories
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
