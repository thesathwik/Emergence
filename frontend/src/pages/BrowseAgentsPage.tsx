import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Agent, AgentsResponse } from '../types';
import AgentCard, { AgentCardCompact } from '../components/AgentCard';
import CategoryFilter from '../components/CategoryFilter';
import { useCategoryCounts } from '../hooks/useCategoryCounts';

const BrowseAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'downloads' | 'date'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { categoryCounts, updateCategoryCounts } = useCategoryCounts();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async (category?: string) => {
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
      setError(err.message || 'Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchAgents(category || undefined);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSortBy('date');
    fetchAgents();
  };

  const handleRefresh = () => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      fetchAgents(selectedCategory || undefined);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchAgents(selectedCategory);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response: AgentsResponse = await apiService.searchAgents(searchTerm);
      setAgents(response.agents);
    } catch (err: any) {
      setError(err.message || 'Failed to search agents');
      console.error('Error searching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (agentId: string) => {
    try {
      await apiService.downloadAgent(agentId);
      // Refresh the agents list to get updated download count
      fetchAgents(selectedCategory);
      alert('Download successful!');
    } catch (err: any) {
      setError(err.message || 'Failed to download agent');
      console.error('Error downloading agent:', err);
    }
  };

  const sortAgents = (agentsToSort: Agent[]) => {
    return [...agentsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'downloads':
          return b.download_count - a.download_count;
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedAgents = sortAgents(agents);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse AI Agents</h1>
        <p className="text-gray-600">Discover and download AI agents from our community</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Agents
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by name, description, or author..."
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <CategoryFilter
              variant="dropdown"
              showCount={true}
              onCategoryChange={handleCategoryChange}
              selectedCategory={selectedCategory}
              categoryCounts={categoryCounts}
              className="w-full"
            />
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'downloads' | 'date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date Created</option>
              <option value="name">Name</option>
              <option value="downloads">Downloads</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory || searchTerm) && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear All</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading agents...</p>
        </div>
      )}

      {/* Results Count and View Toggle */}
      {!loading && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedAgents.length} agent{filteredAndSortedAgents.length !== 1 ? 's' : ''}
            {selectedCategory && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm font-medium rounded-l-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm font-medium rounded-r-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agents Display */}
      {!loading && filteredAndSortedAgents.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedAgents.map((agent) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  onDownloadSuccess={() => fetchAgents(selectedCategory)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {filteredAndSortedAgents.map((agent) => (
                <AgentCardCompact 
                  key={agent.id} 
                  agent={agent} 
                  onDownloadSuccess={() => fetchAgents(selectedCategory)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredAndSortedAgents.length === 0 && !error && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? `No agents matching "${searchTerm}".` : 'No agents available.'}
          </p>
          <div className="mt-6">
            <Link
              to="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Upload Agent
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseAgentsPage;
