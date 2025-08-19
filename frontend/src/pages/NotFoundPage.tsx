import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mx-auto h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-400">404</div>
              <div className="text-sm text-gray-500 mt-1">Page Not Found</div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">What would you like to do?</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleGoBack}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Homepage
                </button>
              </div>
            </div>

            {/* Popular Pages */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Pages</h3>
              <div className="space-y-2">
                <Link
                  to="/"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Home</div>
                      <div className="text-xs text-gray-500">Browse AI agents and get started</div>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/agents"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Browse Agents</div>
                      <div className="text-xs text-gray-500">Discover and download AI agents</div>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/upload"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Upload Agent</div>
                      <div className="text-xs text-gray-500">Share your AI agent with the community</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Can't find what you're looking for?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Try searching for agents or browse our categories to find what you need.
                  </p>
                  <Link
                    to="/agents"
                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Agents
                  </Link>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Still having trouble? We're here to help.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <a
                  href="mailto:support@emergence.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Contact Support
                </a>
                <a
                  href="/help"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
