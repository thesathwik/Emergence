#!/usr/bin/env python3
"""
Test Agent A (Caller) - Tests our platform's agent discovery and messaging
This agent will:
1. Register itself with our platform
2. Discover other agents 
3. Send messages to Test Agent B
4. Verify responses
"""

import requests
import time
import json
from flask import Flask, request, jsonify
import threading

class TestAgentA:
    def __init__(self):
        self.agent_id = "test-agent-a"
        self.name = "Test Agent A (Caller)"
        self.port = 3001
        self.platform_url = "http://localhost:3333"  # Our platform
        self.app = Flask(__name__)
        self.setup_routes()
        
    def setup_routes(self):
        """Setup Flask routes for receiving messages"""
        @self.app.route('/health', methods=['GET'])
        def health():
            return jsonify({"status": "healthy", "agent_id": self.agent_id})
            
        @self.app.route('/message', methods=['POST'])
        def receive_message():
            data = request.json
            print(f"[Agent A] Received message: {data}")
            return jsonify({"status": "received", "agent_id": self.agent_id})
    
    def register_with_platform(self):
        """Register this agent with our platform"""
        print(f"[Agent A] Registering with platform at {self.platform_url}")
        
        agent_data = {
            "id": self.agent_id,
            "name": self.name,
            "capabilities": ["send_message", "test_communication"],
            "endpoint": f"http://localhost:{self.port}",
            "description": "Test agent that initiates conversations"
        }
        
        try:
            response = requests.post(
                f"{self.platform_url}/api/agents/register",
                json=agent_data,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"[Agent A] ✅ Successfully registered with platform")
                return True
            else:
                print(f"[Agent A] ❌ Registration failed: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"[Agent A] ❌ Could not connect to platform: {e}")
            return False
    
    def discover_agents(self):
        """Discover other agents through our platform"""
        print("[Agent A] Discovering other agents...")
        
        try:
            response = requests.get(
                f"{self.platform_url}/api/agents/discover/live",
                timeout=10
            )
            
            if response.status_code == 200:
                agents = response.json().get("agents", [])
                print(f"[Agent A] ✅ Found {len(agents)} agents")
                
                # Look for Test Agent B
                agent_b = None
                for agent in agents:
                    if "test-agent-b" in agent.get("id", "").lower():
                        agent_b = agent
                        break
                        
                if agent_b:
                    print(f"[Agent A] ✅ Found Test Agent B: {agent_b['endpoint']}")
                    return agent_b
                else:
                    print("[Agent A] ⚠️ Test Agent B not found")
                    return None
                    
            else:
                print(f"[Agent A] ❌ Discovery failed: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"[Agent A] ❌ Discovery error: {e}")
            return None
    
    def send_message_to_agent_b(self, agent_b_endpoint):
        """Send test message to Agent B"""
        print(f"[Agent A] Sending message to Agent B at {agent_b_endpoint}")
        
        message = {
            "from": self.agent_id,
            "to": "test-agent-b",
            "message": "Hello from Test Agent A",
            "timestamp": time.time(),
            "test": True
        }
        
        try:
            response = requests.post(
                f"{agent_b_endpoint}/message",
                json=message,
                timeout=5
            )
            
            if response.status_code == 200:
                print("[Agent A] ✅ Message sent successfully!")
                print(f"[Agent A] Response: {response.json()}")
                return True
            else:
                print(f"[Agent A] ❌ Message failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"[Agent A] ❌ Message error: {e}")
            return False
    
    def run_test_sequence(self):
        """Run the complete test sequence"""
        print("=" * 50)
        print("TEST AGENT A - STARTING PLATFORM TEST")
        print("=" * 50)
        
        # Step 1: Register with platform
        if not self.register_with_platform():
            print("[Agent A] ❌ FAILED: Could not register with platform")
            return False
            
        # Step 2: Wait a bit for registration to propagate
        print("[Agent A] Waiting 2 seconds...")
        time.sleep(2)
        
        # Step 3: Discover agents
        agent_b = self.discover_agents()
        if not agent_b:
            print("[Agent A] ❌ FAILED: Could not discover Agent B")
            return False
            
        # Step 4: Send message to Agent B
        if not self.send_message_to_agent_b(agent_b["endpoint"]):
            print("[Agent A] ❌ FAILED: Could not send message to Agent B")
            return False
            
        print("=" * 50)
        print("[Agent A] ✅ ALL TESTS PASSED!")
        print("Platform communication is working!")
        print("=" * 50)
        return True
    
    def start_server(self):
        """Start the Flask server"""
        print(f"[Agent A] Starting server on port {self.port}")
        self.app.run(host='0.0.0.0', port=self.port, debug=False)
    
    def run(self):
        """Main entry point"""
        # Start Flask server in background
        server_thread = threading.Thread(target=self.start_server)
        server_thread.daemon = True
        server_thread.start()
        
        # Wait for server to start
        time.sleep(1)
        
        # Run tests
        self.run_test_sequence()
        
        # Keep alive for a bit
        print("[Agent A] Keeping alive for 30 seconds...")
        time.sleep(30)

if __name__ == "__main__":
    agent = TestAgentA()
    agent.run()