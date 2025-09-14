import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Agent } from '../types';
import { formatFileSize, formatDate, formatNumber } from '../utils/formatters';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ComplianceBadge from './ComplianceBadge';
import ComplianceWarning from './ComplianceWarning';

interface AgentCardProps {
  agent: Agent;
  className?: string;
  onDownloadSuccess?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, className = '', onDownloadSuccess }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Check if this agent belongs to the current user
  const isUserAgent = user && agent.user_id && user.id === agent.user_id;

  // Truncate description to specified length
  const truncateDescription = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Get category badge colors
  const getCategoryBadgeColors = (category: string): string => {
    const colorMap: Record<string, string> = {
      'Marketing': 'bg-blue-50 text-blue-700 border-blue-100',
      'Sales': 'bg-green-50 text-green-700 border-green-100',
      'Customer Support': 'bg-purple-50 text-purple-700 border-purple-100',
      'Delivery': 'bg-orange-50 text-orange-700 border-orange-100',
      'Content Creation': 'bg-pink-50 text-pink-700 border-pink-100',
      'Data Analysis': 'bg-indigo-50 text-indigo-700 border-indigo-100',
      'Research': 'bg-teal-50 text-teal-700 border-teal-100',
      'Education': 'bg-cyan-50 text-cyan-700 border-cyan-100',
      'Healthcare': 'bg-red-50 text-red-700 border-red-100',
      'Finance': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'E-commerce': 'bg-amber-50 text-amber-700 border-amber-100',
      'Other': 'bg-gray-50 text-gray-700 border-gray-100'
    };
    return colorMap[category] || colorMap['Other'];
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloading) return;
    
    // Reset states
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);
    setDownloadSuccess(false);
    
    try {
      // Call download API with progress tracking
      await apiService.downloadAgent(agent.id.toString(), (progress) => {
        setDownloadProgress(progress);
      });
      
      // Show success state
      setDownloadSuccess(true);
      
      // Call callback to refresh parent component
      if (onDownloadSuccess) {
        onDownloadSuccess();
      }
      
      // Reset success state after delay
      setTimeout(() => {
        setDownloadSuccess(false);
        setDownloadProgress(0);
      }, 2000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download agent';
      setDownloadError(errorMessage);
      console.error('Error downloading agent:', err);
      
      // Reset error after delay
      setTimeout(() => {
        setDownloadError(null);
      }, 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Link
      to={`/agents/${agent.id}`}
      className={`block group ${className}`}
    >
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-100/50 hover:border-gray-200/50 transition-all duration-300 overflow-hidden h-full flex flex-col hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
                  {/* Card Header */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
            {/* Title and Category */}
            <div className="flex flex-col mb-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-light text-gray-900 group-hover:text-gray-700 transition-colors duration-200 flex-1 mr-3 tracking-wide">
                  {agent.name}
                </h3>
              </div>
              <div className="flex justify-end items-center space-x-2 flex-wrap">
                {/* Compliance Badge */}
                <ComplianceBadge complianceLevel={agent.compliance_level} />
                
                {/* Your Agent Badge */}
                {isUserAgent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Your Agent
                  </span>
                )}
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-light border ${getCategoryBadgeColors(agent.category)}`}>
                  {agent.category}
                </span>
              </div>
            </div>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 font-light">
            {truncateDescription(agent.description)}
          </p>

          {/* Compliance Warning */}
          <ComplianceWarning 
            complianceLevel={agent.compliance_level} 
            communicationScore={agent.communication_score}
            className="mb-6"
          />

          {/* Author */}
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-light text-gray-900">{agent.author_name}</p>
                <p className="text-xs text-gray-400 font-light">Author</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 pt-6 border-t border-gray-50/50">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
                </svg>
                <span className="text-sm font-light text-gray-900">{formatNumber(agent.download_count)}</span>
              </div>
              <p className="text-xs text-gray-400 font-light">Downloads</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-light text-gray-900">{formatFileSize(agent.file_size)}</span>
              </div>
              <p className="text-xs text-gray-400 font-light">Size</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-light text-gray-900">{formatDate(agent.created_at)}</span>
              </div>
              <p className="text-xs text-gray-400 font-light">Created</p>
            </div>
          </div>
        </div>

        {/* Card Footer with Download Button and Hover Action */}
        <div className="bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100/50 group-hover:bg-gray-50/80 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200 font-light">
              View Details
            </span>
            <div className="flex items-center space-x-3">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center px-4 py-2 text-xs font-light rounded-2xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                title="Download Agent"
              >
                {downloading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-1">
                      {downloadProgress > 0 ? `${Math.round(downloadProgress)}%` : '...'}
                    </span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Done
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </>
                )}
              </button>
              
              {/* Arrow Icon */}
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Error Message */}
          {downloadError && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {downloadError}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Alternative compact version for lists
export const AgentCardCompact: React.FC<AgentCardProps> = ({ agent, className = '', onDownloadSuccess }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Check if this agent belongs to the current user
  const isUserAgent = user && agent.user_id && user.id === agent.user_id;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloading) return;
    
    // Reset states
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);
    setDownloadSuccess(false);
    
    try {
      // Call download API with progress tracking
      await apiService.downloadAgent(agent.id.toString(), (progress) => {
        setDownloadProgress(progress);
      });
      
      // Show success state
      setDownloadSuccess(true);
      
      // Call callback to refresh parent component
      if (onDownloadSuccess) {
        onDownloadSuccess();
      }
      
      // Reset success state after delay
      setTimeout(() => {
        setDownloadSuccess(false);
        setDownloadProgress(0);
      }, 2000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download agent';
      setDownloadError(errorMessage);
      console.error('Error downloading agent:', err);
      
      // Reset error after delay
      setTimeout(() => {
        setDownloadError(null);
      }, 3000);
    } finally {
      setDownloading(false);
    }
  };
  const truncateDescription = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const getCategoryBadgeColors = (category: string): string => {
    const colorMap: Record<string, string> = {
      'AI': 'bg-blue-100 text-blue-800',
      'Automation': 'bg-green-100 text-green-800',
      'Testing': 'bg-yellow-100 text-yellow-800',
      'Data Processing': 'bg-purple-100 text-purple-800',
      'Web Scraping': 'bg-orange-100 text-orange-800',
      'Chatbot': 'bg-pink-100 text-pink-800',
      'Machine Learning': 'bg-indigo-100 text-indigo-800',
      'Natural Language Processing': 'bg-teal-100 text-teal-800',
      'Computer Vision': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colorMap[category] || colorMap['Other'];
  };

  return (
    <Link
      to={`/agents/${agent.id}`}
      className={`block group ${className}`}
    >
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:border-gray-200/50 p-4 sm:p-6 hover:-translate-y-1">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col mb-2">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-light text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                  {agent.name}
                </h3>
              </div>
              <div className="flex justify-end items-center space-x-2 flex-wrap">
                {/* Compliance Badge */}
                <ComplianceBadge complianceLevel={agent.compliance_level} className="text-xs" />
                
                {/* Your Agent Badge */}
                {isUserAgent && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Yours
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-light ${getCategoryBadgeColors(agent.category)}`}>
                  {agent.category}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mb-2 font-light">
              {truncateDescription(agent.description)}
            </p>
            
            {/* Compliance Warning - Compact */}
            <ComplianceWarning 
              complianceLevel={agent.compliance_level} 
              communicationScore={agent.communication_score}
              className="mb-3 text-xs"
            />
            
            <div className="flex items-center justify-between text-xs text-gray-400 font-light">
              <span>by {agent.author_name}</span>
              <div className="flex items-center space-x-3">
                <span>{agent.download_count} downloads</span>
                <div className="flex items-center space-x-2">
                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center px-2 py-1 text-xs font-light rounded-xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Download Agent"
                  >
                                      {downloading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-1">
                        {downloadProgress > 0 ? `${Math.round(downloadProgress)}%` : '...'}
                      </span>
                    </>
                  ) : downloadSuccess ? (
                      <>
                        <svg className="w-2 h-2 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Done
                      </>
                    ) : (
                      <>
                        <svg className="w-2 h-2 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        DL
                      </>
                    )}
                  </button>
                  
                  <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {downloadError && (
              <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                {downloadError}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AgentCard;
