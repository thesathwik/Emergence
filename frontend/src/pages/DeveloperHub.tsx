import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CodeExample from '../components/CodeExample';
import MarkdownContent from '../components/MarkdownContent';

interface Section {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const DeveloperHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      description: 'Welcome to the Emergence Developer Hub'
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      description: 'Quick start guide and setup'
    },
    {
      id: 'agent-structure',
      title: 'Agent Structure',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      description: 'How to structure your AI agents'
    },
    {
      id: 'communication-api',
      title: 'Communication API',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      description: 'API communication patterns'
    },
    {
      id: 'api-docs',
      title: 'API Documentation',
      icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      description: 'Complete API reference and examples'
    },
    {
      id: 'authentication',
      title: 'Authentication',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      description: 'JWT-based authentication system'
    },
    {
      id: 'upload-guide',
      title: 'Upload Guide',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
      description: 'How to upload and manage AI agents'
    },
    {
      id: 'examples',
      title: 'Code Examples',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      description: 'Sample code and integration examples'
    },
    {
      id: 'sdk',
      title: 'SDK & Libraries',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      description: 'Client libraries and SDKs'
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z',
      description: 'Get help and support'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Emergence Developer Hub</h2>
              <p className="text-lg text-gray-700 mb-6">
                Build, deploy, and manage AI agents with our comprehensive platform. 
                Get started with our powerful APIs and tools.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h3>
                  <p className="text-gray-600">Get up and running in minutes with our simple setup guide.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">API First</h3>
                  <p className="text-gray-600">RESTful APIs designed for modern applications.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible</h3>
                  <p className="text-gray-600">Customize and extend to fit your needs.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'getting-started':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h2>Getting Started with Emergence</h2>
                <p>
                  Welcome to Emergence! This guide will help you get up and running with our AI agent platform 
                  in just a few minutes. Follow these steps to start building and deploying your first AI agent.
                </p>

                <h3>Prerequisites</h3>
                <ul>
                  <li>Node.js 16+ or Python 3.8+</li>
                  <li>A text editor or IDE</li>
                  <li>Git (optional, for version control)</li>
                  <li>An Emergence account (sign up at the top right)</li>
                </ul>

                <h3>Step 1: Authentication Setup</h3>
                <p>First, you'll need to authenticate with the Emergence platform:</p>
              </MarkdownContent>

              <CodeExample
                title="Register and Login"
                language="javascript"
                code={`// Register a new account
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Your Name',
    email: 'your-email@example.com',
    password: 'secure-password'
  })
});

const { token, user } = await response.json();

// Store your token for subsequent requests
localStorage.setItem('authToken', token);`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Step 2: Install the SDK</h3>
                <p>Choose your preferred programming language and install our SDK:</p>
              </MarkdownContent>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <CodeExample
                  title="Node.js/JavaScript"
                  language="bash"
                  code={`npm install @emergence/sdk

# or with yarn
yarn add @emergence/sdk`}
                />

                <CodeExample
                  title="Python"
                  language="bash"
                  code={`pip install emergence-sdk

# or with conda
conda install emergence-sdk`}
                />
              </div>

              <MarkdownContent>
                <h3>Step 3: Your First API Call</h3>
                <p>Let's make your first API call to list available agents:</p>
              </MarkdownContent>

              <CodeExample
                title="List All Agents"
                language="javascript"
                code={`import { EmergenceClient } from '@emergence/sdk';

const client = new EmergenceClient({
  token: 'your-auth-token-here'
});

// Fetch all available agents
const agents = await client.agents.list();
console.log('Available agents:', agents);

// Get a specific agent
const agent = await client.agents.get('agent-id');
console.log('Agent details:', agent);`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Step 4: Upload Your First Agent</h3>
                <p>Now let's upload your first AI agent to the platform:</p>
              </MarkdownContent>

              <CodeExample
                title="Upload Agent"
                language="javascript"
                code={`// Prepare your agent files in a ZIP format
const formData = new FormData();
formData.append('file', agentZipFile);
formData.append('name', 'My First Agent');
formData.append('description', 'A simple AI agent for demonstration');
formData.append('category', 'Utility');
formData.append('author_name', 'Your Name');

// Upload the agent
const response = await fetch('/api/agents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const result = await response.json();
console.log('Agent uploaded:', result.agent);`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Next Steps</h3>
                <p>Congratulations! You've successfully:</p>
                <ul>
                  <li>Set up authentication with Emergence</li>
                  <li>Installed the SDK</li>
                  <li>Made your first API call</li>
                  <li>Uploaded your first agent</li>
                </ul>

                <p>Now you're ready to explore more advanced features:</p>
                <ul>
                  <li><strong>Agent Structure</strong> - Learn how to properly structure your AI agents</li>
                  <li><strong>Communication API</strong> - Implement real-time communication patterns</li>
                  <li><strong>Advanced Examples</strong> - Explore complex integration scenarios</li>
                </ul>

                <blockquote>
                  <strong>Tip:</strong> Check out our GitHub repository for complete example projects 
                  and templates to get started even faster!
                </blockquote>
              </MarkdownContent>
            </div>
          </div>
        );

      case 'agent-structure':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h2>Agent Structure Guide</h2>
                <p>
                  Understanding how to properly structure your AI agents is crucial for creating 
                  maintainable, scalable, and efficient applications. This guide covers the 
                  recommended patterns and best practices.
                </p>

                <h3>Basic Agent Structure</h3>
                <p>Every Emergence agent follows a standard directory structure:</p>
              </MarkdownContent>

              <CodeExample
                title="Agent Directory Structure"
                language="bash"
                code={`my-agent/
├── agent.json          # Agent configuration
├── main.py             # Entry point
├── requirements.txt    # Dependencies
├── README.md          # Documentation
├── src/               # Source code
│   ├── __init__.py
│   ├── agent.py       # Main agent logic
│   ├── utils.py       # Helper functions
│   └── models/        # AI models
├── tests/             # Test files
│   ├── test_agent.py
│   └── test_utils.py
└── assets/            # Static files
    ├── prompts/
    └── templates/`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Agent Configuration (agent.json)</h3>
                <p>The configuration file defines your agent's metadata and capabilities:</p>
              </MarkdownContent>

              <CodeExample
                title="agent.json"
                language="json"
                code={`{
  "name": "my-agent",
  "version": "1.0.0",
  "description": "A sample AI agent for demonstration",
  "author": "Your Name",
  "category": "Utility",
  "entry_point": "main.py",
  "runtime": {
    "type": "python",
    "version": "3.9+"
  },
  "capabilities": [
    "text-processing",
    "api-integration",
    "real-time-communication"
  ],
  "config": {
    "max_memory": "512MB",
    "timeout": 30,
    "environment": "production"
  },
  "dependencies": {
    "external": ["openai", "requests", "numpy"],
    "internal": []
  },
  "api": {
    "endpoints": [
      {
        "path": "/process",
        "method": "POST",
        "description": "Process text input"
      }
    ]
  }
}`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Main Entry Point</h3>
                <p>Your agent's main entry point should implement the core interface:</p>
              </MarkdownContent>

              <CodeExample
                title="main.py"
                language="python"
                code={`from src.agent import MyAgent
from emergence import Agent, Context, Message

class MyAgent(Agent):
    def __init__(self, config):
        super().__init__(config)
        self.model = self.load_model()
        
    def load_model(self):
        """Load your AI model here"""
        pass
    
    async def process(self, context: Context, message: Message):
        """Main processing function"""
        try:
            # Process the incoming message
            result = await self.model.process(message.content)
            
            # Return response
            return {
                "status": "success",
                "result": result,
                "metadata": {
                    "processing_time": context.elapsed_time,
                    "model_version": self.model.version
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def health_check(self):
        """Health check endpoint"""
        return {
            "status": "healthy",
            "version": self.config.version,
            "uptime": self.uptime
        }

# Initialize the agent
if __name__ == "__main__":
    config = load_config("agent.json")
    agent = MyAgent(config)
    agent.start()`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Agent Communication Patterns</h3>
                <p>Implement these patterns for robust agent communication:</p>

                <h4>1. Request-Response Pattern</h4>
                <p>For synchronous operations where you need immediate results:</p>
              </MarkdownContent>

              <CodeExample
                title="Request-Response Pattern"
                language="python"
                code={`async def handle_request(self, request):
    """Handle synchronous requests"""
    # Validate input
    if not self.validate_input(request):
        raise ValueError("Invalid input format")
    
    # Process request
    result = await self.process_sync(request.data)
    
    # Return immediate response
    return {
        "request_id": request.id,
        "result": result,
        "timestamp": datetime.utcnow().isoformat()
    }`}
                className="mb-6"
              />

              <MarkdownContent>
                <h4>2. Event-Driven Pattern</h4>
                <p>For asynchronous operations and real-time updates:</p>
              </MarkdownContent>

              <CodeExample
                title="Event-Driven Pattern"
                language="python"
                code={`async def handle_event(self, event):
    """Handle asynchronous events"""
    # Process event in background
    task_id = await self.queue_task(event)
    
    # Emit progress events
    await self.emit("task.started", {
        "task_id": task_id,
        "estimated_duration": self.estimate_duration(event)
    })
    
    try:
        result = await self.process_async(event.data)
        await self.emit("task.completed", {
            "task_id": task_id,
            "result": result
        })
    except Exception as e:
        await self.emit("task.failed", {
            "task_id": task_id,
            "error": str(e)
        })`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Best Practices</h3>
                <ul>
                  <li><strong>Error Handling</strong> - Always implement comprehensive error handling</li>
                  <li><strong>Logging</strong> - Use structured logging for debugging and monitoring</li>
                  <li><strong>Testing</strong> - Write unit tests for all core functionality</li>
                  <li><strong>Documentation</strong> - Document your agent's API and usage</li>
                  <li><strong>Security</strong> - Validate all inputs and sanitize outputs</li>
                  <li><strong>Performance</strong> - Optimize for low latency and high throughput</li>
                </ul>

                <h3>Common Patterns</h3>
                <ul>
                  <li><strong>State Management</strong> - Use context objects to maintain state</li>
                  <li><strong>Configuration</strong> - Make your agent configurable via environment variables</li>
                  <li><strong>Caching</strong> - Implement caching for expensive operations</li>
                  <li><strong>Rate Limiting</strong> - Protect your agent from abuse</li>
                </ul>
              </MarkdownContent>
            </div>
          </div>
        );

      case 'communication-api':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h2>Communication API</h2>
                <p>
                  The Communication API enables real-time interaction between clients and agents, 
                  supporting multiple communication patterns including WebSockets, Server-Sent Events, 
                  and traditional HTTP requests.
                </p>

                <h3>Connection Types</h3>
                <p>Emergence supports three primary communication methods:</p>

                <h4>1. WebSocket Connections</h4>
                <p>For bidirectional, real-time communication:</p>
              </MarkdownContent>

              <CodeExample
                title="WebSocket Client"
                language="javascript"
                code={`import { EmergenceSocket } from '@emergence/sdk';

const socket = new EmergenceSocket({
  url: 'wss://api.emergence.com/ws',
  token: 'your-auth-token',
  agent_id: 'agent-123'
});

// Connect to agent
await socket.connect();

// Send message to agent
socket.send({
  type: 'message',
  content: 'Hello, agent!',
  metadata: {
    user_id: 'user-456',
    session_id: 'session-789'
  }
});

// Listen for responses
socket.on('message', (response) => {
  console.log('Agent response:', response);
});

// Handle connection events
socket.on('connected', () => {
  console.log('Connected to agent');
});

socket.on('disconnected', () => {
  console.log('Disconnected from agent');
});

socket.on('error', (error) => {
  console.error('Connection error:', error);
});`}
                className="mb-6"
              />

              <MarkdownContent>
                <h4>2. Server-Sent Events (SSE)</h4>
                <p>For one-way streaming from agent to client:</p>
              </MarkdownContent>

              <CodeExample
                title="Server-Sent Events"
                language="javascript"
                code={`// Establish SSE connection
const eventSource = new EventSource(
  '/api/agents/agent-123/stream?token=your-auth-token'
);

// Listen for different event types
eventSource.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('New message:', data);
});

eventSource.addEventListener('status', (event) => {
  const status = JSON.parse(event.data);
  console.log('Agent status:', status);
});

eventSource.addEventListener('error', (event) => {
  console.error('Stream error:', event);
});

// Send data via HTTP POST while listening to SSE
async function sendMessage(content) {
  await fetch('/api/agents/agent-123/message', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-auth-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: content,
      stream: true  // Enable streaming response
    })
  });
}`}
                className="mb-6"
              />

              <MarkdownContent>
                <h4>3. HTTP Long Polling</h4>
                <p>For environments where WebSockets aren't available:</p>
              </MarkdownContent>

              <CodeExample
                title="Long Polling"
                language="javascript"
                code={`class LongPollingClient {
  constructor(agentId, token) {
    this.agentId = agentId;
    this.token = token;
    this.isPolling = false;
  }

  async startPolling() {
    this.isPolling = true;
    
    while (this.isPolling) {
      try {
        const response = await fetch(\`/api/agents/\${this.agentId}/poll\`, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${this.token}\`
          },
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          this.handleMessage(data);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Polling error:', error);
          await this.delay(5000); // Wait 5 seconds before retry
        }
      }
    }
  }

  stopPolling() {
    this.isPolling = false;
  }

  handleMessage(data) {
    console.log('Received message:', data);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Message Formats</h3>
                <p>All communication follows a standardized message format:</p>
              </MarkdownContent>

              <CodeExample
                title="Standard Message Format"
                language="json"
                code={`{
  "id": "msg-12345",
  "type": "message",
  "timestamp": "2024-01-20T10:30:00Z",
  "sender": {
    "id": "user-456",
    "type": "user"
  },
  "recipient": {
    "id": "agent-123",
    "type": "agent"
  },
  "content": {
    "text": "Hello, how can you help me?",
    "attachments": [],
    "metadata": {
      "priority": "normal",
      "requires_response": true
    }
  },
  "context": {
    "session_id": "session-789",
    "conversation_id": "conv-101",
    "previous_message_id": "msg-12344"
  }
}`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Agent Response Format</h3>
                <p>Agents respond using a consistent format:</p>
              </MarkdownContent>

              <CodeExample
                title="Agent Response Format"
                language="json"
                code={`{
  "id": "resp-67890",
  "type": "response",
  "timestamp": "2024-01-20T10:30:05Z",
  "in_response_to": "msg-12345",
  "sender": {
    "id": "agent-123",
    "type": "agent",
    "name": "CustomerCare AI"
  },
  "content": {
    "text": "I'd be happy to help! What specific information are you looking for?",
    "suggestions": [
      "Product information",
      "Technical support",
      "Account management"
    ],
    "attachments": []
  },
  "metadata": {
    "confidence": 0.95,
    "processing_time": 1200,
    "model_version": "v2.1",
    "capabilities_used": ["nlp", "intent-recognition"]
  },
  "status": "completed"
}`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Error Handling</h3>
                <p>Implement robust error handling for reliable communication:</p>
              </MarkdownContent>

              <CodeExample
                title="Error Handling Example"
                language="javascript"
                code={`class CommunicationManager {
  constructor(config) {
    this.config = config;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async sendMessage(message) {
    try {
      const response = await this.attemptSend(message);
      this.retryCount = 0; // Reset on success
      return response;
    } catch (error) {
      return this.handleError(error, message);
    }
  }

  async handleError(error, originalMessage) {
    console.error('Communication error:', error);

    // Handle different error types
    switch (error.code) {
      case 'NETWORK_ERROR':
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          await this.delay(Math.pow(2, this.retryCount) * 1000);
          return this.sendMessage(originalMessage);
        }
        break;
        
      case 'AUTH_ERROR':
        await this.refreshAuth();
        return this.sendMessage(originalMessage);
        
      case 'RATE_LIMITED':
        const retryAfter = error.retryAfter || 60;
        await this.delay(retryAfter * 1000);
        return this.sendMessage(originalMessage);
        
      default:
        throw error;
    }
    
    throw new Error(\`Failed after \${this.maxRetries} retries\`);
  }
}`}
                className="mb-6"
              />

              <MarkdownContent>
                <h3>Best Practices</h3>
                <ul>
                  <li><strong>Connection Management</strong> - Implement proper connection lifecycle management</li>
                  <li><strong>Heartbeats</strong> - Use ping/pong messages to detect connection issues</li>
                  <li><strong>Reconnection</strong> - Implement exponential backoff for reconnection attempts</li>
                  <li><strong>Message Queuing</strong> - Queue messages during disconnection periods</li>
                  <li><strong>Authentication</strong> - Refresh tokens before they expire</li>
                  <li><strong>Rate Limiting</strong> - Respect rate limits to avoid throttling</li>
                </ul>
              </MarkdownContent>
            </div>
          </div>
        );

      case 'api-docs':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">API Documentation</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Base URL</h3>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                    https://api.emergence.com/v1
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 mb-2">All API requests require authentication using JWT tokens:</p>
                    <div className="font-mono text-sm bg-gray-100 p-3 rounded">
                      Authorization: Bearer YOUR_JWT_TOKEN
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                        <code className="font-mono text-sm">/api/agents</code>
                      </div>
                      <p className="text-gray-600 text-sm">Retrieve all AI agents</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                        <code className="font-mono text-sm">/api/agents</code>
                      </div>
                      <p className="text-gray-600 text-sm">Upload a new AI agent (requires authentication)</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                        <code className="font-mono text-sm">/api/agents/:id</code>
                      </div>
                      <p className="text-gray-600 text-sm">Get specific agent details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'authentication':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">JWT-Based Authentication</h3>
                  <p className="text-gray-700 mb-4">
                    Emergence uses JSON Web Tokens (JWT) for secure authentication. 
                    Tokens are stateless and contain user information.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">1. Register a User</h4>
                      <div className="font-mono text-sm bg-gray-100 p-3 rounded mb-2">
                        POST /api/auth/register
                      </div>
                      <p className="text-gray-600 text-sm">Create a new user account</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">2. Login</h4>
                      <div className="font-mono text-sm bg-gray-100 p-3 rounded mb-2">
                        POST /api/auth/login
                      </div>
                      <p className="text-gray-600 text-sm">Authenticate and receive JWT token</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">3. Use Token</h4>
                      <div className="font-mono text-sm bg-gray-100 p-3 rounded mb-2">
                        Authorization: Bearer YOUR_JWT_TOKEN
                      </div>
                      <p className="text-gray-600 text-sm">Include token in API requests</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Security</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Tokens expire after 24 hours</li>
                    <li>Store tokens securely (localStorage, secure cookies)</li>
                    <li>Never expose tokens in client-side code</li>
                    <li>Use HTTPS for all API communications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'upload-guide':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Guide</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploading AI Agents</h3>
                  <p className="text-gray-700 mb-4">
                    Upload your AI agents to the Emergence platform. 
                    Supported formats include ZIP files containing your agent code and configuration.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>File size: Maximum 50MB</li>
                    <li>Format: ZIP archive</li>
                    <li>Authentication: Required (JWT token)</li>
                    <li>Content: Agent code, configuration, and documentation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Process</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">1. Prepare Your Agent</h4>
                      <p className="text-gray-600 text-sm">
                        Package your AI agent code, dependencies, and configuration into a ZIP file.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">2. Authenticate</h4>
                      <p className="text-gray-600 text-sm">
                        Ensure you have a valid JWT token from the authentication process.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">3. Upload</h4>
                      <p className="text-gray-600 text-sm">
                        Use the upload API endpoint with your file and metadata.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">4. Verify</h4>
                      <p className="text-gray-600 text-sm">
                        Check that your agent appears in the browse section.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Upload</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>curl -X POST https://api.emergence.com/v1/agents \</div>
                    <div className="ml-4">-H "Authorization: Bearer YOUR_TOKEN" \</div>
                    <div className="ml-4">-F "file=@agent.zip" \</div>
                    <div className="ml-4">-F "name=My AI Agent" \</div>
                    <div className="ml-4">-F "description=Description of my agent" \</div>
                    <div className="ml-4">-F "category=AI Assistant"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>
              
              <div className="space-y-8">
                <CodeExample
                  title="JavaScript/Node.js Integration"
                  language="javascript"
                  code={`const axios = require('axios');
const token = 'YOUR_JWT_TOKEN';
const api = axios.create({
  baseURL: 'https://api.emergence.com/v1',
  headers: { Authorization: 'Bearer ' + token }
});

// Get all agents
const agents = await api.get('/agents');
console.log('Available agents:', agents.data);`}
                  className="mb-6"
                />

                <CodeExample
                  title="Python Integration"
                  language="python"
                  code={`import requests

token = 'YOUR_JWT_TOKEN'
headers = { 'Authorization': 'Bearer ' + token }

response = requests.get(
  'https://api.emergence.com/v1/agents',
  headers=headers
)

agents = response.json()
print(f"Found {len(agents)} agents")`}
                  className="mb-6"
                />

                <CodeExample
                  title="React Hook Example"
                  language="javascript"
                  code={`import { useState, useEffect } from 'react';

const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setAgents(data.agents))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading, error };
};

export default useAgents;`}
                  className="mb-6"
                />
              </div>
            </div>
          </div>
        );

      case 'sdk':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">SDK & Libraries</h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">JavaScript SDK</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Official JavaScript/Node.js SDK for Emergence API</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Install:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">npm install @emergence/sdk</code>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Version:</span>
                        <span className="ml-2 text-gray-600">1.0.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Python SDK</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Python client library for Emergence API</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Install:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">pip install emergence-sdk</code>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Version:</span>
                        <span className="ml-2 text-gray-600">1.0.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">React Hooks</h3>
                    </div>
                    <p className="text-gray-600 mb-4">React hooks for easy integration</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Install:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">npm install @emergence/react</code>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Version:</span>
                        <span className="ml-2 text-gray-600">1.0.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Community</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Community-contributed libraries</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Status:</span>
                        <span className="ml-2 text-gray-600">Coming Soon</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Languages:</span>
                        <span className="ml-2 text-gray-600">Go, Rust, PHP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Support</h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Comprehensive guides and API reference</p>
                    <Link to="/docs" className="text-blue-600 hover:text-blue-700 font-medium">
                      View Documentation →
                    </Link>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Community</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Join our developer community</p>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                      Join Discord →
                    </a>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Get help from our support team</p>
                    <a href="mailto:support@emergence.com" className="text-blue-600 hover:text-blue-700 font-medium">
                      Contact Support →
                    </a>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Blog</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Latest updates and tutorials</p>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                      Read Blog →
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="#" className="text-blue-600 hover:text-blue-700">API Status</a>
                    <a href="#" className="text-blue-600 hover:text-blue-700">Changelog</a>
                    <a href="#" className="text-blue-600 hover:text-blue-700">Pricing</a>
                    <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                    <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                    <a href="#" className="text-blue-600 hover:text-blue-700">Security</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Section Not Found</h2>
            <p className="text-gray-600">The requested section could not be found.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Developer Hub</h1>
          <p className="text-lg text-gray-600">
            Everything you need to build with Emergence
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Mobile Section Selector */}
          <div className="xl:hidden">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Section
              </label>
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title} - {section.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden xl:block xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate">{section.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperHub;
