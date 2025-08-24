import React, { useState } from 'react';
import CodeExample from '../components/CodeExample';
import MarkdownContent from '../components/MarkdownContent';

interface Section {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const DeveloperHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState('quick-start');

  const sections: Section[] = [
    {
      id: 'quick-start',
      title: 'Quick Start',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      description: 'Get started in 3 steps'
    },
    {
      id: 'structure',
      title: 'Required Structure',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      description: 'File structure requirements'
    },
    {
      id: 'manifest',
      title: 'Agent Manifest',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      description: 'agent.json format'
    },
    {
      id: 'api',
      title: 'Communication API',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      description: 'Platform communication'
    },
    {
      id: 'collaboration',
      title: 'Agent Collaboration',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      description: 'Multi-agent coordination'
    },
    {
      id: 'download',
      title: 'Download Boilerplate',
      icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
      description: 'Ready-to-use template'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'quick-start':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h1>Developer Hub</h1>
                
                <h2>Quick Start</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">3 Steps to Get Started</h3>
                  <ol className="space-y-2 text-green-700">
                    <li className="flex items-center">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
                      <a href="#download" className="underline font-medium">Download Boilerplate</a>
                    </li>
                    <li className="flex items-center">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
                      Edit <code className="bg-green-100 px-2 py-1 rounded">src/agent_core.py</code> with your logic
                    </li>
                    <li className="flex items-center">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</span>
                      Zip and upload to marketplace
                    </li>
                  </ol>
                </div>

                <div className="text-center">
                  <a 
                    href="/agent-boilerplate.zip" 
                    download
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 no-underline hover:no-underline"
                    style={{ textDecoration: 'none', color: 'white' }}
                  >
                    <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span style={{ color: 'white', textDecoration: 'none' }}>Download Boilerplate</span>
                  </a>
                </div>
              </MarkdownContent>
            </div>
          </div>
        );

      case 'structure':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h1>Agent Structure</h1>
                
                <p>Your agent must be packaged as a zip file with this structure:</p>

                <CodeExample
                  title="Required File Structure"
                  language="bash"
                  code={`your-agent.zip
├── agent.json          # Required: Agent metadata
├── README.md          # Required: Setup instructions  
├── src/               # Your code (any language)
│   └── main.py
└── requirements.txt   # Optional: Python dependencies`}
                  className="mb-6"
                />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> The boilerplate handles all the structure for you. Just focus on your agent logic!
                      </p>
                    </div>
                  </div>
                </div>

              </MarkdownContent>
            </div>
          </div>
        );

      case 'manifest':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h1>Agent Manifest Format</h1>
                
                <p>Create <code>agent.json</code> in your zip root:</p>

                <CodeExample
                  title="agent.json Template"
                  language="json"
                  code={`{
  "name": "Your Agent Name",
  "description": "Brief description of what your agent does",
  "version": "1.0.0",
  "author": "your-email@example.com",
  "category": "marketing"
}`}
                  className="mb-6"
                />

                <h3>Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded">marketing</span>
                  <span className="bg-gray-100 px-3 py-1 rounded">sales</span>
                  <span className="bg-gray-100 px-3 py-1 rounded">customer-support</span>
                  <span className="bg-gray-100 px-3 py-1 rounded">delivery</span>
                  <span className="bg-gray-100 px-3 py-1 rounded">data-processing</span>
                  <span className="bg-gray-100 px-3 py-1 rounded">other</span>
                </div>
              </MarkdownContent>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h1>Platform Communication</h1>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        <strong>Good news:</strong> The boilerplate handles all platform communication automatically!
                      </p>
                    </div>
                  </div>
                </div>

