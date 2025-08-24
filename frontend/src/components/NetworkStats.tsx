import React from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'offline' | 'busy';
  lastSeen: string;
  connections: number;
  messagesHandled: number;
  responseTime: number;
}

interface Connection {
  source: string;
  target: string;
  type: 'call' | 'response' | 'collaboration';
  timestamp: string;
  status: 'active' | 'completed' | 'failed';
  method?: string;
  duration?: number;
}

interface NetworkActivity {
  id: string;
  timestamp: string;
  type: 'agent_registered' | 'agent_call' | 'collaboration_started' | 'error' | 'performance_alert';
  sourceAgent: string;
  targetAgent?: string;
  message: string;
  data?: any;
}

interface NetworkStatsProps {
  agents: Agent[];
  connections: Connection[];
  activity: NetworkActivity[];
}

const NetworkStats: React.FC<NetworkStatsProps> = ({ agents, connections, activity }) => {
  // Calculate statistics
  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const busyAgents = agents.filter(agent => agent.status === 'busy').length;
  const idleAgents = agents.filter(agent => agent.status === 'idle').length;
  const offlineAgents = agents.filter(agent => agent.status === 'offline').length;
  
  const activeConnections = connections.filter(conn => conn.status === 'active').length;
  const completedConnections = connections.filter(conn => conn.status === 'completed').length;
  const failedConnections = connections.filter(conn => conn.status === 'failed').length;
  
  const totalMessages = agents.reduce((sum, agent) => sum + agent.messagesHandled, 0);
  const avgResponseTime = agents.length > 0 
    ? agents.reduce((sum, agent) => sum + agent.responseTime, 0) / agents.length 
    : 0;
  
  // Recent activity stats (last 5 minutes)
  const recentActivity = activity.filter(item => {
    const itemTime = new Date(item.timestamp).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return itemTime > fiveMinutesAgo;
  });
  
  const recentErrors = recentActivity.filter(item => item.type === 'error').length;
  const recentCollaborations = recentActivity.filter(item => item.type === 'collaboration_started').length;
  
  // Performance indicators
  const healthScore = agents.length > 0 
    ? Math.round(((activeAgents + busyAgents) / agents.length) * 100)
    : 0;
  
  const errorRate = connections.length > 0 
    ? Math.round((failedConnections / connections.length) * 100)
    : 0;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
    trendUp?: boolean;
  }> = ({ title, value, subtitle, icon, color, trend, trendUp }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className={`text-2xl font-semibold ${color}`}>
              {value}
            </p>
            {subtitle && (
              <p className="ml-2 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {trend && (
            <div className={`flex items-center mt-1 text-xs ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg className={`w-3 h-3 mr-1 ${
                !trendUp ? 'transform rotate-180' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {trend}
            </div>
          )}
        </div>
        <div className={`${color} p-2 rounded-lg bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agents"
          value={agents.length}
          subtitle={`${activeAgents + busyAgents} active`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
          color="text-blue-600"
          trend={agents.length > 0 ? "+2 this hour" : undefined}
          trendUp={true}
        />
        
        <StatCard
          title="Active Connections"
          value={activeConnections}
          subtitle={`${completedConnections} completed`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>}
          color="text-green-600"
          trend={activeConnections > 0 ? "+12 today" : undefined}
          trendUp={true}
        />
        
        <StatCard
          title="Messages Handled"
          value={totalMessages}
          subtitle="across all agents"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>}
          color="text-purple-600"
          trend="+34% vs yesterday"
          trendUp={true}
        />
        
        <StatCard
          title="Avg Response Time"
          value={`${avgResponseTime.toFixed(1)}s`}
          subtitle={avgResponseTime <= 2 ? "Good" : avgResponseTime <= 3 ? "Fair" : "Poor"}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          color={avgResponseTime <= 2 ? "text-green-600" : avgResponseTime <= 3 ? "text-yellow-600" : "text-red-600"}
          trend={avgResponseTime <= 2 ? "-0.3s vs last hour" : "+0.5s vs last hour"}
          trendUp={avgResponseTime <= 2}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Network Health</h3>
            <div className={`flex items-center text-sm ${
              healthScore >= 80 ? 'text-green-600' : 
              healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {healthScore >= 80 ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {healthScore}% Healthy
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium text-green-600">{activeAgents}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Busy</span>
              <span className="font-medium text-yellow-600">{busyAgents}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Idle</span>
              <span className="font-medium text-blue-600">{idleAgents}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Offline</span>
              <span className="font-medium text-gray-600">{offlineAgents}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Connection Quality</h3>
            <div className={`flex items-center text-sm ${
              errorRate <= 5 ? 'text-green-600' : 
              errorRate <= 15 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {errorRate}% Error Rate
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium text-green-600">{activeConnections}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium text-blue-600">{completedConnections}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Failed</span>
              <span className="font-medium text-red-600">{failedConnections}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
            <span className="text-sm text-gray-500">Last 5 minutes</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Events</span>
              <span className="font-medium text-blue-600">{recentActivity.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Collaborations</span>
              <span className="font-medium text-purple-600">{recentCollaborations}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Errors</span>
              <span className={`font-medium ${recentErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {recentErrors}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Agent Calls</span>
              <span className="font-medium text-blue-600">
                {recentActivity.filter(item => item.type === 'agent_call').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Performance Indicators</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              healthScore >= 80 ? 'text-green-600' : 
              healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {healthScore}%
            </div>
            <div className="text-xs text-gray-500">Health Score</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              avgResponseTime <= 2 ? 'text-green-600' : 
              avgResponseTime <= 3 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {avgResponseTime.toFixed(1)}s
            </div>
            <div className="text-xs text-gray-500">Avg Response</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              errorRate <= 5 ? 'text-green-600' : 
              errorRate <= 15 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {errorRate}%
            </div>
            <div className="text-xs text-gray-500">Error Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((recentCollaborations / Math.max(recentActivity.length, 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Collaboration Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;