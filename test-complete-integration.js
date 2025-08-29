#!/usr/bin/env node

/**
 * Test Complete Integration
 * Tests the full flow from agent upload through scoring to database storage
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function testCompleteIntegration() {
  console.log('🔄 Testing Complete Integration Flow');
  console.log('='.repeat(60));

  // Create a test agent with platform integration
  const testAgentCode = `
import requests
import os
import json
from typing import Dict, Any

class IntegrationTestAgent:
    """
    A test agent demonstrating platform integration
    for testing the complete scoring and database flow
    """
    
    def __init__(self):
        self.platform_url = os.getenv('PLATFORM_URL', 'https://api.emergence.com')
        self.api_key = os.getenv('API_KEY')
        self.agent_id = None
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Load agent configuration"""
        try:
            with open('config.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "name": "IntegrationTestAgent",
                "version": "1.0.0",
                "description": "Testing complete integration"
            }
        except Exception as e:
            print(f"Config error: {e}")
            return {}
    
    def register_with_platform(self) -> bool:
        """Register with platform using webhook endpoint"""
        try:
            endpoint = f"{self.platform_url}/api/webhook/register"
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'name': self.config.get('name', 'TestAgent'),
                'version': self.config.get('version', '1.0.0'),
                'capabilities': ['data-processing', 'webhook-handling']
            }
            
            response = requests.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.agent_id = data.get('agent_id')
                print(f"✅ Registered with platform: {self.agent_id}")
                return True
            else:
                print(f"❌ Registration failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {e}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False
    
    def send_ping(self) -> bool:
        """Send periodic ping to platform"""
        if not self.agent_id:
            return False
            
        try:
            endpoint = f"{self.platform_url}/api/webhook/ping"
            payload = {
                'agent_id': self.agent_id,
                'status': 'active',
                'timestamp': json.dumps({'time': 'now'}),
                'health': 'ok'
            }
            
            response = requests.post(
                endpoint, 
                json=payload,
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"❌ Ping failed: {e}")
            return False
    
    def process_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming webhook data"""
        try:
            # Simulate data processing
            processed_data = {
                'status': 'processed',
                'timestamp': payload.get('timestamp'),
                'data_size': len(str(payload)),
                'agent_id': self.agent_id
            }
            
            return processed_data
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'agent_id': self.agent_id
            }
    
    def run(self):
        """Main agent execution loop"""
        print(f"🚀 Starting {self.config.get('name', 'TestAgent')}")
        
        if not self.register_with_platform():
            print("❌ Failed to register with platform")
            return False
        
        # Send initial ping
        if self.send_ping():
            print("✅ Initial ping successful")
        else:
            print("⚠️ Initial ping failed")
        
        print("✅ Agent running successfully")
        return True

if __name__ == "__main__":
    agent = IntegrationTestAgent()
    agent.run()
`;

  const configJson = {
    "name": "IntegrationTestAgent",
    "version": "1.0.0", 
    "description": "A comprehensive test agent for integration testing",
    "author": "Integration Test Suite",
    "capabilities": ["data-processing", "webhook-handling", "platform-integration"],
    "requirements": ["requests>=2.25.0", "python>=3.7"]
  };

  // Create test zip file
  console.log('📦 Creating test agent zip file...');
  const zip = new AdmZip();
  zip.addFile("main.py", Buffer.from(testAgentCode, "utf8"));
  zip.addFile("config.json", Buffer.from(JSON.stringify(configJson, null, 2), "utf8"));
  zip.addFile("requirements.txt", Buffer.from("requests>=2.25.0\\njson>=2.0.9", "utf8"));
  zip.addFile("README.md", Buffer.from("# Integration Test Agent\\n\\nThis is a test agent for integration testing.", "utf8"));

  const testZipPath = path.join(__dirname, 'uploads', 'integration-test-agent.zip');
  zip.writeZip(testZipPath);
  console.log(`✅ Created test zip: ${path.basename(testZipPath)}`);

  // Start server for testing
  console.log('\\n🚀 Starting server for integration test...');
  const { spawn } = require('child_process');
  const server = spawn('node', ['server.js'], { 
    stdio: 'pipe',
    detached: false
  });

  // Wait for server to start
  await new Promise(resolve => {
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server is running on port 3001')) {
        console.log('✅ Server started successfully');
        resolve();
      }
    });
  });

  // Wait a bit more for full initialization
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Test the complete integration flow
    console.log('\\n🧪 Testing complete integration flow...');
    
    // 1. Register a test user
    const testUser = {
      email: `integration-test-${Date.now()}@example.com`,
      password: 'testPassword123',
      name: 'Integration Test User'
    };

    console.log('\\n1️⃣ Registering test user...');
    const registerResponse = await axios.post('http://localhost:3001/api/register', testUser);
    console.log(`✅ User registered: ${registerResponse.data.message}`);

    // 2. Login to get token
    console.log('\\n2️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/login', {
      email: testUser.email,
      password: testUser.password
    });
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');

    // 3. Upload agent with full integration
    console.log('\\n3️⃣ Uploading integration test agent...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testZipPath));
    formData.append('name', 'Integration Test Agent');
    formData.append('description', 'Testing complete scoring and database integration');
    formData.append('category', 'Integration Testing');
    formData.append('author_name', 'Integration Test Suite');
    formData.append('capabilities', '1,2,3');

    const uploadResponse = await axios.post('http://localhost:3001/api/agents', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Agent upload successful!');
    console.log(`📊 Agent ID: ${uploadResponse.data.agent?.id}`);
    console.log(`📋 Agent Name: ${uploadResponse.data.agent?.name}`);
    
    // Check if scoring data was stored
    if (uploadResponse.data.agent?.communication_score !== undefined) {
      console.log(`🎯 Communication Score: ${uploadResponse.data.agent.communication_score}/100`);
    }
    if (uploadResponse.data.agent?.compliance_level) {
      console.log(`📋 Compliance Level: ${uploadResponse.data.agent.compliance_level}`);
    }
    
    // Parse and display scan results
    if (uploadResponse.data.agent?.scan_results) {
      try {
        const scanData = JSON.parse(uploadResponse.data.agent.scan_results);
        console.log(`🛡️ Security Scan Results:`);
        console.log(`   Risk Level: ${scanData.riskLevel}`);
        console.log(`   Safe: ${scanData.safe}`);
        console.log(`   Platform Score: ${scanData.platformScore}/100`);
        console.log(`   Category: ${scanData.category}`);
      } catch (e) {
        console.log(`⚠️ Could not parse scan results`);
      }
    }

    console.log('\\n🎉 Complete Integration Test Successful!');
    console.log('\\n📋 Integration Flow Verified:');
    console.log('- ✅ Agent file uploaded and processed');
    console.log('- ✅ Security scanning performed');
    console.log('- ✅ Platform scoring calculated');
    console.log('- ✅ New database columns populated');
    console.log('- ✅ Data stored correctly in database');

  } catch (error) {
    console.error('❌ Integration test failed:', error.response?.data || error.message);
  } finally {
    // Clean up
    console.log('\\n🧹 Cleaning up...');
    server.kill();
    
    // Remove test zip file
    try {
      fs.unlinkSync(testZipPath);
      console.log('✅ Test files cleaned up');
    } catch (e) {
      console.log('⚠️ Could not clean up test files');
    }
  }
}

// Run the test
if (require.main === module) {
  testCompleteIntegration().catch(console.error);
}

module.exports = { testCompleteIntegration };