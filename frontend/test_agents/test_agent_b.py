#!/usr/bin/env python3
"""
Test Agent B (Responder) - Tests our platform's agent registration and messaging
This agent will:
1. Register itself with our platform  
2. Listen for messages from other agents
3. Respond to Test Agent A
4. Verify platform connectivity
"""

import requests
import time
import json
from flask import Flask, request, jsonify
import threading

class TestAgentB:
    def __init__(self):
        self.agent_id = "test-agent-b"
        self.name = "Test Agent B (Responder)"
        self.port = 3002
        self.platform_url = "http://localhost:3333"  # Our platform
        self.app = Flask(__name__)
        self.setup_routes()
        
    def setup_routes(self):
        """Setup Flask routes for receiving messages"""
        @self.app.route('/health', methods=['GET'])
        def health():
            return jsonify({
                "status": "healthy", 
                "agent_id": self.agent_id,
                "capabilities": ["receive_message", "respond_to_tests"]
            })
            
        @self.app.route('/message', methods=['POST'])
        def receive_message():
            data = request.json
            print(f"[Agent B] 📨 Received message from {data.get('from', 'unknown')}")
            print(f"[Agent B] Message content: {data.get('message', '')}")
            
            # Send response back to sender
            response_data = {
                "status": "received",
                "agent_id": self.agent_id,
                "response_to": data.get('from'),
                "message": "Hello back from Test Agent B!",
                "timestamp": time.time(),
                "original_message": data.get('message')
            }
            
            print(f"[Agent B] ✅ Responding with: {response_data['message']}")
            return jsonify(response_data)
    
    def register_with_platform(self):
        """Register this agent with our platform"""
        print(f"[Agent B] Registering with platform at {self.platform_url}")
        
        agent_data = {
            "id": self.agent_id,
            "name": self.name,
            "capabilities": ["receive_message", "respond_to_tests", "echo_messages"],
            "endpoint": f"http://localhost:{self.port}",
            "description": "Test agent that responds to messages"
        }
        
        try:
            response = requests.post(
                f"{self.platform_url}/api/agents/register",
                json=agent_data,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"[Agent B] ✅ Successfully registered with platform")
                return True
            else:
                print(f"[Agent B] ❌ Registration failed: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"[Agent B] ❌ Could not connect to platform: {e}")
            return False
    
    def test_platform_connection(self):
        """Test basic connectivity to our platform"""
        print("[Agent B] Testing platform connectivity...")
        
        try:
            # Test health endpoint
            response = requests.get(f"{self.platform_url}/api/health", timeout=5)
            if response.status_code == 200:
                print("[Agent B] ✅ Platform health check passed")
                return True
            else:
                print(f"[Agent B] ❌ Platform health check failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"[Agent B] ❌ Platform connection error: {e}")
            return False
    
    def verify_registration(self):
        """Verify we appear in the agent list"""
        print("[Agent B] Verifying registration...")
        
        try:
            response = requests.get(f"{self.platform_url}/api/agents/discover/live", timeout=10)
            if response.status_code == 200:
                agents = response.json().get("agents", [])
                
                # Check if we're in the list
                found_self = False
                for agent in agents:
                    if agent.get("id") == self.agent_id:
                        found_self = True
                        print(f"[Agent B] ✅ Found myself in agent list")
                        print(f"[Agent B] My endpoint: {agent.get('endpoint')}")
                        break
                
                if not found_self:
                    print("[Agent B] ⚠️ Not found in agent list yet")
                    
                return found_self
                
            else:
                print(f"[Agent B] ❌ Could not fetch agent list: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"[Agent B] ❌ Verification error: {e}")
            return False
    
    def run_startup_sequence(self):
        """Run startup tests"""
        print("=" * 50)
        print("TEST AGENT B - STARTING UP")
        print("=" * 50)
        
        # Step 1: Test platform connection
        if not self.test_platform_connection():
            print("[Agent B] ❌ FAILED: Platform not accessible")
            return False
            
        # Step 2: Register with platform
        if not self.register_with_platform():
            print("[Agent B] ❌ FAILED: Could not register")
            return False
            
        # Step 3: Wait and verify registration
        print("[Agent B] Waiting 3 seconds for registration to propagate...")
        time.sleep(3)
        
        if not self.verify_registration():
            print("[Agent B] ⚠️ WARNING: Registration not verified (may still work)")
            
        print("=" * 50)
        print("[Agent B] ✅ STARTUP COMPLETE")
        print("Ready to receive messages from Agent A")
        print("=" * 50)
        return True
    
    def start_server(self):
        """Start the Flask server"""
        print(f"[Agent B] Starting server on port {self.port}")
        self.app.run(host='0.0.0.0', port=self.port, debug=False)
    
    def run(self):
        """Main entry point"""
        # Start Flask server in background
        server_thread = threading.Thread(target=self.start_server)
        server_thread.daemon = True
        server_thread.start()
        
        # Wait for server to start
        time.sleep(1)
        
        # Run startup tests
        if self.run_startup_sequence():
            print("[Agent B] 🎯 Ready and waiting for messages...")
            
            # Keep running and listening
            try:
                while True:
                    time.sleep(10)
                    print("[Agent B] 💓 Still alive and listening...")
            except KeyboardInterrupt:
                print("[Agent B] 👋 Shutting down...")
        else:
            print("[Agent B] ❌ Startup failed!")

if __name__ == "__main__":
    agent = TestAgentB()
    agent.run()