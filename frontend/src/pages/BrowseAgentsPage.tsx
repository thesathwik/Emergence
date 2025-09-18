import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AgentCard, { AgentCardCompact } from '../components/AgentCard';
import CategoryFilter from '../components/CategoryFilter';
import { useAuth } from '../contexts/AuthContext';
import { useCategoryCounts } from '../hooks/useCategoryCounts';
import { apiService } from '../services/api';
import { Agent, AgentsResponse } from '../types';

const BrowseAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'downloads' | 'date'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMyAgents, setShowMyAgents] = useState(false);
  const { categoryCounts, updateCategoryCounts } = useCategoryCounts();
  const { user, isAuthenticated } = useAuth();

  const fetchAgents = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: AgentsResponse = await apiService.getAgents(category);
      setAgents(response.agents);
      if (!category) {
        updateCategoryCounts(response.agents);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch agents');
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

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSortBy('date');
    setShowMyAgents(false);
    fetchAgents();
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

  // Filter agents based on user selection
  const filteredAgents = agents.filter(agent => {
    if (showMyAgents && user) {
      return agent.user_id === user.id;
    }
    return true;
  });

  const filteredAndSortedAgents = sortAgents(filteredAgents);

  return (
    <div className="min-h-screen bg-white antialiased pt-24">
      {/* Hero Section - Prevent it from eating dropdown clicks */}
      <div className="relative overflow-hidden z-0 pointer-events-none">
        <div className="max-w-6xl mx-auto px-8 py-32 text-center">
          <h1 className="text-7xl font-extralight text-gray-900 mb-12 tracking-tight leading-none">
            Agent Marketplace
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed mb-16">
            Discover intelligent agents crafted by our community. Each one designed to solve real problems, 
            ready to integrate into your workflow.
          </p>
          {/* Perfect divider - Apple-style */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
        </div>
      </div>

      {/* User Welcome Section - Minimal & Elegant */}
      {isAuthenticated && user && (
        <section className="py-16 bg-gray-50/30">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-8 tracking-tight">
              Welcome back, <span className="font-medium">{user.name}</span>
            </h2>
            <div className="flex items-center justify-center space-x-12 mb-12">
              <div className="text-center">
                <div className="text-4xl font-extralight text-gray-900 mb-2">
                  {agents.filter(agent => agent.user_id === user.id).length}
                </div>
                <p className="text-gray-500 font-light">
                  {agents.filter(agent => agent.user_id === user.id).length === 1 ? 'Agent Created' : 'Agents Created'}
                </p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-4xl font-extralight text-gray-900 mb-2">
                  {agents.filter(agent => agent.user_id === user.id).reduce((sum, agent) => sum + agent.download_count, 0)}
                </div>
                <p className="text-gray-500 font-light">Total Downloads</p>
              </div>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-2xl font-light hover:bg-gray-800 transition-all duration-300 no-underline shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create New Agent
            </Link>
          </div>
        </section>
      )}

      {/* Search & Filter Section - Clean Interface */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extralight text-gray-900 mb-8 tracking-tight leading-tight">
              Find Your Perfect Agent
            </h2>
          </div>

          {/* Perfect Search Interface */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-14 pr-20 py-6 bg-gray-50/50 border border-gray-200/50 rounded-3xl text-lg font-light placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300 focus:bg-white transition-all duration-300"
                placeholder="Search agents by name, description, or author..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={handleSearch}
                  className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-light hover:bg-gray-800 transition-all duration-200"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Refined Filter Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-12 mb-16">
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
                  className="border-none focus:ring-0 bg-transparent px-4 py-3 font-light text-gray-900"
                />
              </div>
            </div>

            {/* Sort Control */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 font-light">Sort by</span>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'downloads' | 'date')}
                  className="border-none focus:ring-0 bg-transparent px-4 py-3 font-light text-gray-900 cursor-pointer"
                >
                  <option value="date">Latest</option>
                  <option value="name">Name</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>
            </div>

            {/* My Agents Filter */}
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMyAgents}
                    onChange={(e) => setShowMyAgents(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                    showMyAgents ? 'bg-gray-900' : 'bg-gray-200'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      showMyAgents ? 'transform translate-x-6' : ''
                    }`}></div>
                  </div>
                  <span className="ml-3 text-gray-500 font-light">My Agents Only</span>
                </label>
              </div>
            )}
          </div>

          {/* Active Filters - Minimal Display */}
          {(selectedCategory || searchTerm || showMyAgents) && (
            <div className="flex flex-wrap items-center justify-center space-x-3 mb-12">
              <span className="text-gray-400 font-light text-sm">Active:</span>
              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-light bg-gray-100 text-gray-700">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-light bg-gray-100 text-gray-700">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {showMyAgents && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-light bg-gray-900 text-white">
                  My Agents
                  <button
                    onClick={() => setShowMyAgents(false)}
                    className="ml-2 text-gray-300 hover:text-white"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-400 hover:text-gray-600 font-light underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Loading State - Minimal */}
      {loading && (
        <section className="py-32">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mb-6"></div>
            <p className="text-gray-500 font-light">Loading agents...</p>
          </div>
        </section>
      )}

      {/* Error State - Clean */}
      {error && (
        <section className="py-32">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-4">Something went wrong</h3>
            <p className="text-gray-500 font-light mb-8">{error}</p>
            <button
              onClick={() => fetchAgents()}
              className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-light hover:bg-gray-800 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </section>
      )}

      {/* Results Section - Perfect Typography */}
      {!loading && !error && (
        <section className="pb-32">
          <div className="max-w-6xl mx-auto px-8">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16 space-y-6 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h3 className="text-3xl font-light text-gray-900 mb-2">
                  {filteredAndSortedAgents.length} Agent{filteredAndSortedAgents.length !== 1 ? 's' : ''}
                  {selectedCategory && (
                    <span className="text-gray-500"> in {selectedCategory}</span>
                  )}
                </h3>
                <p className="text-gray-500 font-light">
                  {searchTerm && `Matching "${searchTerm}"`}
                  {showMyAgents && 'Your agents only'}
                </p>
              </div>
              
              {/* View Toggle - Apple Style */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 font-light text-sm">View</span>
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Agents Display - Clean Grid */}
            {filteredAndSortedAgents.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAndSortedAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onDownloadSuccess={() => fetchAgents(selectedCategory)}
                        onDeleteSuccess={() => fetchAgents(selectedCategory)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {filteredAndSortedAgents.map((agent) => (
                      <AgentCardCompact
                        key={agent.id}
                        agent={agent}
                        onDownloadSuccess={() => fetchAgents(selectedCategory)}
                        onDeleteSuccess={() => fetchAgents(selectedCategory)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty State - Elegant */}
            {filteredAndSortedAgents.length === 0 && (
              <div className="text-center py-32">
                <div className="w-24 h-24 bg-gray-50/80 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0-1.125.504-1.125 1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  {searchTerm ? 'No matches found' : 'No agents available'}
                </h3>
                
                <p className="text-gray-500 font-light mb-12 max-w-md mx-auto leading-relaxed">
                  {searchTerm ? (
                    <>We couldn't find any agents matching "<span className="font-medium">{searchTerm}</span>". Try adjusting your search or exploring different categories.</>
                  ) : showMyAgents ? (
                    'You haven\'t created any agents yet. Upload your first agent to get started.'
                  ) : selectedCategory ? (
                    `No agents are currently available in the ${selectedCategory} category.`
                  ) : (
                    'Be the first to contribute an agent to our marketplace.'
                  )}
                </p>

                <div className="space-y-4">
                  <Link
                    to="/upload"
                    className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-2xl font-light hover:bg-gray-800 transition-all duration-300 no-underline shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Agent
                  </Link>
                  
                  {(searchTerm || selectedCategory || showMyAgents) && (
                    <div>
                      <button
                        onClick={handleClearFilters}
                        className="text-gray-500 hover:text-gray-700 font-light underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default BrowseAgentsPage;
