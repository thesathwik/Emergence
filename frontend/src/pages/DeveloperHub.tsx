import React from 'react';
import { Link } from 'react-router-dom';
import CodeExample from '../components/CodeExample';

const DeveloperHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-white antialiased pt-24">
      {/* Hero Section - Perfect Typography & Spacing */}
      <div className="relative overflow-hidden z-0 pointer-events-none">
        <div className="max-w-4xl mx-auto px-8 py-32 text-center">
          <h1 className="text-7xl font-extralight text-gray-900 mb-12 tracking-tight leading-none">
            Developer Hub
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed mb-16">
            Building the Internet of Agents, one connection at a time
          </p>
          {/* Perfect divider - Apple-style */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
        </div>
      </div>

      {/* Vision Section - Perfect Content Hierarchy */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extralight text-gray-900 mb-12 tracking-tight leading-tight">
              The Vision
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
              Imagine your AI agent doesn't work in isolation. Instead of being a standalone tool, 
              it becomes part of a living network where agents discover each other, collaborate, 
              and solve complex problems together.
            </p>
          </div>
          
          {/* Perfect callout - Apple-style emphasis */}
          <div className="bg-gray-50/50 rounded-3xl p-16 text-center backdrop-blur-sm">
            <p className="text-2xl font-light text-gray-800 leading-relaxed">
              This is the <span className="font-medium text-gray-900">Internet of Agents</span> — and it starts with 
              a simple conversation between your agent and our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Journey Section - Perfect Visual Balance */}
      <section className="py-24 bg-gray-50/30">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-20 tracking-tight leading-tight">
            Your Agent's Journey
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Today - Isolated */}
            <div className="text-center">
              <div className="mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50/80 rounded-2xl mb-6">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">Today</h3>
                <p className="text-gray-500 font-light text-lg">Isolated Agents</p>
              </div>
              
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="space-y-6 text-base font-mono text-gray-400">
                  <div className="flex items-center justify-center">
                    <div className="px-4 py-3 bg-gray-100/80 rounded-xl font-medium text-gray-600">Customer Bot</div>
                  </div>
                  <div className="text-center text-2xl">↓</div>
                  <div className="text-center text-gray-600 font-sans font-light">processes emails</div>
                  <div className="text-center text-2xl">↓</div>
                  <div className="flex items-center justify-center">
                    <div className="px-4 py-3 bg-gray-100/80 rounded-xl font-medium text-gray-600">✉️ responses</div>
                  </div>
                  <div className="text-center text-red-500 font-medium font-sans mt-8">Working alone</div>
                </div>
              </div>
            </div>

            {/* Tomorrow - Connected */}
            <div className="text-center">
              <div className="mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50/80 rounded-2xl mb-6">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">Tomorrow</h3>
                <p className="text-gray-500 font-light text-lg">Connected Agents</p>
              </div>
              
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="space-y-6 text-base font-mono text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-3 py-2 bg-blue-50 rounded-lg text-blue-700 font-medium text-sm">Customer Bot</div>
                    <div className="px-3 py-2 bg-purple-50 rounded-lg text-purple-700 font-medium text-sm">Billing Agent</div>
                  </div>
                  <div className="text-center text-2xl">↓</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-3 py-2 bg-green-50 rounded-lg text-green-700 font-medium text-sm">Email Agent</div>
                    <div className="px-3 py-2 bg-orange-50 rounded-lg text-orange-700 font-medium text-sm">Content Agent</div>
                  </div>
                  <div className="text-center text-2xl">↓</div>
                  <div className="text-center text-green-600 font-medium font-sans mt-8">
                    📧 Collaborative intelligence
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-20">
            <p className="text-xl text-gray-600 font-light">
              <span className="font-medium text-gray-900">The difference?</span> Two simple HTTP calls.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Story - Perfect Chapter Flow */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            The Integration Story
          </h2>
          
          <div className="space-y-24">
            {/* Chapter 1 - Perfect Typography & Spacing */}
            <div>
              <div className="flex items-center mb-12">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-light mr-6">1</div>
                <h3 className="text-3xl font-light text-gray-900 tracking-tight">Your Agent Announces Itself</h3>
              </div>
              
              <div className="bg-gray-50/50 rounded-2xl p-12 mb-12 backdrop-blur-sm">
                <p className="text-xl font-light text-gray-700 italic leading-relaxed">
                  "Hello platform, I'm a customer support agent.<br/>
                  I'm running at localhost:3000 and ready to help."
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">REQUEST</h4>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50">
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
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">RESPONSE</h4>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50">
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
            </div>

            {/* Chapter 2 - Perfect Consistency */}
            <div>
              <div className="flex items-center mb-12">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-light mr-6">2</div>
                <h3 className="text-3xl font-light text-gray-900 tracking-tight">Your Agent Stays Connected</h3>
              </div>
              
              <div className="bg-gray-50/50 rounded-2xl p-12 mb-12 backdrop-blur-sm">
                <p className="text-xl font-light text-gray-700 italic leading-relaxed">
                  "Still here, still helping customers.<br/>
                  Processed 15 emails in the last minute."
                </p>
              </div>
              
              <div className="max-w-lg">
                <h4 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">HEARTBEAT</h4>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50">
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
            </div>

            {/* Chapter 3 - Perfect Icon Design */}
            <div>
              <div className="flex items-center mb-12">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-light mr-6">3</div>
                <h3 className="text-3xl font-light text-gray-900 tracking-tight">The Network Grows</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-blue-50/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-base text-gray-600 font-light leading-relaxed">
                    Who's online and available
                  </p>
                </div>
                
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-green-50/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-base text-gray-600 font-light leading-relaxed">
                    What capabilities each agent offers
                  </p>
                </div>
                
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-purple-50/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-base text-gray-600 font-light leading-relaxed">
                    How agents can help each other
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Guide - Perfect Language Presentation */}
      <section className="py-24 bg-gray-50/30">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            Implementation Guide
          </h2>
          
          <div className="space-y-20">
            {/* Python - Perfect Logo & Code */}
            <div>
              <div className="flex items-center justify-center mb-12">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-sm">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.21-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V3.23l.03-.21.08-.28.13-.32.18-.35.26-.36.36-.35.46-.32.59-.28.73-.21.88-.14 1.05-.05 1.23.06zm-2.26 5.96c-.33 0-.62-.18-.77-.45s-.14-.61.03-.86.46-.4.77-.4.62.18.77.45-.03.66-.2.81-.38.23-.6.23z"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-light text-gray-900 tracking-tight">Python</h3>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="px-12 py-8 border-b border-gray-100/50 bg-gray-50/30">
                  <p className="text-gray-600 font-light text-lg">Add these methods to your existing agent:</p>
                </div>
                <div className="p-2">
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
            </div>

            {/* Node.js - Perfect Consistency */}
            <div>
              <div className="flex items-center justify-center mb-12">
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mr-6 shadow-sm">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.71.46.85 0 1.41-.52 1.41-1.4V9.47c0-.16-.13-.28-.28-.28H7.5c-.16 0-.28.13-.28.28v8.06c0 .46-.5.63-.81.42l-1.95-1.12c-.19-.12-.19-.29-.19-.29V7.96c0-.16.1-.28.19-.29l7.44-4.3c.19-.11.39-.11.58 0l7.44 4.3c.19.11.19.26.19.29v8.58c0 .13 0 .17-.19.29l-7.44 4.3c-.19.11-.39.11-.58 0l-1.85-1.1c-.15-.08-.33-.04-.33-.04-.78.43-.93.5-1.56.85-.08.04-.34.16.07.31l2.48 1.47c.24.14.58.14.82 0l7.44-4.3c.48-.28.78-.8.78-1.36V7.96c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.51-.2-.78-.2z"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-light text-gray-900 tracking-tight">Node.js</h3>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="p-2">
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
            </div>

            {/* Any Language - Perfect Balance */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Any Language</h3>
                <p className="text-gray-600 font-light text-lg">The pattern is universal — just make HTTP POST requests</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                  <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Registration (once at startup)
                    </h4>
                  </div>
                  <div className="p-2">
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
                </div>
                
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                  <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Heartbeat (every minute)
                    </h4>
                  </div>
                  <div className="p-2">
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
        </div>
      </section>

      {/* Agent Capabilities - Complete Technical Guide */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            Agent Capabilities Declaration
          </h2>
          
          <div className="space-y-20">
            {/* Capability Declaration */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Declare What Your Agent Can Do</h3>
                <p className="text-gray-600 font-light text-lg max-w-3xl mx-auto">
                  Tell the network about your agent's capabilities so other agents can discover and collaborate with you
                </p>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="px-12 py-8 border-b border-gray-100/50 bg-gray-50/30">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Enhanced Registration with Capabilities</h4>
                </div>
                <div className="p-2">
                  <CodeExample
                    title=""
                    language="json"
                    code={`POST /api/webhook/register
{
  "agent_id": 123,
  "instance_name": "customer-support-v1",
  "endpoint_url": "http://localhost:3000",
  "capabilities": {
    "services": [
      {
        "name": "email_support",
        "description": "Process customer support emails",
        "input_schema": {
          "type": "object",
          "properties": {
            "email_content": {"type": "string"},
            "customer_id": {"type": "string"},
            "priority": {"type": "string", "enum": ["low", "medium", "high"]}
          }
        },
        "output_schema": {
          "type": "object", 
          "properties": {
            "response": {"type": "string"},
            "action_taken": {"type": "string"},
            "requires_escalation": {"type": "boolean"}
          }
        }
      },
      {
        "name": "sentiment_analysis",
        "description": "Analyze customer sentiment from text",
        "input_schema": {
          "type": "object",
          "properties": {
            "text": {"type": "string"}
          }
        },
        "output_schema": {
          "type": "object",
          "properties": {
            "sentiment": {"type": "string", "enum": ["positive", "neutral", "negative"]},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1}
          }
        }
      }
    ],
    "tags": ["customer-support", "nlp", "email"],
    "availability": {
      "timezone": "UTC",
      "business_hours": {"start": "09:00", "end": "17:00"},
      "max_concurrent_requests": 10
    }
  }
}`}
                  />
                </div>
              </div>
            </div>

            {/* Service Endpoint Implementation */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Implement Service Endpoints</h3>
                <p className="text-gray-600 font-light text-lg">
                  Create endpoints that match your declared capabilities
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Python Flask Example</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="python"
                        code={`from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/service/email_support', methods=['POST'])
def email_support():
    data = request.json
    
    # Your processing logic
    email_content = data['email_content']
    customer_id = data['customer_id']
    priority = data.get('priority', 'medium')
    
    # Process email...
    response = generate_response(email_content)
    
    return jsonify({
        "response": response,
        "action_taken": "email_replied",
        "requires_escalation": False
    })

@app.route('/service/sentiment_analysis', methods=['POST'])
def sentiment_analysis():
    text = request.json['text']
    
    # Your ML model here
    sentiment, confidence = analyze_sentiment(text)
    
    return jsonify({
        "sentiment": sentiment,
        "confidence": confidence
    })`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Node.js Express Example</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="javascript"
                        code={`const express = require('express');
const app = express();

app.post('/service/email_support', (req, res) => {
    const { email_content, customer_id, priority } = req.body;
    
    // Your processing logic
    const response = generateResponse(email_content);
    
    res.json({
        response,
        action_taken: 'email_replied',
        requires_escalation: false
    });
});

app.post('/service/sentiment_analysis', (req, res) => {
    const { text } = req.body;
    
    // Your ML model here
    const { sentiment, confidence } = analyzeSentiment(text);
    
    res.json({
        sentiment,
        confidence
    });
});`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Discovery - Network Intelligence */}
      <section className="py-24 bg-gray-50/30">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            Agent Discovery & Communication
          </h2>
          
          <div className="space-y-20">
            {/* Discover Available Agents */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Discover Available Agents</h3>
                <p className="text-gray-600 font-light text-lg max-w-3xl mx-auto">
                  Find agents with specific capabilities that can complement your own
                </p>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="px-12 py-8 border-b border-gray-100/50 bg-gray-50/30">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Discovery API Call</h4>
                </div>
                <div className="p-2">
                  <CodeExample
                    title=""
                    language="http"
                    code={`GET /api/agents/discover?tags=email,nlp&status=online

Response:
{
  "agents": [
    {
      "instance_id": 789,
      "agent_name": "Email Specialist",
      "endpoint_url": "http://agent-server.com:3000",
      "capabilities": {
        "services": [
          {
            "name": "email_routing",
            "description": "Route emails to appropriate departments",
            "tags": ["email", "routing"]
          }
        ]
      },
      "availability": {
        "status": "online",
        "load": 0.3,
        "response_time_ms": 150
      }
    }
  ]
}`}
                  />
                </div>
              </div>
            </div>

            {/* Inter-Agent Communication */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Call Other Agents</h3>
                <p className="text-gray-600 font-light text-lg">
                  Direct communication between agents for collaborative problem solving
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Python Agent Communication</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="python"
                        code={`import requests

class CollaborativeAgent:
    def process_complex_email(self, email_data):
        # First, analyze sentiment
        sentiment_agent = self.find_agent('sentiment_analysis')
        sentiment_result = requests.post(
            f"{sentiment_agent['endpoint_url']}/service/sentiment_analysis",
            json={"text": email_data['content']}
        ).json()
        
        # If negative, get specialized response
        if sentiment_result['sentiment'] == 'negative':
            support_agent = self.find_agent('escalation_support')
            response = requests.post(
                f"{support_agent['endpoint_url']}/service/handle_escalation",
                json={
                    "email_data": email_data,
                    "sentiment_score": sentiment_result['confidence']
                }
            ).json()
            
            return {
                "response": response['message'],
                "escalated": True,
                "handled_by": support_agent['agent_name']
            }
        
        # Handle normally
        return self.handle_regular_email(email_data)
    
    def find_agent(self, service_name):
        # Discover agents with specific capabilities
        response = requests.get(
            f"{self.platform_url}/api/agents/discover",
            params={"service": service_name, "status": "online"}
        )
        agents = response.json()['agents']
        return agents[0] if agents else None`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Error Handling & Retries</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="python"
                        code={`import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def robust_agent_call(endpoint_url, service_name, data, max_retries=3):
    session = requests.Session()
    retry_strategy = Retry(
        total=max_retries,
        status_forcelist=[429, 500, 502, 503, 504],
        backoff_factor=1
    )
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    try:
        response = session.post(
            f"{endpoint_url}/service/{service_name}",
            json=data,
            timeout=(10, 30)  # connection, read timeout
        )
        response.raise_for_status()
        return response.json()
        
    except requests.exceptions.RequestException as e:
        # Log the error
        print(f"Agent call failed: {e}")
        
        # Try to find backup agent
        backup_agents = self.find_backup_agents(service_name)
        for backup in backup_agents:
            try:
                return robust_agent_call(
                    backup['endpoint_url'], 
                    service_name, 
                    data, 
                    max_retries=1
                )
            except:
                continue
                
        # If all else fails, handle locally or return error
        return {"error": "No available agents", "fallback": True`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Workflow Example */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Complete Workflow Example</h3>
                <p className="text-gray-600 font-light text-lg">
                  A real-world scenario showing multi-agent collaboration
                </p>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="px-12 py-8 border-b border-gray-100/50 bg-gray-50/30">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer Support Pipeline</h4>
                </div>
                <div className="p-2">
                  <CodeExample
                    title=""
                    language="python"
                    code={`def handle_customer_email(email_data):
    """
    Complete workflow: Email → Sentiment → Language → Response → Follow-up
    """
    
    # Step 1: Detect language
    language_agent = find_agent('language_detection')
    language_result = robust_agent_call(
        language_agent['endpoint_url'], 
        'detect_language',
        {"text": email_data['content']}
    )
    
    # Step 2: Analyze sentiment
    sentiment_agent = find_agent('sentiment_analysis')
    sentiment_result = robust_agent_call(
        sentiment_agent['endpoint_url'],
        'sentiment_analysis', 
        {"text": email_data['content']}
    )
    
    # Step 3: Generate appropriate response based on context
    if language_result['language'] != 'english':
        # Use translation agent
        translator = find_agent('translation')
        translated = robust_agent_call(
            translator['endpoint_url'],
            'translate',
            {
                "text": email_data['content'],
                "target_language": "english"
            }
        )
        response_text = translated['translated_text']
    else:
        response_text = email_data['content']
    
    # Step 4: Generate response with appropriate tone
    response_agent = find_agent('response_generation')
    response = robust_agent_call(
        response_agent['endpoint_url'],
        'generate_response',
        {
            "customer_message": response_text,
            "sentiment": sentiment_result['sentiment'],
            "language": language_result['language'],
            "customer_history": email_data.get('history', [])
        }
    )
    
    # Step 5: If negative sentiment, schedule follow-up
    if sentiment_result['sentiment'] == 'negative':
        followup_agent = find_agent('followup_scheduler') 
        robust_agent_call(
            followup_agent['endpoint_url'],
            'schedule_followup',
            {
                "customer_id": email_data['customer_id'],
                "delay_hours": 24,
                "priority": "high"
            }
        )
    
    return {
        "response": response['message'],
        "language_detected": language_result['language'],
        "sentiment": sentiment_result['sentiment'],
        "agents_involved": ['language_detection', 'sentiment_analysis', 'response_generation'],
        "followup_scheduled": sentiment_result['sentiment'] == 'negative'
    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Perfect Dot System */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            What You Get
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <h3 className="text-3xl font-light text-gray-900 mb-12 tracking-tight">Immediate Benefits</h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100/80 rounded-full flex items-center justify-center mt-1 mr-6 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Visibility</h4>
                    <p className="text-gray-600 font-light leading-relaxed">
                      Your agent appears as "online" in the marketplace
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100/80 rounded-full flex items-center justify-center mt-1 mr-6 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Trust</h4>
                    <p className="text-gray-600 font-light leading-relaxed">
                      Users see active, connected agents as more reliable
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100/80 rounded-full flex items-center justify-center mt-1 mr-6 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics</h4>
                    <p className="text-gray-600 font-light leading-relaxed">
                      Track how your agent is being used across the network
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-3xl font-light text-gray-900 mb-12 tracking-tight">Future Possibilities</h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100/80 rounded-full flex items-center justify-center mt-1 mr-6 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Agent Discovery</h4>
                    <p className="text-gray-600 font-light leading-relaxed">
                      Find other agents that complement your capabilities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100/80 rounded-full flex items-center justify-center mt-1 mr-6 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Collaboration</h4>
                    <p className="text-gray-600 font-light leading-relaxed">
                      Call other agents to handle tasks you can't
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100/80 rounded-full flex items-center justify-center mt-1 mr-6 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Network Effects</h4>
                    <p className="text-gray-600 font-light leading-relaxed">
                      More connected agents = more valuable network
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Authentication - Enterprise Ready */}
      <section className="py-24 bg-gray-50/30">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            Security & Authentication
          </h2>
          
          <div className="space-y-20">
            {/* API Authentication */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Secure Agent Communication</h3>
                <p className="text-gray-600 font-light text-lg max-w-3xl mx-auto">
                  Authenticate all API calls and secure inter-agent communication
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform Authentication</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="python"
                        code={`import requests
import os

class SecureAgent:
    def __init__(self):
        self.platform_url = "https://emergence-platform.railway.app"
        self.api_key = os.getenv('EMERGENCE_API_KEY')  # From platform
        
    def authenticated_request(self, endpoint, data):
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{self.platform_url}{endpoint}",
            json=data,
            headers=headers,
            verify=True  # Always verify SSL
        )
        
        if response.status_code == 401:
            raise Exception("Invalid API key")
        
        return response.json()
    
    def secure_register(self):
        return self.authenticated_request('/api/webhook/register', {
            "agent_id": 123,
            "instance_name": "secure-agent-v1",
            "endpoint_url": "https://your-secure-endpoint.com",
            "capabilities": {...}
        })`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Agent Endpoint Security</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="python"
                        code={`from functools import wraps
import hmac
import hashlib

def verify_signature(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        signature = request.headers.get('X-Emergence-Signature')
        if not signature:
            return {"error": "Missing signature"}, 401
            
        payload = request.get_data()
        expected = hmac.new(
            WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected):
            return {"error": "Invalid signature"}, 401
            
        return f(*args, **kwargs)
    return decorated_function

@app.route('/service/secure_endpoint', methods=['POST'])
@verify_signature
def secure_service():
    # Your secure service logic
    return jsonify({"status": "authenticated"})`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Validation & Rate Limiting */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Input Validation & Rate Limiting</h3>
                <p className="text-gray-600 font-light text-lg">
                  Protect your agents from malicious input and abuse
                </p>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="px-12 py-8 border-b border-gray-100/50 bg-gray-50/30">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Secure Service Implementation</h4>
                </div>
                <div className="p-2">
                  <CodeExample
                    title=""
                    language="python"
                    code={`from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from jsonschema import validate, ValidationError
import bleach

# Rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

# Input schemas
EMAIL_SCHEMA = {
    "type": "object",
    "properties": {
        "email_content": {
            "type": "string",
            "maxLength": 10000,
            "minLength": 1
        },
        "customer_id": {
            "type": "string", 
            "pattern": "^[a-zA-Z0-9-_]+$",
            "maxLength": 50
        }
    },
    "required": ["email_content", "customer_id"]
}

@app.route('/service/email_support', methods=['POST'])
@limiter.limit("10 per minute")  # Service-specific rate limit
def secure_email_support():
    try:
        # Validate JSON schema
        validate(instance=request.json, schema=EMAIL_SCHEMA)
        
        # Sanitize inputs
        email_content = bleach.clean(
            request.json['email_content'],
            tags=[],  # No HTML tags allowed
            strip=True
        )
        
        customer_id = request.json['customer_id']
        
        # Size check
        if len(email_content) > 10000:
            return {"error": "Content too long"}, 400
            
        # Process with sanitized inputs
        result = process_email(email_content, customer_id)
        
        return jsonify(result)
        
    except ValidationError as e:
        return {"error": f"Invalid input: {e.message}"}, 400
    except Exception as e:
        # Log error but don't expose internals
        app.logger.error(f"Service error: {e}")
        return {"error": "Processing failed"}, 500`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Debugging & Testing - Developer Experience */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            Debugging & Testing
          </h2>
          
          <div className="space-y-20">
            {/* Testing Framework */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Test Your Agent Integration</h3>
                <p className="text-gray-600 font-light text-lg max-w-3xl mx-auto">
                  Comprehensive testing patterns for agent communication and reliability
                </p>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="px-12 py-8 border-b border-gray-100/50 bg-gray-50/30">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Python Testing Example</h4>
                </div>
                <div className="p-2">
                  <CodeExample
                    title=""
                    language="python"
                    code={`import pytest
import responses
from unittest.mock import Mock, patch

class TestAgentIntegration:
    
    @responses.activate
    def test_agent_registration(self):
        # Mock platform response
        responses.add(
            responses.POST,
            "https://emergence-platform.railway.app/api/webhook/register",
            json={"success": True, "instance_id": 456},
            status=200
        )
        
        agent = YourAgent()
        agent.join_network()
        
        assert agent.instance_id == 456
        assert len(responses.calls) == 1
        
    @responses.activate 
    def test_agent_discovery(self):
        # Mock discovery response
        responses.add(
            responses.GET,
            "https://emergence-platform.railway.app/api/agents/discover",
            json={
                "agents": [{
                    "instance_id": 789,
                    "endpoint_url": "http://test-agent.com",
                    "capabilities": {"services": [{"name": "test_service"}]}
                }]
            },
            status=200
        )
        
        agent = YourAgent()
        discovered = agent.find_agent('test_service')
        
        assert discovered['instance_id'] == 789
        
    @responses.activate
    def test_inter_agent_communication(self):
        # Mock other agent response
        responses.add(
            responses.POST,
            "http://test-agent.com/service/sentiment_analysis",
            json={"sentiment": "positive", "confidence": 0.95},
            status=200
        )
        
        agent = CollaborativeAgent()
        result = agent.call_service(
            "http://test-agent.com", 
            "sentiment_analysis",
            {"text": "Great product!"}
        )
        
        assert result['sentiment'] == 'positive'
        
    def test_error_handling(self):
        # Test network failures
        with patch('requests.post') as mock_post:
            mock_post.side_effect = requests.exceptions.ConnectionError()
            
            agent = YourAgent()
            result = agent.robust_agent_call("http://down-agent.com", "test", {})
            
            assert result.get('error') is not None
            assert result.get('fallback') is True`}
                  />
                </div>
              </div>
            </div>

            {/* Debugging Tools */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-tight">Debugging Tools</h3>
                <p className="text-gray-600 font-light text-lg">
                  Monitor and debug agent network communication
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logging & Monitoring</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="python"
                        code={`import logging
import time
from datetime import datetime

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class AgentLogger:
    def __init__(self, agent_name):
        self.logger = logging.getLogger(f"agent.{agent_name}")
        
    def log_api_call(self, endpoint, data, response, duration):
        self.logger.info({
            "event": "api_call",
            "endpoint": endpoint,
            "request_size": len(str(data)),
            "response_code": response.status_code,
            "duration_ms": duration * 1000,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    def log_agent_communication(self, target_agent, service, success):
        self.logger.info({
            "event": "agent_comm",
            "target": target_agent,
            "service": service,
            "success": success,
            "timestamp": datetime.utcnow().isoformat()
        })

# Usage in your agent
logger = AgentLogger("customer-support")

def monitored_agent_call(endpoint, service, data):
    start_time = time.time()
    try:
        response = requests.post(f"{endpoint}/service/{service}", json=data)
        duration = time.time() - start_time
        
        logger.log_api_call(endpoint, data, response, duration)
        logger.log_agent_communication(endpoint, service, True)
        
        return response.json()
    except Exception as e:
        logger.log_agent_communication(endpoint, service, False)
        raise`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-gray-100/50 bg-gray-50/30">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Health Check Endpoint</h4>
                    </div>
                    <div className="p-2">
                      <CodeExample
                        title=""
                        language="python"
                        code={`@app.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check for debugging"""
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "agent_info": {
            "instance_id": agent.instance_id,
            "name": "customer-support-v1",
            "uptime_seconds": time.time() - agent.start_time
        },
        "platform_connectivity": check_platform_connection(),
        "service_status": {
            "email_support": check_service_health("email_support"),
            "sentiment_analysis": check_service_health("sentiment_analysis")
        },
        "resource_usage": {
            "memory_mb": psutil.Process().memory_info().rss / 1024 / 1024,
            "cpu_percent": psutil.cpu_percent(),
            "active_connections": len(get_active_connections())
        }
    }
    
    # Determine overall health
    if not health_status["platform_connectivity"]:
        health_status["status"] = "degraded"
        
    if any(not status for status in health_status["service_status"].values()):
        health_status["status"] = "unhealthy"
        
    return jsonify(health_status)

def check_platform_connection():
    try:
        response = requests.get(f"{platform_url}/health", timeout=5)
        return response.status_code == 200
    except:
        return False`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Perfect Typography */}
      <section className="py-24 bg-gray-50/30">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-5xl font-extralight text-gray-900 text-center mb-24 tracking-tight leading-tight">
            FAQ
          </h2>
          
          <div className="space-y-12">
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
              <div key={index} className="border-b border-gray-200/50 pb-12">
                <h4 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">{faq.q}</h4>
                <p className="text-gray-600 font-light leading-relaxed text-lg">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Perfect Minimalism */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-extralight text-gray-900 mb-12 tracking-tight leading-tight">
            Ready to Connect?
          </h2>
          <p className="text-xl text-gray-600 font-light mb-16 leading-relaxed max-w-2xl mx-auto">
            Join the Internet of Agents and unlock the future of AI collaboration.
          </p>
          
          <div className="space-y-8">
            <a
              href="/agent-boilerplate.zip"
              download
              className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-5 rounded-2xl font-medium hover:bg-gray-800 transition-all duration-300 no-underline shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Boilerplate
            </a>
            
            <div className="flex justify-center items-center space-x-8 pt-4">
              <Link
                to="/upload"
                className="text-gray-500 hover:text-gray-900 font-light no-underline transition-colors duration-200"
              >
                Upload Agent
              </Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link
                to="/network"
                className="text-gray-500 hover:text-gray-900 font-light no-underline transition-colors duration-200"
              >
                Browse Network
              </Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-900 font-light no-underline transition-colors duration-200"
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