                <h2>Manual Endpoints (Optional)</h2>
                <p>If you want to handle communication manually:</p>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-mono text-sm font-bold">POST /api/webhook/register</h4>
                    <p className="text-sm text-gray-600">Register your running agent</p>
                    <p className="text-xs text-gray-500 mt-1">Base URL: https://emergence-production.up.railway.app</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-mono text-sm font-bold">POST /api/webhook/ping</h4>
                    <p className="text-sm text-gray-600">Send health check</p>
                    <p className="text-xs text-gray-500 mt-1">Base URL: https://emergence-production.up.railway.app</p>
                  </div>
                </div>
              </MarkdownContent>
            </div>
          </div>
        );

      case 'download':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h1>Download Boilerplate</h1>
                
                <div className="text-center">
                  <div className="mb-8">
                    <h2 className="text-2xl font-light text-gray-900 mb-3">Agent Boilerplate</h2>
                    <p className="text-gray-600">Everything you need to build an agent with platform communication built-in</p>
                  </div>
                  
                  <a 
                    href="/agent-boilerplate.zip" 
                    download
                    className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors duration-200 no-underline hover:no-underline"
                    style={{ textDecoration: 'none', color: 'white' }}
                  >
                    <svg className="w-5 h-5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span style={{ color: 'white', textDecoration: 'none' }}>Download Template</span>
                  </a>
                </div>

                <div className="mt-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">What's Included</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Platform Communication</h4>
                          <p className="text-sm text-gray-600">Automatic registration and health checks</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Template Structure</h4>
                          <p className="text-sm text-gray-600">All required files with correct format</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">3-Step README</h4>
                          <p className="text-sm text-gray-600">Simple setup instructions</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Error Handling</h4>
                          <p className="text-sm text-gray-600">Graceful error recovery and logging</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>After downloading:</strong> Extract the zip, edit <code>src/agent_core.py</code>, and you're ready to go!
                      </p>
                    </div>
                  </div>
                </div>
              </MarkdownContent>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <MarkdownContent>
                <h1>Agent Collaboration Guide</h1>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">🤝 Multi-Agent Coordination</h3>
                  <p className="text-blue-700 mb-4">
                    Enable your agents to discover and collaborate with other agents on the platform. 
                    Build complex workflows by combining specialized agents.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-blue-600">
                      <span className="mr-2">🔍</span>
                      Agent Discovery
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="mr-2">📞</span>
                      Remote Method Calls
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="mr-2">🛡️</span>
                      Secure Communication
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      Quick Setup
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Declare your agent's capabilities</li>
                      <li>• Define callable methods</li>
                      <li>• Enable discovery in config</li>
                      <li>• Start collaborating!</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-purple-100 text-purple-600 rounded-full p-1 mr-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      Built-in Features
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Automatic retry logic</li>
                      <li>• Error handling patterns</li>
                      <li>• Rate limiting & security</li>
                      <li>• Comprehensive logging</li>
                    </ul>
                  </div>
                </div>

                <h2>Capability Declaration</h2>
                <p>Declare what your agent can do so others can find and use it:</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-mono text-sm text-gray-600 mb-2">src/agent_core.py</h4>
                </div>
              </MarkdownContent>
              
              <CodeExample 
                language="python"
                code={`def declare_capabilities(self):
    """
    Declare what your agent can do.
    Available capabilities: email-processing, data-processing, 
    customer-support, content-generation, web-scraping, etc.
    """
    # Email processing agent
    return ["email-processing", "customer-support", "nlp"]
    
    # Data analysis agent  
    return ["data-processing", "database", "ml-prediction"]

def declare_methods(self):
    """
    Declare methods other agents can call.
    """
    return {
        "process_email": "Process and classify incoming emails",
        "send_response": "Send automated email response", 
        "extract_data": "Extract structured data from content"
    }`}
              />
              
              <MarkdownContent>
                <h2>Agent Discovery</h2>
                <p>Find other agents by their capabilities:</p>
              </MarkdownContent>
              
              <CodeExample 
                language="python"
                code={`# Find all email processing agents
email_agents = self.find_agents("email-processing")

# Find data processing agents
data_agents = self.find_agents("data-processing")

# Find all available agents  
all_agents = self.find_agents()

for agent in email_agents:
    print(f"Found: {agent['instance_name']} - {agent['instance_id']}")
    print(f"Methods: {list(agent.get('methods', {}).keys())}")`}
              />
              
              <MarkdownContent>
                <h2>Inter-Agent Communication</h2>
                <p>Call methods on other agents with comprehensive error handling:</p>
              </MarkdownContent>
              
              <CodeExample 
                language="python"
                code={`# Basic agent call
response = self.call_agent("agent-123", "status")
if response and not response.get("error"):
    print(f"Agent is {response['status']}")

# Call with data and custom timeout
email_agents = self.find_agents("email-processing")
if email_agents:
    agent_id = email_agents[0]["instance_id"]
    response = self.call_agent(
        agent_id,
        "process_email",
        {
            "subject": "Customer inquiry",
            "body": "How do I return an item?",
            "priority": "normal"
        },
        timeout=60
    )
    
    if response and not response.get("error"):
        print(f"Email processed: {response.get('result')}")
    else:
        print(f"Processing failed: {response.get('error')}")`}
              />
              
              <MarkdownContent>
                <h2>Complete Examples</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      🎧 Customer Support + Billing
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Complete example of support agent routing billing inquiries to specialized billing agents with error handling and fallbacks.
                    </p>
                    <div className="flex flex-col gap-2">
                      <a 
                        href="/examples/customer-support-billing-collaboration.py"
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        View Complete Code →
                      </a>
                      <ul className="text-xs text-blue-600 space-y-1">
                        <li>• Refund processing workflow</li>
                        <li>• Payment issue resolution</li>
                        <li>• Multi-agent fallback handling</li>
                        <li>• Customer communication templates</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                      🎯 Marketing + Content Creation
                    </h3>
                    <p className="text-purple-700 text-sm mb-4">
                      Marketing agent orchestrating content creation across blog posts, social media, emails, and press releases.
                    </p>
                    <div className="flex flex-col gap-2">
                      <a 
                        href="/examples/marketing-content-collaboration.py"
                        target="_blank" 
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium underline"
                      >
                        View Complete Code →
                      </a>
                      <ul className="text-xs text-purple-600 space-y-1">
                        <li>• Multi-format content generation</li>
                        <li>• Quality control and revisions</li>
                        <li>• Platform-specific optimization</li>
                        <li>• Campaign performance tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h2>Common Patterns</h2>
                
                <h3>📧 Email Processing Workflow</h3>
                <p>Route emails to specialized agents based on content analysis.</p>
                
                <h3>📊 Data Processing Pipeline</h3>
                <p>Chain multiple agents for data cleaning → analysis → reporting.</p>
                
                <h3>🤖 Multi-Agent Coordination</h3>
                <p>Monitor agent health and redistribute work across the network.</p>
                
                <h3>🛠️ Error Recovery</h3>
                <p>Implement fallback strategies when primary agents fail.</p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-amber-800 mb-3">📚 Complete Documentation & Resources</h3>
                  <p className="text-amber-700 mb-4">
                    Get comprehensive guides, complete examples, and production-ready code for building collaborative agents.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <a 
                      href="/COLLABORATION_GUIDE.md" 
                      target="_blank"
                      className="inline-flex items-center justify-center px-3 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors duration-200 no-underline hover:no-underline text-center text-sm"
                      style={{ textDecoration: 'none', color: 'white' }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Full Guide</span>
                    </a>
                    <a 
                      href="/COLLABORATION_BEST_PRACTICES.md" 
                      target="_blank"
                      className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 no-underline hover:no-underline text-center text-sm"
                      style={{ textDecoration: 'none', color: 'white' }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Best Practices</span>
                    </a>
                    <a 
                      href="/examples/README.md" 
                      target="_blank"
                      className="inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 no-underline hover:no-underline text-center text-sm"
                      style={{ textDecoration: 'none', color: 'white' }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span>Examples</span>
                    </a>
                    <a 
                      href="/agent-boilerplate.zip" 
                      download
                      className="inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 no-underline hover:no-underline text-center text-sm"
                      style={{ textDecoration: 'none', color: 'white' }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Boilerplate</span>
                    </a>
                  </div>
                </div>
              </MarkdownContent>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Developer Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build and share AI agents with our platform. Everything you need to get started in minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                      </svg>
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs opacity-75">{section.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperHub;
