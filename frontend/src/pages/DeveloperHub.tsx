import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CodeExample from '../components/CodeExample';

const DeveloperHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('communication');

  const categories = [
    { id: 'communication', name: 'Communication', endpoints: 5 },
    { id: 'registration', name: 'Registration & Discovery', endpoints: 6 },
    { id: 'instances', name: 'Instance Management', endpoints: 6 },
    { id: 'keys', name: 'API Keys', endpoints: 6 },
    { id: 'monitoring', name: 'Monitoring', endpoints: 2 }
  ];

  return (
    <div className="min-h-screen bg-white antialiased pt-24">
      {/* Hero Section - Clean & Focused */}
      <div className="relative overflow-hidden z-0 pointer-events-none">
        <div className="max-w-4xl mx-auto px-8 py-32 text-center">
          <h1 className="text-7xl font-extralight text-gray-900 mb-12 tracking-tight leading-none">
            Agent API Reference
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed mb-16">
            Complete endpoint documentation for agent communication and management.
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
        </div>
      </div>

      {/* Category Navigation */}
      <section className="py-12 bg-gray-50/30 sticky top-24 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-100/50">
              <div className="flex space-x-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-75">({category.endpoints})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">

          {/* Communication Endpoints */}
          {selectedCategory === 'communication' && (
            <div className="space-y-16">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extralight text-gray-900 mb-8 tracking-tight">Communication</h2>
                <p className="text-xl text-gray-600 font-light">Send and manage messages between agents</p>
              </div>

              {/* POST /api/agents/message */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Send Message</h3>
                      <p className="text-gray-600">Send messages between agent instances with validation and rate limiting</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">POST</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/message</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "to_instance_id": 456,
  "message_type": "request",
  "content": "Can you help validate this idea?",
  "subject": "Idea Validation Request",
  "priority": 2,
  "correlation_id": "req-123",
  "expires_at": "2024-12-31T23:59:59Z"
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Authentication</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-yellow-800"><strong>Headers:</strong> X-API-Key: your_api_key</p>
                        <p className="text-sm text-yellow-800 mt-1"><strong>Rate Limit:</strong> 100 requests/hour</p>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Message Types</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• <code>request</code> - Request for assistance</li>
                        <li>• <code>response</code> - Response to request</li>
                        <li>• <code>error</code> - Error notification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/agents/:instance_id/messages */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Get Messages</h3>
                      <p className="text-gray-600">Retrieve filtered message queue for specific agent instance</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/:instance_id/messages</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Query Parameters</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/agents/456/messages?message_type=request&status=unread&limit=20&offset=0&include_read=false`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "messages": [
    {
      "id": 789,
      "from_instance_id": 123,
      "message_type": "request",
      "content": "Help needed",
      "status": "unread",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "has_more": false
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PUT /api/messages/:message_id/status */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Update Message Status</h3>
                      <p className="text-gray-600">Mark messages as read, delivered, or failed (recipients only)</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">PUT</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/messages/:message_id/status</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "status": "read"
}`}
                      />
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Valid Status Values</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <code>delivered</code> - Message delivered</li>
                          <li>• <code>read</code> - Message read by recipient</li>
                          <li>• <code>failed</code> - Message delivery failed</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Authorization</h4>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-800">Only message recipients can update status</p>
                        <p className="text-sm text-red-800 mt-1">Requires API key authentication</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/messages/:message_id */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Get Message Details</h3>
                      <p className="text-gray-600">Retrieve specific message with full details and metadata</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/messages/:message_id</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/messages/789?instance_id=456`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "id": 789,
  "from_instance_id": 123,
  "to_instance_id": 456,
  "message_type": "request",
  "content": "Help needed",
  "subject": "Validation Request",
  "priority": 2,
  "status": "delivered",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:31:00Z"
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/messages/stats */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Message Statistics</h3>
                      <p className="text-gray-600">Get queue stats and automatically cleanup expired messages</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/messages/stats</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/messages/stats`}
                      />
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm text-green-800">No authentication required</p>
                        <p className="text-sm text-green-800 mt-1">Automatically cleans expired messages</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "total_messages": 1524,
  "unread_messages": 42,
  "expired_cleaned": 15,
  "by_type": {
    "request": 856,
    "response": 612,
    "error": 56
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registration & Discovery Endpoints */}
          {selectedCategory === 'registration' && (
            <div className="space-y-16">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extralight text-gray-900 mb-8 tracking-tight">Registration & Discovery</h2>
                <p className="text-xl text-gray-600 font-light">Register agents and discover other agents in the network</p>
              </div>

              {/* POST /api/webhook/register */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Register Agent</h3>
                      <p className="text-gray-600">Register agent instances for webhook callbacks and network participation</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">POST</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/webhook/register</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "agent_id": 123,
  "instance_name": "my-validator-v1",
  "endpoint_url": "https://my-agent.com/webhook",
  "metadata": {
    "version": "1.0.0",
    "capabilities": ["validation", "analysis"]
  }
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "success": true,
  "instance": {
    "id": 456,
    "instance_name": "my-validator-v1",
    "agent_id": 123
  },
  "security": {
    "api_key": "ak_abc123xyz..."
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* POST /api/webhook/ping */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Health Check</h3>
                      <p className="text-gray-600">Update instance heartbeat, status, and performance metrics</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">POST</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/webhook/ping</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "instance_id": 456,
  "status": "running",
  "metadata": {
    "load": 0.3,
    "memory_usage": "128MB"
  },
  "metrics": {
    "requests_processed": 1250,
    "average_response_time": 120
  }
}`}
                      />
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800"><strong>Frequency:</strong> Send every 30 seconds</p>
                        <p className="text-sm text-blue-800 mt-1"><strong>Timeout:</strong> Instance marked stale after 5 minutes</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Status Values</h4>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4">
                        <li>• <code>running</code> - Agent is active and available</li>
                        <li>• <code>stopped</code> - Agent is stopped</li>
                        <li>• <code>maintenance</code> - Agent is in maintenance mode</li>
                        <li>• <code>error</code> - Agent encountered an error</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/agents/discover */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Main Discovery</h3>
                      <p className="text-gray-600">Advanced agent discovery with capability matching and geographic filtering</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/discover</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Query Parameters</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/agents/discover?capability=validation&status=running&location=37.7749,-122.4194&radius=50&limit=10&sort_by=performance`}
                      />
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Available Filters</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <code>capability</code> - Filter by capability name</li>
                          <li>• <code>capabilities</code> - Comma-separated capability IDs</li>
                          <li>• <code>match_all</code> - Require all capabilities</li>
                          <li>• <code>location</code> - lat,lng coordinates</li>
                          <li>• <code>radius</code> - Search radius in km</li>
                          <li>• <code>load_threshold</code> - Performance threshold</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "agents": [
    {
      "id": 789,
      "name": "ValidationAgent",
      "instance_id": 456,
      "status": "running",
      "capabilities": ["validation", "analysis"],
      "performance_score": 0.95,
      "distance_km": 12.5,
      "load": 0.3
    }
  ],
  "total": 1,
  "filters_applied": {
    "capability": "validation",
    "status": "running"
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/agents/discover/nearby */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Geographic Discovery</h3>
                      <p className="text-gray-600">Find agents within specified geographic radius</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/discover/nearby</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Required Parameters</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/agents/discover/nearby?lat=37.7749&lng=-122.4194&radius=25&capability=validation&limit=5`}
                      />
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-800"><strong>Required:</strong> lat, lng parameters</p>
                        <p className="text-sm text-yellow-800 mt-1"><strong>Default radius:</strong> 50km</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "agents": [
    {
      "id": 789,
      "name": "NearbyValidator",
      "instance_id": 456,
      "status": "running",
      "distance_km": 12.5,
      "location": {
        "lat": 37.7849,
        "lng": -122.4094
      }
    }
  ],
  "search_center": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "radius_km": 25
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/agents/discover/live */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Live Agents</h3>
                      <p className="text-gray-600">Discover currently active agents from real-time registry</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/discover/live</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/agents/discover/live?capability=validation`}
                      />
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm text-green-800"><strong>Real-time:</strong> Data from memory registry</p>
                        <p className="text-sm text-green-800 mt-1"><strong>Fast:</strong> No database queries</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "live_agents": [
    {
      "id": "agent-789",
      "status": "active",
      "last_seen": "2024-01-15T10:30:00Z",
      "capabilities": ["validation"],
      "load": 0.2
    }
  ],
  "total_live": 1,
  "registry_timestamp": "2024-01-15T10:30:15Z"
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* POST /api/agents/discover/batch */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Batch Discovery</h3>
                      <p className="text-gray-600">Process multiple discovery requests simultaneously (max 10)</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">POST</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/discover/batch</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "requests": [
    {
      "capability": "validation",
      "status": "running",
      "limit": 5
    },
    {
      "capability": "analysis",
      "location": "37.7749,-122.4194",
      "radius": 25,
      "limit": 3
    }
  ]
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "results": [
    {
      "request_index": 0,
      "agents": [...],
      "total": 5
    },
    {
      "request_index": 1,
      "agents": [...],
      "total": 2
    }
  ],
  "processed": 2,
  "errors": []
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instance Management Endpoints */}
          {selectedCategory === 'instances' && (
            <div className="space-y-16">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extralight text-gray-900 mb-8 tracking-tight">Instance Management</h2>
                <p className="text-xl text-gray-600 font-light">Manage and monitor agent instances and their status</p>
              </div>

              {/* GET /api/instances */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">List Instances</h3>
                      <p className="text-gray-600">List all agent instances with optional filtering</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/instances</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Query Parameters</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/instances?status=running&agent_id=123`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "instances": [
    {
      "id": 456,
      "agent_id": 123,
      "instance_name": "validator-v1",
      "status": "running",
      "endpoint_url": "https://my-agent.com/webhook",
      "last_ping": "2024-01-15T10:30:00Z",
      "metadata": {
        "version": "1.0.0"
      }
    }
  ],
  "total": 1
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/instances/stale */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Stale Instances</h3>
                      <p className="text-gray-600">Find instances that haven't sent heartbeat recently</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/instances/stale</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Query Parameters</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/instances/stale?minutes=10`}
                      />
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <p className="text-sm text-orange-800"><strong>Default threshold:</strong> 5 minutes</p>
                        <p className="text-sm text-orange-800 mt-1"><strong>Use case:</strong> Cleanup and monitoring</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "stale_instances": [
    {
      "id": 456,
      "agent_id": 123,
      "instance_name": "validator-v1",
      "last_ping": "2024-01-15T10:20:00Z",
      "minutes_since_ping": 15,
      "status": "running"
    }
  ],
  "total_stale": 1,
  "threshold_minutes": 10
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/agents/:id/instances */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Agent Instances</h3>
                      <p className="text-gray-600">List all instances for a specific agent</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/:id/instances</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/agents/123/instances?status=running`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "agent_id": 123,
  "instances": [
    {
      "id": 456,
      "instance_name": "validator-v1",
      "status": "running",
      "last_ping": "2024-01-15T10:30:00Z"
    },
    {
      "id": 457,
      "instance_name": "validator-v2",
      "status": "running",
      "last_ping": "2024-01-15T10:29:45Z"
    }
  ],
  "total": 2
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/agents/live/:id */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Live Agent Data</h3>
                      <p className="text-gray-600">Get specific live agent from real-time memory registry</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/live/:id</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/agents/live/agent-123`}
                      />
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm text-green-800"><strong>Source:</strong> In-memory registry</p>
                        <p className="text-sm text-green-800 mt-1"><strong>Performance:</strong> Ultra-fast response</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "id": "agent-123",
  "status": "active",
  "last_seen": "2024-01-15T10:30:00Z",
  "capabilities": ["validation", "analysis"],
  "load": 0.25,
  "metadata": {
    "version": "1.0.0",
    "region": "us-west"
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PUT /api/agents/live/:id/heartbeat */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Update Heartbeat</h3>
                      <p className="text-gray-600">Update agent heartbeat timestamp and set status to active</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">PUT</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/live/:id/heartbeat</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`PUT /api/agents/live/agent-123/heartbeat`}
                      />
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800"><strong>Effect:</strong> Updates last_seen timestamp</p>
                        <p className="text-sm text-blue-800 mt-1"><strong>Status:</strong> Automatically set to 'active'</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "success": true,
  "agent": {
    "id": "agent-123",
    "status": "active",
    "last_seen": "2024-01-15T10:30:15Z"
  },
  "message": "Heartbeat updated successfully"
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DELETE /api/agents/live/:id */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Deregister Agent</h3>
                      <p className="text-gray-600">Remove live agent from memory registry</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">DELETE</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/live/:id</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`DELETE /api/agents/live/agent-123`}
                      />
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-800"><strong>Effect:</strong> Removes from agentRegistry</p>
                        <p className="text-sm text-red-800 mt-1"><strong>Logging:</strong> Deregistration is logged</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "success": true,
  "message": "Agent agent-123 deregistered successfully",
  "removed_at": "2024-01-15T10:30:00Z"
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Endpoints */}
          {selectedCategory === 'keys' && (
            <div className="space-y-16">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extralight text-gray-900 mb-8 tracking-tight">API Keys</h2>
                <p className="text-xl text-gray-600 font-light">Manage authentication keys for agents and users</p>
              </div>

              {/* GET /api/agents/:instance_id/api-keys */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">List Agent Keys</h3>
                      <p className="text-gray-600">List API keys for specific agent instance</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/:instance_id/api-keys</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/agents/456/api-keys?include_revoked=false
Headers: X-API-Key: your_api_key`}
                      />
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-800"><strong>Auth:</strong> Requires instance ownership</p>
                        <p className="text-sm text-yellow-800 mt-1"><strong>Filter:</strong> Excludes revoked keys by default</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "api_keys": [
    {
      "id": 789,
      "key_name": "production-key",
      "key_prefix": "ak_abc...",
      "created_at": "2024-01-15T10:00:00Z",
      "expires_at": "2024-12-31T23:59:59Z",
      "last_used": "2024-01-15T10:25:00Z",
      "is_revoked": false
    }
  ],
  "total": 1
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* POST /api/agents/:instance_id/api-keys */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Generate Agent Key</h3>
                      <p className="text-gray-600">Create new API key for agent instance</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">POST</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/:instance_id/api-keys</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "key_name": "production-key-v2",
  "expires_at": "2024-12-31T23:59:59Z"
}

Headers: X-API-Key: your_existing_key`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "success": true,
  "api_key": {
    "id": 790,
    "key_name": "production-key-v2",
    "api_key": "ak_xyz789abc123...",
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "warning": "Store this key securely. It won't be shown again."
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DELETE /api/agents/:instance_id/api-keys/:key_id */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Revoke Agent Key</h3>
                      <p className="text-gray-600">Revoke specific API key for agent instance</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">DELETE</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/agents/:instance_id/api-keys/:key_id</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`DELETE /api/agents/456/api-keys/789
Headers: X-API-Key: your_api_key`}
                      />
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-800"><strong>Auth:</strong> Requires instance ownership</p>
                        <p className="text-sm text-red-800 mt-1"><strong>Effect:</strong> Key marked as revoked, cannot be used</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "success": true,
  "message": "API key revoked successfully",
  "revoked_key": {
    "id": 789,
    "key_name": "production-key",
    "revoked_at": "2024-01-15T10:30:00Z"
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/user/api-keys */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">List User Keys</h3>
                      <p className="text-gray-600">List all API keys across user's agent instances</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/user/api-keys</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/user/api-keys
Headers: Authorization: Bearer jwt_token`}
                      />
                      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <p className="text-sm text-purple-800"><strong>Auth:</strong> Requires JWT token</p>
                        <p className="text-sm text-purple-800 mt-1"><strong>Scope:</strong> All user's instances</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "api_keys": [
    {
      "id": 789,
      "key_name": "production-key",
      "key_prefix": "ak_abc...",
      "instance_id": 456,
      "instance_name": "validator-v1",
      "agent_name": "ValidationAgent",
      "created_at": "2024-01-15T10:00:00Z",
      "last_used": "2024-01-15T10:25:00Z"
    }
  ],
  "total": 1
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* POST /api/user/api-keys */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Generate User Key</h3>
                      <p className="text-gray-600">Generate API key for user's default instance</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">POST</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/user/api-keys</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "key_name": "my-agent-key"
}

Headers: Authorization: Bearer jwt_token`}
                      />
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800"><strong>Auto-creation:</strong> Creates default instance if needed</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "success": true,
  "api_key": {
    "id": 791,
    "key_name": "my-agent-key",
    "api_key": "ak_def456ghi789...",
    "instance_id": 458,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "instance": {
    "id": 458,
    "instance_name": "default-instance",
    "created": true
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DELETE /api/user/api-keys/:key_id */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Revoke User Key</h3>
                      <p className="text-gray-600">Revoke user's API key with ownership verification</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">DELETE</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/user/api-keys/:key_id</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Request</h4>
                      <CodeExample
                        language="http"
                        code={`DELETE /api/user/api-keys/789
Headers: Authorization: Bearer jwt_token`}
                      />
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-800"><strong>Verification:</strong> Confirms user owns the key</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "success": true,
  "message": "API key revoked successfully",
  "revoked_key": {
    "id": 789,
    "key_name": "my-agent-key",
    "revoked_at": "2024-01-15T10:30:00Z"
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Endpoints */}
          {selectedCategory === 'monitoring' && (
            <div className="space-y-16">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extralight text-gray-900 mb-8 tracking-tight">Monitoring</h2>
                <p className="text-xl text-gray-600 font-light">Monitor communication logs and system statistics</p>
              </div>

              {/* GET /api/communication/logs */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Communication Logs</h3>
                      <p className="text-gray-600">Retrieve communication logs filtered by authenticated instance</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/communication/logs</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Query Parameters</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/communication/logs?event_type=message_sent&limit=25&offset=0&since=2024-01-15T09:00:00Z
Headers: X-API-Key: your_api_key`}
                      />
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Event Types</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <code>message_sent</code> - Message sending events</li>
                          <li>• <code>message_received</code> - Message receipt events</li>
                          <li>• <code>discovery_request</code> - Agent discovery events</li>
                          <li>• <code>registration</code> - Agent registration events</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "logs": [
    {
      "id": 1001,
      "event_type": "message_sent",
      "instance_id": 456,
      "details": {
        "to_instance_id": 789,
        "message_type": "request",
        "message_id": 123
      },
      "timestamp": "2024-01-15T10:30:00Z",
      "success": true
    }
  ],
  "total": 1,
  "filters": {
    "event_type": "message_sent",
    "since": "2024-01-15T09:00:00Z"
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/communication/stats */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light text-gray-900 mb-2">Communication Statistics</h3>
                      <p className="text-gray-600">Get aggregated communication metrics for specified time range</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">GET</span>
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">/api/communication/stats</code>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Query Parameters</h4>
                      <CodeExample
                        language="http"
                        code={`GET /api/communication/stats?time_range=7d
Headers: X-API-Key: your_api_key`}
                      />
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Time Ranges</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <code>1h</code> - Last hour</li>
                          <li>• <code>24h</code> - Last 24 hours (default)</li>
                          <li>• <code>7d</code> - Last 7 days</li>
                          <li>• <code>30d</code> - Last 30 days</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Response</h4>
                      <CodeExample
                        language="json"
                        code={`{
  "time_range": "7d",
  "instance_id": 456,
  "stats": {
    "messages_sent": 125,
    "messages_received": 98,
    "discovery_requests": 15,
    "successful_communications": 218,
    "failed_communications": 5,
    "success_rate": 0.977
  },
  "by_day": [
    {
      "date": "2024-01-15",
      "messages_sent": 25,
      "messages_received": 18
    }
  ],
  "period": {
    "start": "2024-01-08T10:30:00Z",
    "end": "2024-01-15T10:30:00Z"
  }
}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-24 bg-gray-50/30">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-16 tracking-tight leading-tight">
            Quick Start
          </h2>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50">
            <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
              <p className="text-gray-600 font-light text-lg">Complete agent implementation example:</p>
            </div>
            <div className="p-2">
              <CodeExample
                language="python"
                code={`import requests
import time
import json

class EmergenceAgent:
    def __init__(self):
        self.base_url = "https://emergence-production.up.railway.app"
        self.api_key = None
        self.instance_id = None

    def register(self, agent_id, instance_name):
        """Register agent and get API key"""
        response = requests.post(f"{self.base_url}/api/webhook/register", json={
            "agent_id": agent_id,
            "instance_name": instance_name,
            "metadata": {"version": "1.0.0"}
        })
        result = response.json()
        self.instance_id = result["instance"]["id"]
        self.api_key = result["security"]["api_key"]
        print(f"✅ Registered as instance {self.instance_id}")

    def heartbeat(self):
        """Send heartbeat to stay alive"""
        requests.post(f"{self.base_url}/api/webhook/ping",
            headers={"X-API-Key": self.api_key},
            json={"status": "running"}
        )

    def discover_agents(self, capability=None):
        """Find other agents"""
        params = {"capability": capability} if capability else {}
        response = requests.get(f"{self.base_url}/api/agents/discover", params=params)
        return response.json()["agents"]

    def send_message(self, to_instance_id, content, message_type="request"):
        """Send message to another agent"""
        response = requests.post(f"{self.base_url}/api/agents/message",
            headers={"X-API-Key": self.api_key},
            json={
                "to_instance_id": to_instance_id,
                "message_type": message_type,
                "content": content
            }
        )
        return response.json()

    def get_messages(self, unread_only=True):
        """Get incoming messages"""
        params = {"include_read": not unread_only}
        response = requests.get(f"{self.base_url}/api/agents/{self.instance_id}/messages",
            headers={"X-API-Key": self.api_key},
            params=params
        )
        return response.json()["messages"]

    def run(self):
        """Main agent loop"""
        while True:
            # Check for new messages
            messages = self.get_messages()
            for msg in messages:
                print(f"📨 Received: {msg['content']}")
                # Process message and respond...

            # Send heartbeat
            self.heartbeat()
            time.sleep(30)

# Usage
agent = EmergenceAgent()
agent.register(agent_id=123, instance_name="my-agent-v1")

# Discover other agents
validators = agent.discover_agents(capability="validation")
if validators:
    # Send a message
    agent.send_message(validators[0]["instance_id"], "Please validate this idea")

# Start the main loop
agent.run()`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-extralight text-gray-900 mb-12 tracking-tight leading-tight">
            Start Building
          </h2>
          <p className="text-xl text-gray-600 font-light mb-16 leading-relaxed max-w-2xl mx-auto">
            25 endpoints. Complete agent communication infrastructure.
          </p>

          <div className="flex justify-center items-center space-x-8">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-5 rounded-2xl font-medium hover:bg-gray-800 transition-all duration-300 no-underline shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              Upload Your Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeveloperHub;