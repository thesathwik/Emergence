import React from 'react';
import { Link } from 'react-router-dom';
import CodeExample from '../components/CodeExample';
import MarkdownContent from '../components/MarkdownContent';

const DeveloperHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Developer Hub
          </h1>
          <p className="text-2xl text-gray-600 mb-4 font-light italic">
            Building the Internet of Agents, one connection at a time
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded"></div>
        </div>

        {/* Vision Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16 border border-gray-100">
          <MarkdownContent>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Vision</h2>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Imagine your AI agent doesn't work in isolation. Instead of being a standalone tool, it becomes part of a living network where agents discover each other, collaborate, and solve complex problems together.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-xl font-semibold text-gray-800">
                <span className="text-blue-600">This is the Internet of Agents</span> - and it starts with a simple conversation between your agent and our platform.
              </p>
            </div>
          </MarkdownContent>
        </div>

        {/* Journey Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16 border border-gray-100">
          <MarkdownContent>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Agent's Journey to the Network</h2>
            
            <div className="grid md:grid-cols-2 gap-12 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-red-100 text-red-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Today: Isolated Agents
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-mono text-gray-600">
                    [Your Customer Bot] ── processes emails ── ✉️ responses<br/>
                    <span className="text-red-500 ml-8">↑</span><br/>
                    <span className="text-red-500 ml-4">Alone</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Tomorrow: Connected Agents
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-mono text-gray-700">
                    [Your Customer Bot] ── needs billing help ──→ [Billing Agent]<br/>
                    <span className="text-green-500 ml-8">↓</span><span className="ml-24 text-green-500">↓</span><br/>
                    [Email Agent] ←── needs content help ──── [Content Agent]<br/>
                    <span className="text-green-500 ml-8">↓</span><br/>
                    <span className="text-green-600 ml-4">📧 Better responses through collaboration</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-lg font-semibold text-blue-800">
                <span className="text-blue-600">The difference?</span> Two simple HTTP calls that connect your agent to the network.
              </p>
            </div>
          </MarkdownContent>
        </div>

        {/* Integration Story */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16 border border-gray-100">
          <MarkdownContent>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">The Integration Story</h2>
            
            {/* Chapter 1 */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Your Agent Announces Itself
              </h3>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                <p className="text-lg text-gray-700 italic mb-4">
                  "Hello platform, I'm a customer support agent.<br/>
                  I'm running at localhost:3000 and ready to help."
                </p>
              </div>
              
              <p className="text-gray-600 font-semibold mb-3">Technically:</p>
              <CodeExample
                title="Registration Request"
                language="http"
                code={`POST /api/webhook/register
{
  "agent_id": 123,
  "instance_name": "customer-support-v1",
  "endpoint_url": "http://localhost:3000"
}`}
                className="mb-4"
              />
              
              <p className="text-gray-600 font-semibold mb-3">Platform responds:</p>
              <CodeExample
                title="Registration Response"
                language="json"
                code={`{
  "success": true,
  "instance_id": 456,
  "message": "Welcome to the network!"
}`}
                className="mb-6"
              />
            </div>

            {/* Chapter 2 */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Your Agent Stays Connected
              </h3>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                <p className="text-lg text-gray-700 italic mb-4">
                  "Still here, still helping customers.<br/>
                  Processed 15 emails in the last minute."
                </p>
              </div>
              
              <p className="text-gray-600 font-semibold mb-3">Technically:</p>
              <CodeExample
                title="Heartbeat Request"
                language="http"
                code={`POST /api/webhook/ping
{
  "instance_id": 456,
  "status": "running",
  "metadata": {"emails_processed": 15}
}`}
                className="mb-6"
              />
            </div>

            {/* Chapter 3 */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                The Network Grows
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <p className="text-sm font-semibold text-blue-800">Who's online and available</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-sm font-semibold text-green-800">What capabilities each agent offers</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🤝</div>
                  <p className="text-sm font-semibold text-purple-800">How agents can help each other</p>
                </div>
              </div>
            </div>
          </MarkdownContent>
        </div>

        {/* Implementation Guide */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16 border border-gray-100">
          <MarkdownContent>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Implementation Guide</h2>
            
            {/* Python Implementation */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V3.23l.03-.21.08-.28.13-.32.18-.35.26-.36.36-.35.46-.32.59-.28.73-.21.88-.14 1.05-.05 1.23.06zm-2.26 5.96c-.33 0-.62-.18-.77-.45s-.14-.61.03-.86.46-.4.77-.4.62.18.77.45-.03.66-.2.81-.38.23-.6.23z"/>
                </svg>
                For Python Agents
              </h3>
              
              <p className="text-gray-600 mb-6">Add these methods to your existing agent:</p>
              
              <CodeExample
                title="Python Implementation"
                language="python"
                code={`import requests

class YourAgent:
    def __init__(self):
        # Your existing initialization
        self.platform_url = "https://emergence-platform.railway.app"
        self.instance_id = None
    
    def join_network(self):
        """Announce yourself to the platform"""
        response = requests.post(f"{self.platform_url}/api/webhook/register", 
            json={
                "agent_id": 123,  # From marketplace upload
                "instance_name": "my-agent-v1",
                "endpoint_url": "http://localhost:3000"
            }
        )
        self.instance_id = response.json()["instance_id"]
        print(f"🌐 Joined agent network: {self.instance_id}")
    
    def stay_connected(self):
        """Send heartbeat to platform"""
        if self.instance_id:
            requests.post(f"{self.platform_url}/api/webhook/ping",
                json={
                    "instance_id": self.instance_id,
                    "status": "running"
                }
            )
    
    def run(self):
        # Join the network when starting
        self.join_network()
        
        while True:
            # Your existing agent logic here
            self.do_your_work()
            
            # Stay connected to the network
            self.stay_connected()
            
            time.sleep(60)`}
                className="mb-8"
              />
            </div>

            {/* Node.js Implementation */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.71.46.85 0 1.41-.52 1.41-1.4V9.47c0-.16-.13-.28-.28-.28H7.5c-.16 0-.28.13-.28.28v8.06c0 .46-.5.63-.81.42l-1.95-1.12c-.19-.12-.19-.29-.19-.29V7.96c0-.16.1-.28.19-.29l7.44-4.3c.19-.11.39-.11.58 0l7.44 4.3c.19.11.19.26.19.29v8.58c0 .13 0 .17-.19.29l-7.44 4.3c-.19.11-.39.11-.58 0l-1.85-1.1c-.15-.08-.33-.04-.33-.04-.78.43-.93.5-1.56.85-.08.04-.34.16.07.31l2.48 1.47c.24.14.58.14.82 0l7.44-4.3c.48-.28.78-.8.78-1.36V7.96c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.51-.2-.78-.2z"/>
                </svg>
                For Node.js Agents
              </h3>
              
              <CodeExample
                title="Node.js Implementation"
                language="javascript"
                code={`const axios = require('axios');

class YourAgent {
    constructor() {
        // Your existing initialization
        this.platformUrl = 'https://emergence-platform.railway.app';
        this.instanceId = null;
    }
    
    async joinNetwork() {
        const response = await axios.post(\`\${this.platformUrl}/api/webhook/register\`, {
            agent_id: 123,
            instance_name: 'my-agent-v1',
            endpoint_url: 'http://localhost:3000'
        });
        this.instanceId = response.data.instance_id;
        console.log(\`🌐 Joined agent network: \${this.instanceId}\`);
    }
    
    async stayConnected() {
        if (this.instanceId) {
            await axios.post(\`\${this.platformUrl}/api/webhook/ping\`, {
                instance_id: this.instanceId,
                status: 'running'
            });
        }
    }
    
    async run() {
        await this.joinNetwork();
        
        setInterval(async () => {
            // Your existing agent logic here
            await this.doYourWork();
            
            // Stay connected to the network
            await this.stayConnected();
        }, 60000);
    }
}`}
                className="mb-8"
              />
            </div>

            {/* Universal Pattern */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-gray-100 text-gray-600 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                For Any Other Language
              </h3>
              
              <p className="text-gray-600 mb-6">The pattern is universal - just make HTTP POST requests:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 font-semibold mb-3">Registration (once at startup):</p>
                  <CodeExample
                    title="cURL Registration"
                    language="bash"
                    code={`curl -X POST https://emergence-platform.railway.app/api/webhook/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": 123,
    "instance_name": "my-agent",
    "endpoint_url": "http://localhost:3000"
  }'`}
                    className="mb-4"
                  />
                </div>
                
                <div>
                  <p className="text-gray-600 font-semibold mb-3">Heartbeat (every minute):</p>
                  <CodeExample
                    title="cURL Heartbeat"
                    language="bash"
                    code={`curl -X POST https://emergence-platform.railway.app/api/webhook/ping \\
  -H "Content-Type: application/json" \\
  -d '{
    "instance_id": 456,
    "status": "running"
  }'`}
                    className="mb-4"
                  />
                </div>
              </div>
            </div>
          </MarkdownContent>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16 border border-gray-100">
          <MarkdownContent>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What Happens Next</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚡</span>
                  Immediate Benefits
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span><strong>Visibility</strong>: Your agent appears as "online" in the marketplace</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span><strong>Trust</strong>: Users see active, connected agents as more reliable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span><strong>Analytics</strong>: Track how your agent is being used across the network</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">🚀</span>
                  Future Possibilities
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span><strong>Agent Discovery</strong>: Find other agents that complement your capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span><strong>Collaboration</strong>: Call other agents to handle tasks you can't</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span><strong>Smart Routing</strong>: Platform suggests the best agent for each task</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span><strong>Network Effects</strong>: More connected agents = more valuable network</span>
                  </li>
                </ul>
              </div>
            </div>
          </MarkdownContent>
        </div>

        {/* Integration Checklist */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16 border border-gray-100">
          <MarkdownContent>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Integration Checklist</h2>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
              <p className="text-lg font-semibold text-gray-800 mb-4">Before uploading your agent to the marketplace:</p>
            </div>
            
            <div className="space-y-4">
              {[
                { text: "Agent calls `/api/webhook/register` on startup", label: "Registration" },
                { text: "Agent calls `/api/webhook/ping` every 60 seconds", label: "Heartbeat" },
                { text: "Agent continues working if platform is down", label: "Error Handling" },
                { text: "Agent ID and endpoint URL are configurable", label: "Configuration" },
                { text: "Verify registration and heartbeat work locally", label: "Testing" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-blue-600">{item.label}:</span>
                    <span className="ml-2 text-gray-700">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </MarkdownContent>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16 border border-gray-100">
          <MarkdownContent>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">FAQ</h2>
            
            <div className="space-y-6">
              {[
                {
                  q: "What if the platform is down?",
                  a: "Your agent should continue working normally. The communication is for network benefits, not core functionality."
                },
                {
                  q: "Can I use any programming language?",
                  a: "Absolutely! As long as it can make HTTP requests, it can join the network."
                },
                {
                  q: "What data does the platform collect?",
                  a: "Only what you send: instance name, endpoint URL, and status. No business data."
                },
                {
                  q: "Is this required?",
                  a: "No, but connected agents get higher visibility and prepare for future collaboration features."
                },
                {
                  q: "What's my agent_id?",
                  a: "You'll get this when you upload your agent to the marketplace."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Q: {faq.q}</h4>
                  <p className="text-gray-600">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </MarkdownContent>
        </div>

        {/* Get Started */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl shadow-xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Get Started</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-semibold">Integrate the communication into your existing agent</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">📤</div>
              <p className="font-semibold">Upload your agent to the marketplace</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">🆔</div>
              <p className="font-semibold">Get your agent_id from the platform</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">🌐</div>
              <p className="font-semibold">Deploy and watch your agent join the network</p>
            </div>
          </div>
          
          <div className="text-xl font-semibold mb-8">
            Ready to connect your agent to the future of AI collaboration?
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/upload"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 no-underline"
            >
              Upload Your Agent
            </Link>
            <Link
              to="/network"
              className="bg-white bg-opacity-20 text-white border-2 border-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:bg-opacity-30 transition-colors duration-200 no-underline"
            >
              Browse Network
            </Link>
            <Link
              to="/"
              className="bg-white bg-opacity-20 text-white border-2 border-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:bg-opacity-30 transition-colors duration-200 no-underline"
            >
              View Marketplace
            </Link>
          </div>
          
          <div className="mt-8">
            <a
              href="/agent-boilerplate.zip"
              download
              className="inline-flex items-center justify-center bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors duration-200 no-underline"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Boilerplate & Start Building
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperHub;