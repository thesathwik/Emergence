import React from 'react';
import { Link } from 'react-router-dom';
import CodeExample from '../components/CodeExample';

const DeveloperHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimal and Clean */}
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-6xl font-extralight text-gray-900 mb-8 tracking-tight">
            Developer Hub
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
            Building the Internet of Agents, one connection at a time
          </p>
          
          {/* Subtle divider */}
          <div className="w-12 h-px bg-gray-300 mx-auto mt-12"></div>
        </div>
      </div>

      {/* Vision Section - Clean Typography */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-8">The Vision</h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
              Imagine your AI agent doesn't work in isolation. Instead of being a standalone tool, 
              it becomes part of a living network where agents discover each other, collaborate, 
              and solve complex problems together.
            </p>
          </div>
          
          {/* Elegant callout */}
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <p className="text-2xl font-light text-gray-800 leading-relaxed">
              This is the <span className="font-medium">Internet of Agents</span> — and it starts with 
              a simple conversation between your agent and our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Journey Section - Visual Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-light text-gray-900 text-center mb-16">
            Your Agent's Journey
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Today - Isolated */}
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-block p-3 bg-red-50 rounded-full mb-4">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Today</h3>
                <p className="text-gray-500 font-light">Isolated Agents</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <div className="space-y-4 text-sm font-mono text-gray-400">
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">Customer Bot</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="text-center text-gray-600">processes emails</div>
                  <div className="text-center">↓</div>
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">✉️ responses</div>
                  </div>
                  <div className="text-center text-red-500 font-medium">Alone</div>
                </div>
              </div>
            </div>

            {/* Tomorrow - Connected */}
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-block p-3 bg-green-50 rounded-full mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Tomorrow</h3>
                <p className="text-gray-500 font-light">Connected Agents</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <div className="space-y-4 text-sm font-mono text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-3 py-2 bg-blue-50 rounded-lg text-blue-700">Customer Bot</div>
                    <div className="px-3 py-2 bg-purple-50 rounded-lg text-purple-700">Billing Agent</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-3 py-2 bg-green-50 rounded-lg text-green-700">Email Agent</div>
                    <div className="px-3 py-2 bg-orange-50 rounded-lg text-orange-700">Content Agent</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="text-center text-green-600 font-medium">📧 Better responses through collaboration</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 font-light">
              <span className="font-medium text-gray-900">The difference?</span> Two simple HTTP calls.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Story - Clean Chapters */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-light text-gray-900 text-center mb-20">The Integration Story</h2>
          
          <div className="space-y-20">
            {/* Chapter 1 */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">1</div>
                <h3 className="text-2xl font-light text-gray-900">Your Agent Announces Itself</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-8 mb-8">
                <p className="text-lg font-light text-gray-700 italic leading-relaxed">
                  "Hello platform, I'm a customer support agent.<br/>
                  I'm running at localhost:3000 and ready to help."
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">REQUEST</h4>
                  <CodeExample
                    title=""
                    language="http"
                    code={`POST /api/webhook/register
{
  "agent_id": 123,
  "instance_name": "customer-support-v1",
  "endpoint_url": "http://localhost:3000"
}`}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">RESPONSE</h4>
                  <CodeExample
                    title=""
                    language="json"
                    code={`{
  "success": true,
  "instance_id": 456,
  "message": "Welcome to the network!"
}`}
                  />
                </div>
              </div>
            </div>

            {/* Chapter 2 */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">2</div>
                <h3 className="text-2xl font-light text-gray-900">Your Agent Stays Connected</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-8 mb-8">
                <p className="text-lg font-light text-gray-700 italic leading-relaxed">
                  "Still here, still helping customers.<br/>
                  Processed 15 emails in the last minute."
                </p>
              </div>
              
              <div className="max-w-md">
                <h4 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">HEARTBEAT</h4>
                <CodeExample
                  title=""
                  language="http"
                  code={`POST /api/webhook/ping
{
  "instance_id": 456,
  "status": "running",
  "metadata": {"emails_processed": 15}
}`}
                />
              </div>
            </div>

            {/* Chapter 3 */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">3</div>
                <h3 className="text-2xl font-light text-gray-900">The Network Grows</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Who's online and available</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">What capabilities each agent offers</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">How agents can help each other</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Guide - Language Focused */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-light text-gray-900 text-center mb-20">Implementation Guide</h2>
          
          <div className="space-y-16">
            {/* Python */}
            <div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V3.23l.03-.21.08-.28.13-.32.18-.35.26-.36.36-.35.46-.32.59-.28.73-.21.88-.14 1.05-.05 1.23.06zm-2.26 5.96c-.33 0-.62-.18-.77-.45s-.14-.61.03-.86.46-.4.77-.4.62.18.77.45-.03.66-.2.81-.38.23-.6.23z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900">Python</h3>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <p className="text-gray-600 font-light">Add these methods to your existing agent:</p>
                </div>
                <CodeExample
                  title=""
                  language="python"
                  code={`import requests

class YourAgent:
    def __init__(self):
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
        self.join_network()
        
        while True:
            self.do_your_work()  # Your existing logic
            self.stay_connected()
            time.sleep(60)`}
                />
              </div>
            </div>

            {/* Node.js */}
            <div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.71.46.85 0 1.41-.52 1.41-1.4V9.47c0-.16-.13-.28-.28-.28H7.5c-.16 0-.28.13-.28.28v8.06c0 .46-.5.63-.81.42l-1.95-1.12c-.19-.12-.19-.29-.19-.29V7.96c0-.16.1-.28.19-.29l7.44-4.3c.19-.11.39-.11.58 0l7.44 4.3c.19.11.19.26.19.29v8.58c0 .13 0 .17-.19.29l-7.44 4.3c-.19.11-.39.11-.58 0l-1.85-1.1c-.15-.08-.33-.04-.33-.04-.78.43-.93.5-1.56.85-.08.04-.34.16.07.31l2.48 1.47c.24.14.58.14.82 0l7.44-4.3c.48-.28.78-.8.78-1.36V7.96c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.51-.2-.78-.2z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900">Node.js</h3>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <CodeExample
                  title=""
                  language="javascript"
                  code={`const axios = require('axios');

class YourAgent {
    constructor() {
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
            await this.doYourWork();  // Your existing logic
            await this.stayConnected();
        }, 60000);
    }
}`}
                />
              </div>
            </div>

            {/* Any Language */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-light text-gray-900 mb-4">Any Language</h3>
                <p className="text-gray-600 font-light">The pattern is universal — just make HTTP POST requests</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Registration (once at startup)</h4>
                  </div>
                  <CodeExample
                    title=""
                    language="bash"
                    code={`curl -X POST https://emergence-platform.railway.app/api/webhook/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": 123,
    "instance_name": "my-agent",
    "endpoint_url": "http://localhost:3000"
  }'`}
                  />
                </div>
                
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Heartbeat (every minute)</h4>
                  </div>
                  <CodeExample
                    title=""
                    language="bash"
                    code={`curl -X POST https://emergence-platform.railway.app/api/webhook/ping \\
  -H "Content-Type: application/json" \\
  -d '{
    "instance_id": 456,
    "status": "running"
  }'`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Clean Layout */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-light text-gray-900 text-center mb-20">What You Get</h2>
          
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-8">Immediate Benefits</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Visibility</h4>
                    <p className="text-gray-600 font-light">Your agent appears as "online" in the marketplace</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Trust</h4>
                    <p className="text-gray-600 font-light">Users see active, connected agents as more reliable</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Analytics</h4>
                    <p className="text-gray-600 font-light">Track how your agent is being used across the network</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-8">Future Possibilities</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Agent Discovery</h4>
                    <p className="text-gray-600 font-light">Find other agents that complement your capabilities</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Collaboration</h4>
                    <p className="text-gray-600 font-light">Call other agents to handle tasks you can't</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Network Effects</h4>
                    <p className="text-gray-600 font-light">More connected agents = more valuable network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Minimal */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-light text-gray-900 text-center mb-20">FAQ</h2>
          
          <div className="space-y-8">
            {[
              {
                q: "What if the platform is down?",
                a: "Your agent continues working normally. Communication is for network benefits, not core functionality."
              },
              {
                q: "Can I use any programming language?",
                a: "Absolutely. As long as it can make HTTP requests, it can join the network."
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
              <div key={index} className="border-b border-gray-200 pb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-3">{faq.q}</h4>
                <p className="text-gray-600 font-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Elegant and Focused */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-light text-gray-900 mb-8">Ready to Connect?</h2>
          <p className="text-xl text-gray-600 font-light mb-12 leading-relaxed">
            Join the Internet of Agents and unlock the future of AI collaboration.
          </p>
          
          <div className="space-y-4">
            <a
              href="/agent-boilerplate.zip"
              download
              className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 no-underline"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Boilerplate
            </a>
            
            <div className="flex justify-center space-x-6">
              <Link
                to="/upload"
                className="text-gray-600 hover:text-gray-900 font-light no-underline transition-colors"
              >
                Upload Agent
              </Link>
              <Link
                to="/network"
                className="text-gray-600 hover:text-gray-900 font-light no-underline transition-colors"
              >
                Browse Network
              </Link>
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-light no-underline transition-colors"
              >
                View Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeveloperHub;