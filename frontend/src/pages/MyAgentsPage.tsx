import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AgentCard, { AgentCardCompact } from '../components/AgentCard';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Agent, AgentsResponse } from '../types';

const MyAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'downloads' | 'date'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user, isAuthenticated } = useAuth();

  const fetchMyAgents = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response: AgentsResponse = await apiService.getAgents();
      // Filter to only show user's agents
      const myAgents = response.agents.filter(agent => agent.user_id === user.id);
      setAgents(myAgents);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your agents');
      console.error('Error fetching user agents:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyAgents();
    }
  }, [fetchMyAgents, isAuthenticated]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchMyAgents();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response: AgentsResponse = await apiService.searchAgents(searchTerm);
      // Filter search results to only show user's agents
      const myAgents = response.agents.filter(agent => agent.user_id === user?.id);
      setAgents(myAgents);
    } catch (err: any) {
      setError(err.message || 'Failed to search your agents');
      console.error('Error searching user agents:', err);
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

  const filteredAndSortedAgents = sortAgents(agents);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white antialiased pt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center py-20">
            <h1 className="text-3xl font-light text-gray-900 mb-6">My Agents</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your uploaded agents.</p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white antialiased pt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            My Agents
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            Manage and view your uploaded agents. Track their performance and downloads.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/50 p-6 mb-12 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 font-light"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  <span className="text-sm font-light">Search</span>
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'downloads' | 'date')}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
              >
                <option value="date">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="downloads">Most Downloads</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center px-3 py-2 rounded-lg text-xs font-light transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-3 py-2 rounded-lg text-xs font-light transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>

              {/* Upload New Agent Button */}
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-light hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Upload New
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 font-light">Loading your agents...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-600 font-light">{error}</p>
                <button
                  onClick={fetchMyAgents}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-light hover:bg-red-700 transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredAndSortedAgents.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">No agents found</h3>
              <p className="text-gray-600 mb-8 font-light">
                {searchTerm ? "No agents match your search criteria." : "You haven't uploaded any agents yet."}
              </p>
              {!searchTerm && (
                <Link
                  to="/upload"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-light hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Your First Agent
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-8">
                <p className="text-gray-600 font-light">
                  {filteredAndSortedAgents.length === 1
                    ? "1 agent"
                    : `${filteredAndSortedAgents.length} agents`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>

              {/* Agent Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAndSortedAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onDownloadSuccess={() => fetchMyAgents()}
                      onDeleteSuccess={() => fetchMyAgents()}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {filteredAndSortedAgents.map((agent) => (
                    <AgentCardCompact
                      key={agent.id}
                      agent={agent}
                      onDownloadSuccess={() => fetchMyAgents()}
                      onDeleteSuccess={() => fetchMyAgents()}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAgentsPage;