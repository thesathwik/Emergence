import React from 'react';

interface NetworkActivity {
  id: string;
  timestamp: string;
  type: 'agent_registered' | 'agent_call' | 'collaboration_started' | 'error' | 'performance_alert';
  sourceAgent: string;
  targetAgent?: string;
  message: string;
  data?: any;
}

interface ActivityFeedProps {
  activity: NetworkActivity[];
  isLoading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activity, isLoading }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'agent_registered':
        return <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>;
      case 'agent_call':
        return <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>;
      case 'collaboration_started':
        return <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>;
      case 'error':
        return <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'performance_alert':
        return <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>;
      default:
        return <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'agent_registered':
        return 'bg-green-50 border-green-200';
      case 'agent_call':
        return 'bg-blue-50 border-blue-200';
      case 'collaboration_started':
        return 'bg-purple-50 border-purple-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'performance_alert':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 24 hours
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityTitle = (activity: NetworkActivity) => {
    switch (activity.type) {
      case 'agent_registered':
        return 'Agent Registered';
      case 'agent_call':
        return 'Agent Communication';
      case 'collaboration_started':
        return 'Collaboration Started';
      case 'error':
        return 'Error Occurred';
      case 'performance_alert':
        return 'Performance Alert';
      default:
        return 'Network Activity';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No recent activity</p>
        <p className="text-xs text-gray-400 mt-1">Agent communications will appear here</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {activity.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-3 ${getActivityColor(item.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {getActivityTitle(item)}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  {item.message}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                    {item.sourceAgent}
                  </span>
                  
                  {item.targetAgent && (
                    <>
                      <span>→</span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        {item.targetAgent}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Additional data display for specific activity types */}
                {item.type === 'agent_call' && item.data && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-mono">{item.data.method}</span>
                    </div>
                    {item.data.duration && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{item.data.duration}ms</span>
                      </div>
                    )}
                    {item.data.status && (
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`inline-flex items-center ${
                          item.data.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.data.status === 'success' ? 
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg> : 
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                          {item.data.status}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {item.type === 'performance_alert' && item.data && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                    {item.data.metric && (
                      <div className="flex justify-between">
                        <span>Metric:</span>
                        <span>{item.data.metric}</span>
                      </div>
                    )}
                    {item.data.value && (
                      <div className="flex justify-between">
                        <span>Value:</span>
                        <span className="font-mono">{item.data.value}</span>
                      </div>
                    )}
                    {item.data.threshold && (
                      <div className="flex justify-between">
                        <span>Threshold:</span>
                        <span>{item.data.threshold}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {item.type === 'collaboration_started' && item.data && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                    {item.data.campaign && (
                      <div className="flex justify-between">
                        <span>Campaign:</span>
                        <span>{item.data.campaign}</span>
                      </div>
                    )}
                    {item.data.contentTypes && (
                      <div className="flex justify-between">
                        <span>Content Types:</span>
                        <span>{item.data.contentTypes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load more indicator - for future implementation */}
      <div className="p-4 text-center border-t border-gray-200">
        <button className="text-sm text-gray-500 hover:text-gray-700">
          View older activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;